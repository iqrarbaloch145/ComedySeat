-- ====================================================================
-- MIGRATION 5: Demo Seed Data for Acceptance Criteria
-- ====================================================================

-- 1. Insert Default Platform Settings
INSERT INTO public.platform_settings (key, value, description)
VALUES 
    ('platform_name', '"ComedySeat"'::jsonb, 'Platform name displayed in header and emails'),
    ('payment_mode', '"stripe_connect_direct"'::jsonb, 'Connected merchant gateway with direct payments to comedy producers'),
    ('stripe_connect_client_id', '"ca_demo_test_client_id"'::jsonb, 'Stripe Connect Client ID for OAuth'),
    ('supported_currencies', '["USD", "EUR", "GBP", "CAD", "AUD"]'::jsonb, 'Supported ticket currencies'),
    ('platform_fee_percent', '0'::jsonb, 'Initial platform commission is 0%')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. Insert Default Comedy Categories
INSERT INTO public.event_categories (name, slug, icon, description)
VALUES 
    ('Stand up Comedy', 'stand-up-comedy', 'Mic', 'Live headliner showcases, comedy club nights, and national comedy tours.'),
    ('Improv', 'improv', 'Sparkles', 'Fast-paced unscripted comedy, troupe battles, and sketch showcases.'),
    ('Open Mic', 'open-mic', 'Smile', 'Raw rookie talent, new joke testing, and underground rooms.'),
    ('Comedy Festivals', 'comedy-festivals', 'Ticket', 'Multi-day galas, comedy celebrations, and national comedy honors.'),
    ('Comedy Theater', 'comedy-theater', 'Building2', 'Broadway farces, satire plays, and comedic musicals.'),
    ('Comedy Courses', 'comedy-courses', 'BookOpen', '6-week stand-up writing workshops, stagecraft, and improv masterclasses.')
ON CONFLICT (slug) DO NOTHING;

-- 3. Pre-create Demo UUIDs
-- Super Admin: 00000000-0000-0000-0000-000000000001
-- Organizer 1: 00000000-0000-0000-0000-000000000002
-- Organizer 2: 00000000-0000-0000-0000-000000000003
-- Organizer 3 (Disconnected): 00000000-0000-0000-0000-000000000004
-- Customer:    00000000-0000-0000-0000-000000000005

-- Insert Auth Users (if running in Supabase local / self-hosted / cloud where auth.users exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        
        -- Admin
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role)
        VALUES (
            '00000000-0000-0000-0000-000000000001',
            '00000000-0000-0000-0000-000000000000',
            'admin@eventhub.com',
            crypt('Password123!', gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Platform Administrator","role":"super_admin"}',
            now(), now(), 'authenticated'
        ) ON CONFLICT (id) DO NOTHING;

        -- Organizer 1 (SoundWave)
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role)
        VALUES (
            '00000000-0000-0000-0000-000000000002',
            '00000000-0000-0000-0000-000000000000',
            'soundwave@eventhub.com',
            crypt('Password123!', gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Marcus Vance","role":"organizer"}',
            now(), now(), 'authenticated'
        ) ON CONFLICT (id) DO NOTHING;

        -- Organizer 2 (TechSummit)
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role)
        VALUES (
            '00000000-0000-0000-0000-000000000003',
            '00000000-0000-0000-0000-000000000000',
            'techsummit@eventhub.com',
            crypt('Password123!', gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Elena Rostova","role":"organizer"}',
            now(), now(), 'authenticated'
        ) ON CONFLICT (id) DO NOTHING;

        -- Organizer 3 (IndieArts - Disconnected Payment)
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role)
        VALUES (
            '00000000-0000-0000-0000-000000000004',
            '00000000-0000-0000-0000-000000000000',
            'indiearts@eventhub.com',
            crypt('Password123!', gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Julian Hayes","role":"organizer"}',
            now(), now(), 'authenticated'
        ) ON CONFLICT (id) DO NOTHING;

        -- Customer (Alex Morgan)
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role)
        VALUES (
            '00000000-0000-0000-0000-000000000005',
            '00000000-0000-0000-0000-000000000000',
            'customer@eventhub.com',
            crypt('Password123!', gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Alex Morgan","role":"customer"}',
            now(), now(), 'authenticated'
        ) ON CONFLICT (id) DO NOTHING;

    END IF;
END $$;

-- 4. Insert or Update Profiles
INSERT INTO public.profiles (id, email, full_name, role)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'admin@eventhub.com', 'Platform Administrator', 'super_admin'),
    ('00000000-0000-0000-0000-000000000002', 'soundwave@eventhub.com', 'Marcus Vance (SoundWave)', 'organizer'),
    ('00000000-0000-0000-0000-000000000003', 'techsummit@eventhub.com', 'Elena Rostova (Global Tech)', 'organizer'),
    ('00000000-0000-0000-0000-000000000004', 'indiearts@eventhub.com', 'Julian Hayes (Indie Arts)', 'organizer'),
    ('00000000-0000-0000-0000-000000000005', 'customer@eventhub.com', 'Alex Morgan', 'customer')
