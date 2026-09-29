-- ====================================================================
-- MIGRATION 2: Row Level Security (RLS) & Security Policies
-- ====================================================================

-- Enable RLS on all tables
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

-- Helper function: check if the requesting user is a Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function: check if the requesting user is an Organizer
CREATE OR REPLACE FUNCTION public.is_organizer(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.organizers
        WHERE id = org_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- --------------------------------------------------------------------
-- 1. PROFILES POLICIES
-- --------------------------------------------------------------------
-- Anyone can view public profile fields
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

-- Users can update their own profile, but CANNOT escalate to 'super_admin'
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id 
    AND (
        -- If current role is not super_admin, they cannot set role to super_admin
        CASE 
            WHEN (SELECT role FROM public.profiles WHERE id = auth.uid()) != 'super_admin' 
            THEN role IN ('customer', 'organizer')
            ELSE true
        END
    )
);

-- Super admin can perform any action on profiles
CREATE POLICY "Super admin has full control over profiles" 
ON public.profiles FOR ALL 
USING (public.is_super_admin());

-- --------------------------------------------------------------------
-- 2. ORGANIZERS POLICIES
-- --------------------------------------------------------------------
-- Public can view active organizers
CREATE POLICY "Public can view active organizers" 
ON public.organizers FOR SELECT 
USING (status = 'active' OR auth.uid() = user_id OR public.is_super_admin());

-- Registered user can register as an organizer
CREATE POLICY "Users can create organizer profile for themselves" 
ON public.organizers FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Organizers can update their own details (except status, which requires admin)
CREATE POLICY "Organizers can update their own profile" 
ON public.organizers FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
    auth.uid() = user_id
    -- Organizer cannot unilaterally activate a suspended account
    AND (
        status = (SELECT status FROM public.organizers WHERE user_id = auth.uid())
        OR public.is_super_admin()
    )
);

-- Super admin has full control on organizers
CREATE POLICY "Super admin has full control on organizers" 
ON public.organizers FOR ALL 
USING (public.is_super_admin());

-- --------------------------------------------------------------------
-- 3. EVENT CATEGORIES POLICIES
-- --------------------------------------------------------------------
CREATE POLICY "Anyone can view active categories" 
ON public.event_categories FOR SELECT 
USING (is_active = true OR public.is_super_admin());

CREATE POLICY "Super admin can manage categories" 
ON public.event_categories FOR ALL 
USING (public.is_super_admin());

-- --------------------------------------------------------------------
-- 4. EVENTS POLICIES
-- --------------------------------------------------------------------
-- Visitors can view published events
CREATE POLICY "Visitors can view published events" 
ON public.events FOR SELECT 
USING (
    status = 'published' 
    OR owner_user_id = auth.uid() 
    OR public.is_super_admin()
);

-- Organizers can insert events owned by them
CREATE POLICY "Organizers can create events" 
ON public.events FOR INSERT 
WITH CHECK (
    owner_user_id = auth.uid() 
    AND EXISTS (
        SELECT 1 FROM public.organizers 
        WHERE id = organizer_id AND user_id = auth.uid() AND status = 'active'
    )
);

-- Organizers can update their own events. Super admin can update any event.
-- Preserves event ownership & payment recipient integrity.
CREATE POLICY "Organizers can update own events" 
ON public.events FOR UPDATE 
USING (
    owner_user_id = auth.uid() OR public.is_super_admin()
)
WITH CHECK (
    -- If not super admin, must be original owner
    (public.is_super_admin() OR owner_user_id = auth.uid())
);

-- Organizers can delete/archive their own events. Super admin can delete.
CREATE POLICY "Organizers can delete own events" 
ON public.events FOR DELETE 
USING (owner_user_id = auth.uid() OR public.is_super_admin());

-- --------------------------------------------------------------------
-- 5. TICKET TYPES POLICIES
-- --------------------------------------------------------------------
CREATE POLICY "Public can view active ticket types for visible events" 
ON public.ticket_types FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.events 
        WHERE events.id = ticket_types.event_id 
        AND (events.status = 'published' OR events.owner_user_id = auth.uid() OR public.is_super_admin())
    )
);

CREATE POLICY "Organizers can manage ticket types for their events" 
ON public.ticket_types FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.events 
        WHERE events.id = ticket_types.event_id 
        AND (events.owner_user_id = auth.uid() OR public.is_super_admin())
    )
);

