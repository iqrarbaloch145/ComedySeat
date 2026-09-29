-- ====================================================================
-- COMPLETE SUPABASE SETUP SCRIPT: EventHub Multi-Vendor Platform
-- Run this in your Supabase SQL Editor to execute all tables,
-- functions, RLS policies, storage buckets, and seed data in one step!
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLES & SCHEMA
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'organizer', 'super_admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.raw_user_meta_data->>'avatar_url',
        CASE 
            WHEN new.raw_user_meta_data->>'role' = 'organizer' THEN 'organizer'
            ELSE 'customer'
        END
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE TABLE IF NOT EXISTS public.organizers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    bio TEXT,
    logo_url TEXT,
    banner_url TEXT,
    website TEXT,
    support_email TEXT,
    support_phone TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended', 'rejected')),
    stripe_account_id TEXT,
    stripe_account_status TEXT NOT NULL DEFAULT 'not_connected' CHECK (stripe_account_status IN ('not_connected', 'incomplete', 'active', 'restricted')),
    charges_enabled BOOLEAN NOT NULL DEFAULT false,
    payouts_enabled BOOLEAN NOT NULL DEFAULT false,
    country TEXT NOT NULL DEFAULT 'US',
    currency TEXT NOT NULL DEFAULT 'usd',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.event_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES public.organizers(id) ON DELETE CASCADE,
    owner_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    cover_image_url TEXT,
    gallery_urls TEXT[] NOT NULL DEFAULT '{}',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    event_type TEXT NOT NULL DEFAULT 'in_person' CHECK (event_type IN ('in_person', 'online', 'hybrid')),
    venue_name TEXT,
    venue_address TEXT,
    venue_city TEXT,
    venue_country TEXT,
    online_url TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'published', 'cancelled', 'completed', 'archived')),
    refund_policy TEXT NOT NULL DEFAULT 'Non-refundable within 48 hours of event start.',
    booking_conditions TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.ticket_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
    currency TEXT NOT NULL DEFAULT 'usd',
    total_inventory INT NOT NULL CHECK (total_inventory >= 0),
    available_inventory INT NOT NULL CHECK (available_inventory >= 0),
    reserved_inventory INT NOT NULL DEFAULT 0 CHECK (reserved_inventory >= 0),
    max_per_order INT NOT NULL DEFAULT 5 CHECK (max_per_order > 0),
    sales_start_date TIMESTAMPTZ,
    sales_end_date TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.ticket_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_type_id UUID NOT NULL REFERENCES public.ticket_types(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    session_id TEXT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    organizer_id UUID NOT NULL REFERENCES public.organizers(id) ON DELETE RESTRICT,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    currency TEXT NOT NULL DEFAULT 'usd',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded', 'disputed')),
    payment_method TEXT NOT NULL DEFAULT 'stripe',
    payment_gateway_account_id TEXT NOT NULL,
    payment_intent_id TEXT UNIQUE,
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'failed', 'refunded')),
    paid_at TIMESTAMPTZ,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    idempotency_key TEXT UNIQUE,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    ticket_type_id UUID NOT NULL REFERENCES public.ticket_types(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.issued_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_code TEXT NOT NULL UNIQUE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    ticket_type_id UUID NOT NULL REFERENCES public.ticket_types(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    attendee_name TEXT NOT NULL,
    attendee_email TEXT NOT NULL,
    qr_code_data TEXT NOT NULL,
    security_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'checked_in', 'cancelled', 'refunded')),
    checked_in_at TIMESTAMPTZ,
    checked_in_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'usd',
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed')),
    gateway_refund_id TEXT,
    processed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issued_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop existing policies if re-running
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Super admin has full control over profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Public can view active organizers" ON public.organizers;
    DROP POLICY IF EXISTS "Users can create organizer profile for themselves" ON public.organizers;
    DROP POLICY IF EXISTS "Organizers can update their own profile" ON public.organizers;
    DROP POLICY IF EXISTS "Super admin has full control on organizers" ON public.organizers;
    DROP POLICY IF EXISTS "Anyone can view active categories" ON public.event_categories;
    DROP POLICY IF EXISTS "Super admin can manage categories" ON public.event_categories;
    DROP POLICY IF EXISTS "Visitors can view published events" ON public.events;
    DROP POLICY IF EXISTS "Organizers can create events" ON public.events;
    DROP POLICY IF EXISTS "Organizers can update own events" ON public.events;
    DROP POLICY IF EXISTS "Organizers can delete own events" ON public.events;
    DROP POLICY IF EXISTS "Public can view active ticket types for visible events" ON public.ticket_types;
    DROP POLICY IF EXISTS "Organizers can manage ticket types for their events" ON public.ticket_types;
    DROP POLICY IF EXISTS "Users can view their own reservations" ON public.ticket_reservations;
    DROP POLICY IF EXISTS "Customers view own orders" ON public.orders;
    DROP POLICY IF EXISTS "Super admin can update orders" ON public.orders;
    DROP POLICY IF EXISTS "Order items viewable by order participants or admin" ON public.order_items;
    DROP POLICY IF EXISTS "Issued tickets viewable by customer, event organizer, or admin" ON public.issued_tickets;
    DROP POLICY IF EXISTS "Organizers can check-in tickets for their own events" ON public.issued_tickets;
    DROP POLICY IF EXISTS "Refunds viewable by customer, organizer, or admin" ON public.refunds;
    DROP POLICY IF EXISTS "Organizers and admins can manage refunds" ON public.refunds;
    DROP POLICY IF EXISTS "Audit logs only viewable by Super Admin" ON public.audit_logs;
    DROP POLICY IF EXISTS "Platform settings viewable by everyone" ON public.platform_settings;
    DROP POLICY IF EXISTS "Platform settings manageable only by Super Admin" ON public.platform_settings;