ON CONFLICT (id) DO UPDATE SET 
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name;

-- 5. Insert Organizers
INSERT INTO public.organizers (
    id, user_id, business_name, slug, bio, website, support_email, status, 
    stripe_account_id, stripe_account_status, charges_enabled, payouts_enabled, currency, country
)
VALUES 
    -- Super Admin's own Organizer account (for Admin-owned events)
    (
        '10000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        'EventHub Official Events',
        'eventhub-official',
        'Direct flagship events managed directly by the platform administration team.',
        'https://eventhub.com',
        'events@eventhub.com',
        'active',
        'acct_admin_designated_001',
        'active',
        true,
        true,
        'usd',
        'US'
    ),
    -- Organizer A: SoundWave Productions (Connected & Active)
    (
        '10000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000002',
        'SoundWave Entertainment',
        'soundwave-entertainment',
        'Pioneering electronic dance music festivals and immersive audio-visual concerts across North America.',
        'https://soundwave.live',
        'support@soundwave.live',
        'active',
        'acct_org_soundwave_001',
        'active',
        true,
        true,
        'usd',
        'US'
    ),
    -- Organizer B: Global Tech Expos (Connected & Active)
    (
        '10000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0000-000000000003',
        'Global Tech Expos',
        'global-tech-expos',
        'World-class technology conferences, AI summits, and venture founder meetups.',
        'https://globaltechexpos.io',
        'desk@globaltechexpos.io',
        'active',
        'acct_org_techsummit_002',
        'active',
        true,
        true,
        'usd',
        'US'
    ),
    -- Organizer C: Indie Arts (Disconnected Payment Account for Testing Verification)
    (
        '10000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0000-000000000004',
        'Indie Arts Collective',
        'indie-arts-collective',
        'Independent cinema and underground art showcases.',
        'https://indiearts.org',
        'contact@indiearts.org',
        'active',
        NULL,
        'not_connected',
        false,
        false,
        'usd',
        'US'
    )
ON CONFLICT (id) DO UPDATE SET
    stripe_account_id = EXCLUDED.stripe_account_id,
    stripe_account_status = EXCLUDED.stripe_account_status,
    charges_enabled = EXCLUDED.charges_enabled;