-- --------------------------------------------------------------------
-- 6. TICKET RESERVATIONS POLICIES
-- --------------------------------------------------------------------
CREATE POLICY "Users can view their own reservations" 
ON public.ticket_reservations FOR SELECT 
USING (user_id = auth.uid() OR public.is_super_admin());

-- --------------------------------------------------------------------
-- 7. ORDERS POLICIES
-- --------------------------------------------------------------------
-- Customers view their own orders
-- Organizers view orders for their own organizer ID
-- Super Admin views all orders
CREATE POLICY "Customers view own orders" 
ON public.orders FOR SELECT 
USING (
    customer_id = auth.uid() 
    OR EXISTS (
        SELECT 1 FROM public.organizers 
        WHERE organizers.id = orders.organizer_id AND organizers.user_id = auth.uid()
    )
    OR public.is_super_admin()
);

-- Orders cannot be updated to 'paid' by customers directly.
-- Service role or secure server actions handle order state transitions.
CREATE POLICY "Super admin can update orders" 
ON public.orders FOR ALL 
USING (public.is_super_admin());

-- --------------------------------------------------------------------
-- 8. ORDER ITEMS POLICIES
-- --------------------------------------------------------------------
CREATE POLICY "Order items viewable by order participants or admin" 
ON public.order_items FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_items.order_id 
        AND (
            orders.customer_id = auth.uid() 
            OR EXISTS (SELECT 1 FROM public.organizers WHERE organizers.id = orders.organizer_id AND organizers.user_id = auth.uid())
            OR public.is_super_admin()
        )
    )
);

-- --------------------------------------------------------------------
-- 9. ISSUED TICKETS POLICIES
-- --------------------------------------------------------------------
-- Customers view their own tickets
-- Organizers can view tickets for events they own (for scan/validation & reports)
-- Super admin views all tickets
CREATE POLICY "Issued tickets viewable by customer, event organizer, or admin" 
ON public.issued_tickets FOR SELECT 
USING (
    customer_id = auth.uid() 
    OR EXISTS (
        SELECT 1 FROM public.events 
        WHERE events.id = issued_tickets.event_id 
        AND (events.owner_user_id = auth.uid() OR public.is_super_admin())
    )
);

-- Organizers can update tickets for check-in validation
CREATE POLICY "Organizers can check-in tickets for their own events" 
ON public.issued_tickets FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.events 
        WHERE events.id = issued_tickets.event_id 
        AND (events.owner_user_id = auth.uid() OR public.is_super_admin())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.events 
        WHERE events.id = issued_tickets.event_id 
        AND (events.owner_user_id = auth.uid() OR public.is_super_admin())
    )
);

-- --------------------------------------------------------------------
-- 10. REFUNDS POLICIES
-- --------------------------------------------------------------------
CREATE POLICY "Refunds viewable by customer, organizer, or admin" 
ON public.refunds FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = refunds.order_id 
        AND (
            orders.customer_id = auth.uid() 
            OR EXISTS (SELECT 1 FROM public.organizers WHERE organizers.id = orders.organizer_id AND organizers.user_id = auth.uid())
            OR public.is_super_admin()
        )
    )
);

-- Organizers can request/process refunds for their events; Super Admin can manage all
CREATE POLICY "Organizers and admins can manage refunds" 
ON public.refunds FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = refunds.order_id 
        AND (
            EXISTS (SELECT 1 FROM public.organizers WHERE organizers.id = orders.organizer_id AND organizers.user_id = auth.uid())
            OR public.is_super_admin()
        )
    )
);

-- --------------------------------------------------------------------
-- 11. AUDIT LOGS POLICIES
-- --------------------------------------------------------------------
CREATE POLICY "Audit logs only viewable by Super Admin" 
ON public.audit_logs FOR SELECT 
USING (public.is_super_admin());

-- --------------------------------------------------------------------
-- 12. PLATFORM SETTINGS POLICIES
-- --------------------------------------------------------------------
CREATE POLICY "Platform settings viewable by everyone" 
ON public.platform_settings FOR SELECT 
USING (true);

CREATE POLICY "Platform settings manageable only by Super Admin" 
ON public.platform_settings FOR ALL 
USING (public.is_super_admin());