END $$;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id AND (
        CASE WHEN (SELECT role FROM public.profiles WHERE id = auth.uid()) != 'super_admin' 
        THEN role IN ('customer', 'organizer') ELSE true END
    )
);
CREATE POLICY "Super admin has full control over profiles" ON public.profiles FOR ALL USING (public.is_super_admin());

-- Organizers Policies
CREATE POLICY "Public can view active organizers" ON public.organizers FOR SELECT USING (status = 'active' OR auth.uid() = user_id OR public.is_super_admin());
CREATE POLICY "Users can create organizer profile for themselves" ON public.organizers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Organizers can update their own profile" ON public.organizers FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND (status = (SELECT status FROM public.organizers WHERE user_id = auth.uid()) OR public.is_super_admin()));
CREATE POLICY "Super admin has full control on organizers" ON public.organizers FOR ALL USING (public.is_super_admin());

-- Categories Policies
CREATE POLICY "Anyone can view active categories" ON public.event_categories FOR SELECT USING (is_active = true OR public.is_super_admin());
CREATE POLICY "Super admin can manage categories" ON public.event_categories FOR ALL USING (public.is_super_admin());

-- Events Policies
CREATE POLICY "Visitors can view published events" ON public.events FOR SELECT USING (status = 'published' OR owner_user_id = auth.uid() OR public.is_super_admin());
CREATE POLICY "Organizers can create events" ON public.events FOR INSERT WITH CHECK (owner_user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.organizers WHERE id = organizer_id AND user_id = auth.uid() AND status = 'active'));
CREATE POLICY "Organizers can update own events" ON public.events FOR UPDATE USING (owner_user_id = auth.uid() OR public.is_super_admin()) WITH CHECK (public.is_super_admin() OR owner_user_id = auth.uid());
CREATE POLICY "Organizers can delete own events" ON public.events FOR DELETE USING (owner_user_id = auth.uid() OR public.is_super_admin());

-- Ticket Types Policies
CREATE POLICY "Public can view active ticket types for visible events" ON public.ticket_types FOR SELECT USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = ticket_types.event_id AND (events.status = 'published' OR events.owner_user_id = auth.uid() OR public.is_super_admin())));
CREATE POLICY "Organizers can manage ticket types for their events" ON public.ticket_types FOR ALL USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = ticket_types.event_id AND (events.owner_user_id = auth.uid() OR public.is_super_admin())));

-- Reservations Policies
CREATE POLICY "Users can view their own reservations" ON public.ticket_reservations FOR SELECT USING (user_id = auth.uid() OR public.is_super_admin());

-- Orders Policies
CREATE POLICY "Customers view own orders" ON public.orders FOR SELECT USING (customer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.organizers WHERE organizers.id = orders.organizer_id AND organizers.user_id = auth.uid()) OR public.is_super_admin());
CREATE POLICY "Super admin can update orders" ON public.orders FOR ALL USING (public.is_super_admin());

-- Order Items Policies
CREATE POLICY "Order items viewable by order participants or admin" ON public.order_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (orders.customer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.organizers WHERE organizers.id = orders.organizer_id AND organizers.user_id = auth.uid()) OR public.is_super_admin())));

-- Issued Tickets Policies
CREATE POLICY "Issued tickets viewable by customer, event organizer, or admin" ON public.issued_tickets FOR SELECT USING (customer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.events WHERE events.id = issued_tickets.event_id AND (events.owner_user_id = auth.uid() OR public.is_super_admin())));
CREATE POLICY "Organizers can check-in tickets for their own events" ON public.issued_tickets FOR UPDATE USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = issued_tickets.event_id AND (events.owner_user_id = auth.uid() OR public.is_super_admin()))) WITH CHECK (EXISTS (SELECT 1 FROM public.events WHERE events.id = issued_tickets.event_id AND (events.owner_user_id = auth.uid() OR public.is_super_admin())));

