-- ====================================================================
-- MIGRATION 3: Secured PostgreSQL Functions & Anti-Overselling RPCs
-- ====================================================================

-- Function to clean up expired reservations and return reserved inventory to available inventory
CREATE OR REPLACE FUNCTION public.cleanup_expired_reservations(p_ticket_type_id UUID DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT id, ticket_type_id, quantity 
        FROM public.ticket_reservations
        WHERE expires_at < now() 
          AND (p_ticket_type_id IS NULL OR ticket_type_id = p_ticket_type_id)
        FOR UPDATE
    LOOP
        -- Restore inventory
        UPDATE public.ticket_types
        SET 
            available_inventory = available_inventory + r.quantity,
            reserved_inventory = GREATEST(0, reserved_inventory - r.quantity)
        WHERE id = r.ticket_type_id;

        -- Remove reservation record
        DELETE FROM public.ticket_reservations WHERE id = r.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely reserve ticket inventory with row-level locks
CREATE OR REPLACE FUNCTION public.reserve_ticket_inventory(
    p_ticket_type_id UUID,
    p_quantity INT,
    p_session_id TEXT,
    p_user_id UUID DEFAULT NULL,
    p_expires_seconds INT DEFAULT 600
)
RETURNS JSONB AS $$
DECLARE
    v_ticket_type public.ticket_types%ROWTYPE;
    v_reservation_id UUID;
    v_expires_at TIMESTAMPTZ;
BEGIN
    -- Input validation
    IF p_quantity <= 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid quantity requested.');
    END IF;

    -- Clean up any existing expired reservations for this ticket type first
    PERFORM public.cleanup_expired_reservations(p_ticket_type_id);

    -- Row lock on the ticket type to guarantee strict serialization
    SELECT * INTO v_ticket_type
    FROM public.ticket_types
    WHERE id = p_ticket_type_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Ticket type not found.');
    END IF;

    IF NOT v_ticket_type.is_active THEN
        RETURN jsonb_build_object('success', false, 'message', 'Ticket type is no longer active.');
    END IF;

    -- Check sales window if set
    IF v_ticket_type.sales_start_date IS NOT NULL AND now() < v_ticket_type.sales_start_date THEN
        RETURN jsonb_build_object('success', false, 'message', 'Ticket sales have not opened yet.');
    END IF;

    IF v_ticket_type.sales_end_date IS NOT NULL AND now() > v_ticket_type.sales_end_date THEN
        RETURN jsonb_build_object('success', false, 'message', 'Ticket sales have ended.');
    END IF;

    -- Check max per order
    IF p_quantity > v_ticket_type.max_per_order THEN
        RETURN jsonb_build_object('success', false, 'message', format('Maximum limit is %s tickets per order.', v_ticket_type.max_per_order));
    END IF;

    -- Check inventory availability
    IF v_ticket_type.available_inventory < p_quantity THEN
        RETURN jsonb_build_object(
            'success', false, 
            'message', 'Not enough tickets available.',
            'remaining_available', v_ticket_type.available_inventory
        );
    END IF;

    -- Decrement available inventory and increment reserved inventory
    UPDATE public.ticket_types
    SET 
        available_inventory = available_inventory - p_quantity,
        reserved_inventory = reserved_inventory + p_quantity,
        updated_at = now()
    WHERE id = p_ticket_type_id;

    -- Insert reservation
    v_expires_at := now() + (p_expires_seconds || ' seconds')::interval;
    INSERT INTO public.ticket_reservations (ticket_type_id, user_id, session_id, quantity, expires_at)
    VALUES (p_ticket_type_id, p_user_id, p_session_id, p_quantity, v_expires_at)
    RETURNING id INTO v_reservation_id;

    RETURN jsonb_build_object(
        'success', true,
        'reservation_id', v_reservation_id,
        'expires_at', v_expires_at,
        'ticket_type_id', p_ticket_type_id,
        'name', v_ticket_type.name,
        'price', v_ticket_type.price,
        'currency', v_ticket_type.currency,
        'quantity', p_quantity
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to release a specific reservation (e.g. user cancelled or checkout was abandoned)
CREATE OR REPLACE FUNCTION public.release_ticket_reservation(p_reservation_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_res RECORD;
BEGIN
    SELECT * INTO v_res 
    FROM public.ticket_reservations 
    WHERE id = p_reservation_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Reservation not found or already released.');
    END IF;

    -- Restore inventory
    UPDATE public.ticket_types
    SET 
        available_inventory = available_inventory + v_res.quantity,
        reserved_inventory = GREATEST(0, reserved_inventory - v_res.quantity),
        updated_at = now()
    WHERE id = v_res.ticket_type_id;

    DELETE FROM public.ticket_reservations WHERE id = p_reservation_id;

    RETURN jsonb_build_object('success', true, 'message', 'Reservation successfully released.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete order and issue tickets (Idempotent: safe against duplicate webhooks)
CREATE OR REPLACE FUNCTION public.complete_order_and_issue_tickets(
    p_order_id UUID,
    p_payment_intent_id TEXT,
    p_payment_account_id TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_order RECORD;
    v_item RECORD;
    v_ticket_count INT := 0;
    v_i INT;
    v_ticket_code TEXT;
    v_security_hash TEXT;
    v_qr_payload TEXT;
BEGIN
    -- Lock order row
    SELECT * INTO v_order
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Order not found.');
    END IF;

    -- IDEMPOTENCY CHECK: If order already paid, return success without duplicate ticket issuance
    IF v_order.payment_status = 'paid' THEN
        RETURN jsonb_build_object(
            'success', true, 
            'message', 'Order already completed and fulfilled.', 
            'order_id', p_order_id,
            'order_number', v_order.order_number,
            'idempotent', true
        );
    END IF;

    -- Mark order as paid
    UPDATE public.orders
    SET 
        payment_status = 'paid',
        status = 'completed',
        payment_intent_id = COALESCE(p_payment_intent_id, payment_intent_id),
        payment_gateway_account_id = COALESCE(p_payment_account_id, payment_gateway_account_id),
        paid_at = now(),
        updated_at = now()
    WHERE id = p_order_id;

    -- Loop through order items and issue individual admission tickets
    FOR v_item IN 
        SELECT oi.*, tt.name as ticket_name 
        FROM public.order_items oi
        JOIN public.ticket_types tt ON tt.id = oi.ticket_type_id
        WHERE oi.order_id = p_order_id
    LOOP
        -- Finalize reserved inventory for this ticket type
        UPDATE public.ticket_types
        SET 
            reserved_inventory = GREATEST(0, reserved_inventory - v_item.quantity),
            updated_at = now()
        WHERE id = v_item.ticket_type_id;

        -- Create unique tickets for each quantity
        FOR v_i IN 1..v_item.quantity LOOP
            v_ticket_code := 'TKT-' || upper(substr(md5(random()::text), 1, 4)) || '-' || upper(substr(md5(clock_timestamp()::text), 1, 4));
            v_security_hash := encode(digest(v_ticket_code || '-' || p_order_id || '-' || v_item.id, 'sha256'), 'hex');
            v_qr_payload := jsonb_build_object(
                'code', v_ticket_code,
                'order_id', p_order_id,
                'hash', substr(v_security_hash, 1, 16)
            )::text;

            INSERT INTO public.issued_tickets (
                ticket_code,
                order_id,
                order_item_id,
                event_id,
                ticket_type_id,
                customer_id,
                attendee_name,
                attendee_email,
                qr_code_data,
                security_hash,
                status
            ) VALUES (
                v_ticket_code,
                p_order_id,
                v_item.id,
                v_order.event_id,
                v_item.ticket_type_id,
                v_order.customer_id,
                v_order.customer_name,
                v_order.customer_email,
                v_qr_payload,
                v_security_hash,
                'valid'
            );

            v_ticket_count := v_ticket_count + 1;
        END LOOP;
    END LOOP;

    -- Record audit log
    INSERT INTO public.audit_logs (
        actor_id,
        action,
        target_type,
        target_id,
        new_data
    ) VALUES (
        v_order.customer_id,
        'ORDER_FULFILLED',
        'order',
        p_order_id::text,
        jsonb_build_object(
            'order_number', v_order.order_number,
            'tickets_issued', v_ticket_count,
            'payment_intent_id', p_payment_intent_id
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Tickets successfully issued.',
        'order_id', p_order_id,
        'order_number', v_order.order_number,
        'tickets_count', v_ticket_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate and check in a ticket (Prevents duplicate check-ins)
CREATE OR REPLACE FUNCTION public.validate_ticket_scan(
    p_ticket_code TEXT,
    p_scanner_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_ticket RECORD;
    v_event RECORD;
    v_is_authorized BOOLEAN := false;
BEGIN
    SELECT t.*, e.title as event_title, e.owner_user_id, e.organizer_id, tt.name as ticket_type_name
    INTO v_ticket
    FROM public.issued_tickets t
    JOIN public.events e ON e.id = t.event_id
    JOIN public.ticket_types tt ON tt.id = t.ticket_type_id
    WHERE t.ticket_code = p_ticket_code
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'status', 'not_found',
            'message', 'Invalid Ticket Code. No matching ticket found.'
        );
    END IF;

    -- Verify scanning authorization: must be event owner, organizer staff, or super admin
    IF v_ticket.owner_user_id = p_scanner_user_id THEN
        v_is_authorized := true;
    ELSIF EXISTS (SELECT 1 FROM public.profiles WHERE id = p_scanner_user_id AND role = 'super_admin') THEN
        v_is_authorized := true;
    ELSIF EXISTS (SELECT 1 FROM public.organizers WHERE id = v_ticket.organizer_id AND user_id = p_scanner_user_id) THEN
        v_is_authorized := true;
    END IF;

    IF NOT v_is_authorized THEN
        RETURN jsonb_build_object(
            'success', false,
            'status', 'unauthorized',
            'message', 'You do not have permission to check in tickets for this event.'
        );
    END IF;

    -- Check if ticket is already checked in (Duplicate check-in prevention)
    IF v_ticket.status = 'checked_in' THEN
        RETURN jsonb_build_object(
            'success', false,
            'status', 'already_checked_in',
            'message', format('Warning: Ticket already checked in on %s.', to_char(v_ticket.checked_in_at, 'YYYY-MM-DD HH24:MI:SS UTC')),
            'ticket_code', v_ticket.ticket_code,
            'attendee_name', v_ticket.attendee_name,
            'checked_in_at', v_ticket.checked_in_at
        );
    END IF;

    -- Check if ticket is refunded or cancelled
    IF v_ticket.status IN ('refunded', 'cancelled') THEN
        RETURN jsonb_build_object(
            'success', false,
            'status', 'invalid',
            'message', format('Access Denied: Ticket is %s.', v_ticket.status),
            'ticket_code', v_ticket.ticket_code
        );
    END IF;

    -- Ticket is valid -> Check it in
    UPDATE public.issued_tickets
    SET 
        status = 'checked_in',
        checked_in_at = now(),
        checked_in_by = p_scanner_user_id,
        updated_at = now()
    WHERE id = v_ticket.id;

    -- Audit log
    INSERT INTO public.audit_logs (actor_id, action, target_type, target_id, new_data)
    VALUES (
        p_scanner_user_id,
        'TICKET_CHECKED_IN',
        'issued_ticket',
        v_ticket.id::text,
        jsonb_build_object('ticket_code', v_ticket.ticket_code, 'event_id', v_ticket.event_id)
    );

    RETURN jsonb_build_object(
        'success', true,
        'status', 'checked_in',
        'message', 'Ticket successfully validated and checked in!',
        'ticket_code', v_ticket.ticket_code,
        'attendee_name', v_ticket.attendee_name,
        'attendee_email', v_ticket.attendee_email,
        'event_title', v_ticket.event_title,
        'ticket_type', v_ticket.ticket_type_name,
        'checked_in_at', now()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle refunds and invalidate tickets
CREATE OR REPLACE FUNCTION public.process_order_refund(
    p_order_id UUID,
    p_refund_amount NUMERIC(10, 2),
    p_reason TEXT,
    p_processed_by UUID,
    p_gateway_refund_id TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_order RECORD;
    v_refund_id UUID;
BEGIN
    SELECT * INTO v_order
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Order not found.');
    END IF;

    IF v_order.payment_status != 'paid' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Order cannot be refunded as it has not been paid.');
    END IF;

    -- Insert refund record
    INSERT INTO public.refunds (
        order_id,
        amount,
        currency,
        reason,
        status,
        gateway_refund_id,
        processed_by
    ) VALUES (
        p_order_id,
        p_refund_amount,
        v_order.currency,
        p_reason,
        'succeeded',
        p_gateway_refund_id,
        p_processed_by
    ) RETURNING id INTO v_refund_id;

    -- Update order status
    UPDATE public.orders
    SET 
        status = CASE WHEN p_refund_amount >= v_order.total_amount THEN 'refunded' ELSE 'partially_refunded' END,
        payment_status = 'refunded',
        updated_at = now()
    WHERE id = p_order_id;

    -- Invalidate all issued tickets for this order
    UPDATE public.issued_tickets
    SET 
        status = 'refunded',
        updated_at = now()
    WHERE order_id = p_order_id;

    -- Audit log
    INSERT INTO public.audit_logs (
        actor_id,
        action,
        target_type,
        target_id,
        new_data
    ) VALUES (
        p_processed_by,
        'ORDER_REFUNDED',
        'order',
        p_order_id::text,
        jsonb_build_object(
            'refund_id', v_refund_id,
            'amount', p_refund_amount,
            'reason', p_reason,
            'gateway_refund_id', p_gateway_refund_id
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'refund_id', v_refund_id,
        'message', 'Refund recorded and tickets invalidated successfully.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