-- 6. Insert Events
INSERT INTO public.events (
    id, organizer_id, owner_user_id, title, slug, description, category,
    cover_image_url, start_date, end_date, timezone, event_type, venue_name, venue_address, venue_city, venue_country,
    status, is_featured, refund_policy
)
VALUES 
    -- Organizer A Event 1: Neon Nights Music Festival
    (
        '20000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000002',
        'Neon Nights Electronic Music Festival 2026',
        'neon-nights-electronic-music-festival-2026',
        'Experience 3 stages of cutting-edge synthesizer soundscapes, world-class DJ headliners, holographic laser projections, and immersive festival art.',
        'Music & Concerts',
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
        now() + interval '14 days',
        now() + interval '15 days',
        'America/New_York',
        'in_person',
        'Avant Gardner Brooklyn Mirage',
        '140 Stewart Ave',
        'New York',
        'USA',
        'published',
        true,
        'Full refund if requested 7 days before event start. No refunds within 48 hours.'
    ),
    -- Organizer B Event 1: Global AI & Quantum Frontier Summit
    (
        '20000000-0000-0000-0000-000000000002',
        '10000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0000-000000000003',
        'Global AI & Quantum Frontier Summit 2026',
        'global-ai-quantum-frontier-summit-2026',
        'Join 1,500+ AI researchers, founders, and quantum computing pioneers discussing autonomous systems, frontier LLMs, and next-gen silicon architectures.',
        'Tech & Innovation',
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        now() + interval '21 days',
        now() + interval '23 days',
        'America/Los_Angeles',
        'in_person',
        'Moscone Center South Hall',
        '747 Howard St',
        'San Francisco',
        'USA',
        'published',
        true,
        'Transferable up to 24 hours prior. 50% refund available up to 14 days before.'
    ),
    -- Admin Event 1: EventHub Global Gala & Creator Awards
    (
        '20000000-0000-0000-0000-000000000003',
        '10000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        'EventHub Annual Creator Gala & Awards',
        'eventhub-annual-creator-gala-and-awards',
        'The official annual platform gala celebrating top event organizers, cultural innovators, and community leaders with red carpet reception and dinner.',
        'Business & Networking',
        'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
        now() + interval '30 days',
        now() + interval '30 days' + interval '6 hours',
        'America/Chicago',
        'in_person',
        'The Drake Grand Ballroom',
        '140 E Walton Pl',
        'Chicago',
        'USA',
        'published',
        true,
        'Refunds granted up to 5 business days prior.'
    ),
    -- Organizer C Event (Disconnected Payment Account for Testing Verification)
    (
        '20000000-0000-0000-0000-000000000004',
        '10000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0000-000000000004',
        'Urban Street Art & Indie Film Showcase',
        'urban-street-art-and-indie-film-showcase',
        'An underground showcase featuring independent documentary premieres and live spray-paint mural creation.',
        'Arts & Theater',
        'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80',
        now() + interval '10 days',
        now() + interval '11 days',
        'America/Denver',
        'in_person',
        'Warehouse 9 Art Space',
        '2420 Larimer St',
        'Denver',
        'USA',
        'published',
        false,
        'Strictly non-refundable.'
    )
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    status = EXCLUDED.status;

-- 7. Insert Ticket Types
INSERT INTO public.ticket_types (
    id, event_id, name, description, price, currency, total_inventory, available_inventory, reserved_inventory, max_per_order
)
VALUES 
    -- For Neon Nights (Organizer A)
    (
        '30000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001',
        'General Admission (Tier 1)',
        'Full day access to all 3 music stages and food village.',
        65.00,
        'usd',
        500,
        495,
        0,
        6
    ),
    (
        '30000000-0000-0000-0000-000000000002',
        '20000000-0000-0000-0000-000000000001',
        'VIP Backstage Pass',
        'Express entrance, dedicated VIP lounge, elevated viewing platform, and complimentary open bar.',
        195.00,
        'usd',
        100,
        98,
        0,
        4
    ),
    -- For Tech Summit (Organizer B)
    (
        '30000000-0000-0000-0000-000000000003',
        '20000000-0000-0000-0000-000000000002',
        'Standard Conference Pass',
        'Full 3-day access to keynote speeches, exhibition floor, and workshop breakout tracks.',
        299.00,
        'usd',
        400,
        396,
        0,
        5
    ),
    (
        '30000000-0000-0000-0000-000000000004',
        '20000000-0000-0000-0000-000000000002',
        'Founder & Investor All-Access',
        'Access to VIP investor matchmaking lounge, closed-door dinners, and venture pitching session.',
        699.00,
        'usd',
        80,
        79,
        0,
        2
    ),
    -- For Admin Event
    (
        '30000000-0000-0000-0000-000000000005',
        '20000000-0000-0000-0000-000000000003',
        'Gala Dinner Admission',
        'Includes 4-course banquet dinner, awards ceremony, and networking dessert reception.',
        150.00,
        'usd',
        250,
        248,
        0,
        4
    ),
    -- For Disconnected Event
    (
        '30000000-0000-0000-0000-000000000006',
        '20000000-0000-0000-0000-000000000004',
        'Showcase Entry Ticket',
        'Admission to documentary screening and gallery walk.',
        25.00,
        'usd',
        150,
        150,
        0,
        5
    )
ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    total_inventory = EXCLUDED.total_inventory;