-- Refunds Policies
CREATE POLICY "Refunds viewable by customer, organizer, or admin" ON public.refunds FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = refunds.order_id AND (orders.customer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.organizers WHERE organizers.id = orders.organizer_id AND organizers.user_id = auth.uid()) OR public.is_super_admin())));
CREATE POLICY "Organizers and admins can manage refunds" ON public.refunds FOR ALL USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = refunds.order_id AND (EXISTS (SELECT 1 FROM public.organizers WHERE organizers.id = orders.organizer_id AND organizers.user_id = auth.uid()) OR public.is_super_admin())));

-- Audit Logs Policies
CREATE POLICY "Audit logs only viewable by Super Admin" ON public.audit_logs FOR SELECT USING (public.is_super_admin());

-- Platform Settings Policies
CREATE POLICY "Platform settings viewable by everyone" ON public.platform_settings FOR SELECT USING (true);
CREATE POLICY "Platform settings manageable only by Super Admin" ON public.platform_settings FOR ALL USING (public.is_super_admin());

-- 4. RPC FUNCTIONS
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
        UPDATE public.ticket_types
        SET 
            available_inventory = available_inventory + r.quantity,
            reserved_inventory = GREATEST(0, reserved_inventory - r.quantity)
        WHERE id = r.ticket_type_id;

        DELETE FROM public.ticket_reservations WHERE id = r.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
    IF p_quantity <= 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid quantity requested.');
    END IF;

    PERFORM public.cleanup_expired_reservations(p_ticket_type_id);

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

    IF v_ticket_type.sales_start_date IS NOT NULL AND now() < v_ticket_type.sales_start_date THEN
        RETURN jsonb_build_object('success', false, 'message', 'Ticket sales have not opened yet.');
    END IF;

    IF v_ticket_type.sales_end_date IS NOT NULL AND now() > v_ticket_type.sales_end_date THEN
        RETURN jsonb_build_object('success', false, 'message', 'Ticket sales have ended.');
    END IF;

    IF p_quantity > v_ticket_type.max_per_order THEN
        RETURN jsonb_build_object('success', false, 'message', format('Maximum limit is %s tickets per order.', v_ticket_type.max_per_order));
    END IF;

    IF v_ticket_type.available_inventory < p_quantity THEN
        RETURN jsonb_build_object(
            'success', false, 
            'message', 'Not enough tickets available.',
            'remaining_available', v_ticket_type.available_inventory
        );
    END IF;

    UPDATE public.ticket_types
    SET 
        available_inventory = available_inventory - p_quantity,
        reserved_inventory = reserved_inventory + p_quantity,
        updated_at = now()
    WHERE id = p_ticket_type_id;

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
    SELECT * INTO v_order
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Order not found.');
    END IF;

    IF v_order.payment_status = 'paid' THEN
        RETURN jsonb_build_object(
            'success', true, 
            'message', 'Order already completed and fulfilled.', 
            'order_id', p_order_id,
            'order_number', v_order.order_number,
            'idempotent', true
        );
    END IF;

    UPDATE public.orders
    SET 
        payment_status = 'paid',
        status = 'completed',
        payment_intent_id = COALESCE(p_payment_intent_id, payment_intent_id),
        payment_gateway_account_id = COALESCE(p_payment_account_id, payment_gateway_account_id),
        paid_at = now(),
        updated_at = now()
    WHERE id = p_order_id;

    FOR v_item IN 
        SELECT oi.*, tt.name as ticket_name 
        FROM public.order_items oi
        JOIN public.ticket_types tt ON tt.id = oi.ticket_type_id
        WHERE oi.order_id = p_order_id
    LOOP
        UPDATE public.ticket_types
        SET 
            reserved_inventory = GREATEST(0, reserved_inventory - v_item.quantity),
            updated_at = now()
        WHERE id = v_item.ticket_type_id;

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

CREATE OR REPLACE FUNCTION public.validate_ticket_scan(
    p_ticket_code TEXT,
    p_scanner_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_ticket RECORD;
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

    IF v_ticket.status IN ('refunded', 'cancelled') THEN
        RETURN jsonb_build_object(
            'success', false,
            'status', 'invalid',
            'message', format('Access Denied: Ticket is %s.', v_ticket.status),
            'ticket_code', v_ticket.ticket_code
        );
    END IF;

    UPDATE public.issued_tickets
    SET 
        status = 'checked_in',
        checked_in_at = now(),
        checked_in_by = p_scanner_user_id,
        updated_at = now()
    WHERE id = v_ticket.id;

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

    UPDATE public.orders
    SET 
        status = CASE WHEN p_refund_amount >= v_order.total_amount THEN 'refunded' ELSE 'partially_refunded' END,
        payment_status = 'refunded',
        updated_at = now()
    WHERE id = p_order_id;

    UPDATE public.issued_tickets
    SET 
        status = 'refunded',
        updated_at = now()
    WHERE order_id = p_order_id;

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
