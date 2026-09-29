-- ====================================================================
-- MIGRATION 4: Supabase Storage Buckets & Policies
-- ====================================================================

-- 1. Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('event-media', 'event-media', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('tickets', 'tickets', false, 10485760, ARRAY['application/pdf', 'image/png', 'image/jpeg'])
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies for 'event-media' (Public)
CREATE POLICY "Public media access"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-media');

CREATE POLICY "Authenticated users can upload event media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-media');

CREATE POLICY "Users can update their own event media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'event-media' AND (auth.uid() = owner OR public.is_super_admin()));

CREATE POLICY "Users can delete their own event media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-media' AND (auth.uid() = owner OR public.is_super_admin()));

-- 3. Storage Policies for 'tickets' (Private protected bucket)
CREATE POLICY "Customers and Organizers can read authorized tickets"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'tickets' AND (
        auth.uid() = owner
        OR public.is_super_admin()
        OR EXISTS (
            SELECT 1 FROM public.issued_tickets it
            WHERE it.ticket_code = (storage.foldername(name))[1]
            AND (
                it.customer_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.events e 
                    WHERE e.id = it.event_id AND e.owner_user_id = auth.uid()
                )
            )
        )
    )
);

CREATE POLICY "Server and Admin can insert tickets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tickets' AND (public.is_super_admin() OR auth.role() = 'service_role'));