-- 8. Insert Seed Order & Tickets for Customer (Alex Morgan)
-- Order 1: Alex Morgan purchased 2 GA tickets for Neon Nights (Organizer A)
INSERT INTO public.orders (
    id, order_number, customer_id, organizer_id, event_id, total_amount, currency,
    status, payment_method, payment_gateway_account_id, payment_intent_id, payment_status,
    paid_at, customer_name, customer_email, customer_phone
)
VALUES (
    '40000000-0000-0000-0000-000000000001',
    'ORD-2026-98124',
    '00000000-0000-0000-0000-000000000005',
    '10000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000001',
    130.00,
    'usd',
    'completed',
    'stripe',
    'acct_org_soundwave_001',
    'pi_demo_soundwave_001_succ',
    'paid',
    now() - interval '2 days',
    'Alex Morgan',
    'customer@eventhub.com',
    '+1 (555) 234-5678'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.order_items (
    id, order_id, ticket_type_id, quantity, unit_price, subtotal
)
VALUES (
    '50000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    2,
    65.00,
    130.00
) ON CONFLICT (id) DO NOTHING;

-- Tickets for Order 1
INSERT INTO public.issued_tickets (
    id, ticket_code, order_id, order_item_id, event_id, ticket_type_id, customer_id,
    attendee_name, attendee_email, qr_code_data, security_hash, status
)
VALUES 
    (
        '60000000-0000-0000-0000-000000000001',
        'TKT-NEON-8A2F-9011',
        '40000000-0000-0000-0000-000000000001',
        '50000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000005',
        'Alex Morgan',
        'customer@eventhub.com',
        '{"code":"TKT-NEON-8A2F-9011","event":"Neon Nights","seat":"GA-01"}',
        '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        'valid'
    ),
    (
        '60000000-0000-0000-0000-000000000002',
        'TKT-NEON-8A2F-9012',
        '40000000-0000-0000-0000-000000000001',
        '50000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000005',
        'Taylor Reed',
        'taylor@example.com',
        '{"code":"TKT-NEON-8A2F-9012","event":"Neon Nights","seat":"GA-02"}',
        '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
        'valid'
    )
ON CONFLICT (id) DO NOTHING;

-- Order 2: Alex Morgan purchased 1 Standard Pass for Tech Summit (Organizer B)
INSERT INTO public.orders (
    id, order_number, customer_id, organizer_id, event_id, total_amount, currency,
    status, payment_method, payment_gateway_account_id, payment_intent_id, payment_status,
    paid_at, customer_name, customer_email, customer_phone
)
VALUES (
    '40000000-0000-0000-0000-000000000002',
    'ORD-2026-98125',
    '00000000-0000-0000-0000-000000000005',
    '10000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000002',
    299.00,
    'usd',
    'completed',
    'stripe',
    'acct_org_techsummit_002',
    'pi_demo_techsummit_002_succ',
    'paid',
    now() - interval '1 day',
    'Alex Morgan',
    'customer@eventhub.com',
    '+1 (555) 234-5678'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.order_items (
    id, order_id, ticket_type_id, quantity, unit_price, subtotal
)
VALUES (
    '50000000-0000-0000-0000-000000000002',
    '40000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000003',
    1,
    299.00,
    299.00
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.issued_tickets (
    id, ticket_code, order_id, order_item_id, event_id, ticket_type_id, customer_id,
    attendee_name, attendee_email, qr_code_data, security_hash, status
)
VALUES (
    '60000000-0000-0000-0000-000000000003',
    'TKT-TECH-4B81-2290',
    '40000000-0000-0000-0000-000000000002',
    '50000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000005',
    'Alex Morgan',
    'customer@eventhub.com',
    '{"code":"TKT-TECH-4B81-2290","event":"AI Summit","seat":"Standard-01"}',
    '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    'valid'
) ON CONFLICT (id) DO NOTHING;
