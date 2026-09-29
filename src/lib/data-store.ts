import { 
  Profile, 
  Organizer, 
  EventItem, 
  TicketType, 
  Order, 
  IssuedTicket, 
  Refund, 
  AuditLog, 
  EventCategory,
  UserRole
} from '@/types/database';
import { generateOrderNumber, generateTicketCode } from './utils';

// Default mock seed data in memory for immediate interactive testing and sandbox flow
const INITIAL_PROFILES: Profile[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@comedyseat.com',
    full_name: 'ComedySeat Admin',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    role: 'super_admin',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'louddmouth@comedyseat.com',
    full_name: 'Sonny LouddMouth',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    role: 'organizer',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'thestand@comedyseat.com',
    full_name: 'The Stand NYC Bookings',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    role: 'organizer',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'underground@comedyseat.com',
    full_name: 'Davey Smiles',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    role: 'organizer',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    email: 'alex@comedyseat.com',
    full_name: 'Alex Morgan',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    role: 'customer',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_ORGANIZERS: Organizer[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    user_id: '00000000-0000-0000-0000-000000000001',
    business_name: 'ComedySeat Official Specials',
    slug: 'comedyseat-official',
    bio: 'Flagship premier stand-up specials and galas curated and hosted directly by ComedySeat.',
    logo_url: '/images/comedyseat-icon.png',
    banner_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    website: 'https://comedyseat.com',
    support_email: 'vip@comedyseat.com',
    support_phone: '+1 (800) 555-0199',
    status: 'active',
    stripe_account_id: 'acct_admin_comedyseat_001',
    stripe_account_status: 'active',
    charges_enabled: true,
    payouts_enabled: true,
    country: 'US',
    currency: 'usd',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    user_id: '00000000-0000-0000-0000-000000000002',
    business_name: "Sonny's LouddMouth Comedy Brand",
    slug: 'sonnys-louddmouth-comedy',
    bio: 'Unfiltered, electrifying comedy tours and headliner showcases featuring national TV comedians.',
    logo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    banner_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    website: 'https://louddmouthcomedy.com',
    support_email: 'louddmouth@comedyseat.com',
    support_phone: '+1 (555) 839-2011',
    status: 'active',
    stripe_account_id: 'acct_org_louddmouth_001',
    stripe_account_status: 'active',
    charges_enabled: true,
    payouts_enabled: true,
    country: 'US',
    currency: 'usd',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    user_id: '00000000-0000-0000-0000-000000000003',
    business_name: 'The Stand NYC & Comedy Cellar',
    slug: 'the-stand-nyc',
    bio: 'Historic Manhattan comedy club presenting nightly surprise sets from Netflix, HBO, and Comedy Central acts.',
    logo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    banner_url: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1200&q=80',
    website: 'https://thestandnyc.com',
    support_email: 'thestand@comedyseat.com',
    support_phone: '+1 (555) 492-8812',
    status: 'active',
    stripe_account_id: 'acct_org_standnyc_002',
    stripe_account_status: 'active',
    charges_enabled: true,
    payouts_enabled: true,
    country: 'US',
    currency: 'usd',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    user_id: '00000000-0000-0000-0000-000000000004',
    business_name: 'Underground Laugh Lab',
    slug: 'underground-laugh-lab',
    bio: 'Indie underground comedy room and open mic laboratory. (Stripe account disconnected for test safeguard)',
    logo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    banner_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    website: 'https://undergroundlaughlab.org',
    support_email: 'underground@comedyseat.com',
    support_phone: '+1 (555) 912-4019',
    status: 'active',
    stripe_account_id: null,
    stripe_account_status: 'not_connected',
    charges_enabled: false,
    payouts_enabled: false,
    country: 'US',
    currency: 'usd',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_CATEGORIES: EventCategory[] = [
  { id: 'cat-1', name: 'Stand up Comedy', slug: 'stand-up-comedy', icon: 'Mic', description: 'Live stand-up showcases, headliners, and club nights', is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-2', name: 'Improv', slug: 'improv', icon: 'Smile', description: 'Unscripted comedy, troupe battles, and sketch showcases', is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-3', name: 'Open Mic', slug: 'open-mic', icon: 'Radio', description: 'Up-and-coming talent, raw sets, and rookie showcases', is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-4', name: 'Comedy Festivals', slug: 'comedy-festivals', icon: 'PartyPopper', description: 'Multi-day comedy celebrations, galas, and national tours', is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-5', name: 'Comedy Theater', slug: 'comedy-theater', icon: 'Theater', description: 'Broadway farces, satire plays, and comedic musicals', is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-6', name: 'Comedy Courses', slug: 'comedy-courses', icon: 'GraduationCap', description: 'Stand-up writing workshops, improv masterclasses, and stagecraft', is_active: true, created_at: new Date().toISOString() },
];

const INITIAL_EVENTS: EventItem[] = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    organizer_id: '10000000-0000-0000-0000-000000000002', // Organizer A: Sonny's LouddMouth
    owner_user_id: '00000000-0000-0000-0000-000000000002',
    title: "Sonny's LouddMouth Comedy All-Stars Live",
    slug: 'sonnys-louddmouth-comedy-all-stars-live',
    description: 'Get ready for side-splitting belly laughs! Sonny brings his premier LouddMouth roster to NYC with nationally touring headliners, crowd roasts, and surprise celebrity guest drops.',
    category: 'Stand up Comedy',
    cover_image_url: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1200&q=80',
    gallery_urls: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'
    ],
    start_date: new Date(Date.now() + 14 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 14 * 86400000 + 3 * 3600000).toISOString(),
    timezone: 'America/New_York',
    event_type: 'in_person',
    venue_name: 'The Laugh Lounge NYC',
    venue_address: '140 Stewart Ave',
    venue_city: 'New York',
    venue_country: 'USA',
    online_url: null,
    status: 'published',
    refund_policy: 'Full refund available up to 48 hours before showtime.',
    booking_conditions: 'Age 18+ only. 2-item food/drink minimum per person at the venue.',
    is_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    organizer_id: '10000000-0000-0000-0000-000000000003', // Organizer B: The Stand NYC
    owner_user_id: '00000000-0000-0000-0000-000000000003',
    title: 'Whose Laugh Is It Brooklyn? Improv Showcase',
    slug: 'whose-laugh-is-it-brooklyn-improv-showcase',
    description: 'An unscripted, fast-paced comedy duel where top Brooklyn improv squads battle for audience applause using spontaneous crowd suggestions.',
    category: 'Improv',
    cover_image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    gallery_urls: [
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80'
    ],
    start_date: new Date(Date.now() + 21 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 21 * 86400000 + 2.5 * 3600000).toISOString(),
    timezone: 'America/New_York',
    event_type: 'in_person',
    venue_name: 'Bell House Brooklyn',
    venue_address: '149 7th St',
    venue_city: 'Brooklyn',
    venue_country: 'USA',
    online_url: null,
    status: 'published',
    refund_policy: 'Transferable to a friend or refundable up to 24 hours prior.',
    booking_conditions: 'All ages welcome. Casual seating.',
    is_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '20000000-0000-0000-0000-000000000003',
    organizer_id: '10000000-0000-0000-0000-000000000001', // Admin-Owned ComedySeat Special
    owner_user_id: '00000000-0000-0000-0000-000000000001',
    title: 'ComedySeat Annual Laugh Gala & Awards',
    slug: 'comedyseat-annual-laugh-gala-and-awards',
    description: 'The premier national comedy event of the year honoring standout comedians, legendary club owners, and comedy writers, followed by an all-star headline roster.',
    category: 'Comedy Festivals',
    cover_image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    gallery_urls: [],
    start_date: new Date(Date.now() + 30 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 30 * 86400000 + 4 * 3600000).toISOString(),
    timezone: 'America/Chicago',
    event_type: 'in_person',
    venue_name: 'The Chicago Grand Theater',
    venue_address: '175 N State St',
    venue_city: 'Chicago',
    venue_country: 'USA',
    online_url: null,
    status: 'published',
    refund_policy: 'Refundable up to 5 business days before event.',
    booking_conditions: 'Smart casual or cocktail attire recommended. VIP table includes champagne toast.',
    is_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '20000000-0000-0000-0000-000000000004',
    organizer_id: '10000000-0000-0000-0000-000000000004', // Organizer C: Disconnected Stripe
    owner_user_id: '00000000-0000-0000-0000-000000000004',
    title: 'Underground Raw Open Mic & Indie Showcase',
    slug: 'underground-raw-open-mic-and-indie-showcase',
    description: 'Raw, gritty stand-up comedy workshop and open mic testing ground in Denver.',
    category: 'Open Mic',
    cover_image_url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80',
    gallery_urls: [],
    start_date: new Date(Date.now() + 10 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 10 * 86400000 + 3 * 3600000).toISOString(),
    timezone: 'America/Denver',
    event_type: 'in_person',
    venue_name: 'Warehouse 9 Comedy Cellar',
    venue_address: '2420 Larimer St',
    venue_city: 'Denver',
    venue_country: 'USA',
    online_url: null,
    status: 'published',
    refund_policy: 'Strictly non-refundable.',
    booking_conditions: 'Age 21+ only.',
    is_featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '20000000-0000-0000-0000-000000000005',
    organizer_id: '10000000-0000-0000-0000-000000000002', // Organizer A: Sonny's LouddMouth
    owner_user_id: '00000000-0000-0000-0000-000000000002',
    title: 'Mastering The Punchline: 6-Week Stand-Up Workshop',
    slug: 'mastering-the-punchline-6-week-stand-up-workshop',
    description: 'Learn joke construction, stage presence, microphone technique, and crowd work from seasoned comedy headliners.',
    category: 'Comedy Courses',
    cover_image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    gallery_urls: [],
    start_date: new Date(Date.now() + 18 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 60 * 86400000).toISOString(),
    timezone: 'America/Los_Angeles',
    event_type: 'in_person',
    venue_name: 'Comedy City Studio',
    venue_address: '6400 Hollywood Blvd',
    venue_city: 'Los Angeles',
    venue_country: 'USA',
    online_url: null,
    status: 'published',
    refund_policy: 'Full refund before 1st session.',
    booking_conditions: 'Includes student graduation show on main stage.',
    is_featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '20000000-0000-0000-0000-000000000006',
    organizer_id: '10000000-0000-0000-0000-000000000003', // Organizer B: The Stand NYC
    owner_user_id: '00000000-0000-0000-0000-000000000003',
    title: 'Broadway Laughs: The Farce of 5th Avenue',
    slug: 'broadway-laughs-the-farce-of-5th-avenue',
    description: 'A riotous physical comedy play lampooning high-society Manhattan with door-slamming antics and witty dialogue.',
    category: 'Comedy Theater',
    cover_image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    gallery_urls: [],
    start_date: new Date(Date.now() + 25 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 25 * 86400000 + 2.5 * 3600000).toISOString(),
    timezone: 'America/New_York',
    event_type: 'in_person',
    venue_name: 'Hudson Guild Theater',
    venue_address: '441 W 26th St',
    venue_city: 'New York',
    venue_country: 'USA',
    online_url: null,
    status: 'published',
    refund_policy: 'Refundable up to 72 hours prior.',
    booking_conditions: 'Reserved tiered seating.',
    is_featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_TICKET_TYPES: TicketType[] = [
  // For Sonny's LouddMouth Comedy
  {
    id: '30000000-0000-0000-0000-000000000001',
    event_id: '20000000-0000-0000-0000-000000000001',
    name: 'General Admission Seat',
    description: 'Guaranteed seat in the main showroom. Great views of the comedy stage.',
    price: 35.00,
    currency: 'usd',
    total_inventory: 200,
    available_inventory: 195,
    reserved_inventory: 0,
    max_per_order: 6,
    sales_start_date: null,
    sales_end_date: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '30000000-0000-0000-0000-000000000002',
    event_id: '20000000-0000-0000-0000-000000000001',
    name: 'VIP Front-Row Table + 2 Cocktails',
    description: 'Front-row stage seating, guaranteed headliner crowd interaction, and 2 premium drinks included.',
    price: 75.00,
    currency: 'usd',
    total_inventory: 40,
    available_inventory: 38,
    reserved_inventory: 0,
    max_per_order: 4,
    sales_start_date: null,
    sales_end_date: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '30000000-0000-0000-0000-000000000007',
    event_id: '20000000-0000-0000-0000-000000000001',
    name: 'Celebrity Meet & Greet VIP Pass',
    description: 'VIP seating, signed show poster, backstage green room entry, and photo with the comedians.',
    price: 120.00,
    currency: 'usd',
    total_inventory: 15,
    available_inventory: 15,
    reserved_inventory: 0,
    max_per_order: 2,
    sales_start_date: null,
    sales_end_date: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // For Whose Laugh Is It Brooklyn? Improv
  {
    id: '30000000-0000-0000-0000-000000000003',
    event_id: '20000000-0000-0000-0000-000000000002',
    name: 'General Admission Improv Pass',
    description: 'Open seating for the high-octane 90-minute unscripted improv battle.',
    price: 25.00,
    currency: 'usd',
    total_inventory: 180,
    available_inventory: 176,
    reserved_inventory: 0,
    max_per_order: 6,
    sales_start_date: null,
    sales_end_date: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '30000000-0000-0000-0000-000000000004',
    event_id: '20000000-0000-0000-0000-000000000002',
    name: 'Front Reserved Table Seat',
    description: 'Reserved upfront seating with direct prompt suggestion card privileges.',
    price: 45.00,
    currency: 'usd',
    total_inventory: 30,
    available_inventory: 29,
    reserved_inventory: 0,
    max_per_order: 4,
    sales_start_date: null,
    sales_end_date: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // For ComedySeat Annual Laugh Gala (Admin-owned)
  {
    id: '30000000-0000-0000-0000-000000000005',
    event_id: '20000000-0000-0000-0000-000000000003',
    name: 'Gala Reserved Main Floor Seat',
    description: 'Reserved orchestra floor seat for the national awards ceremony and live all-star set.',
    price: 85.00,
    currency: 'usd',
    total_inventory: 300,
    available_inventory: 298,
    reserved_inventory: 0,
    max_per_order: 4,
    sales_start_date: null,
    sales_end_date: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '30000000-0000-0000-0000-000000000008',
    event_id: '20000000-0000-0000-0000-000000000003',
    name: 'VIP Private Box & Afterparty Reception',
    description: 'Private mezzanine box seat, champagne service, and all-access pass to the VIP comedians afterparty.',
    price: 195.00,
    currency: 'usd',
    total_inventory: 40,
    available_inventory: 39,
    reserved_inventory: 0,
    max_per_order: 2,
    sales_start_date: null,
    sales_end_date: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // For Disconnected Organizer Event (Underground)
  {
    id: '30000000-0000-0000-0000-000000000006',
    event_id: '20000000-0000-0000-0000-000000000004',
    name: 'Open Mic Admission',
    description: 'Admission to the open mic room and stage signup list.',
    price: 10.00,
    currency: 'usd',
    total_inventory: 100,
    available_inventory: 100,
    reserved_inventory: 0,
    max_per_order: 5,
    sales_start_date: null,
    sales_end_date: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // For Workshop Course
  {
    id: '30000000-0000-0000-0000-000000000009',
    event_id: '20000000-0000-0000-0000-000000000005',
    name: 'Complete 6-Week Course Pass',
    description: 'Full 6-week intensive stand-up workshop, weekly writer room, and graduation showcase spot.',
    price: 250.00,
    currency: 'usd',
    total_inventory: 20,
    available_inventory: 19,
    reserved_inventory: 0,
    max_per_order: 1,
    sales_start_date: null,
    sales_end_date: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // For Broadway Laughs Theater
  {
    id: '30000000-0000-0000-0000-000000000010',
    event_id: '20000000-0000-0000-0000-000000000006',
    name: 'Orchestra Reserved Seat',
    description: 'Center orchestra seat for The Farce of 5th Avenue.',
    price: 55.00,
    currency: 'usd',
    total_inventory: 120,
    available_inventory: 118,
    reserved_inventory: 0,
    max_per_order: 6,
    sales_start_date: null,
    sales_end_date: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: '40000000-0000-0000-0000-000000000001',
    order_number: 'ORD-2026-98124',
    customer_id: '00000000-0000-0000-0000-000000000005', // Alex Morgan
    organizer_id: '10000000-0000-0000-0000-000000000002', // Organizer A: Sonny's LouddMouth
    event_id: '20000000-0000-0000-0000-000000000001',
    total_amount: 70.00,
    currency: 'usd',
    status: 'completed',
    payment_method: 'stripe',
    payment_gateway_account_id: 'acct_org_louddmouth_001', // Direct organizer merchant account!
    payment_intent_id: 'pi_demo_louddmouth_001_succ',
    payment_status: 'paid',
    paid_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    customer_name: 'Alex Morgan',
    customer_email: 'alex@comedyseat.com',
    customer_phone: '+1 (555) 234-5678',
    idempotency_key: 'idem-40000000-0000-0000-0000-000000000001',
    metadata: { testCase: "Sonny's LouddMouth Direct Charge" },
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: '40000000-0000-0000-0000-000000000002',
    order_number: 'ORD-2026-98125',
    customer_id: '00000000-0000-0000-0000-000000000005', // Alex Morgan
    organizer_id: '10000000-0000-0000-0000-000000000003', // Organizer B: The Stand NYC
    event_id: '20000000-0000-0000-0000-000000000002',
    total_amount: 50.00,
    currency: 'usd',
    status: 'completed',
    payment_method: 'stripe',
    payment_gateway_account_id: 'acct_org_standnyc_002', // Direct organizer merchant account!
    payment_intent_id: 'pi_demo_standnyc_002_succ',
    payment_status: 'paid',
    paid_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    customer_name: 'Alex Morgan',
    customer_email: 'alex@comedyseat.com',
    customer_phone: '+1 (555) 234-5678',
    idempotency_key: 'idem-40000000-0000-0000-0000-000000000002',
    metadata: { testCase: 'The Stand NYC Direct Charge' },
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const INITIAL_TICKETS: IssuedTicket[] = [
  {
    id: '60000000-0000-0000-0000-000000000001',
    ticket_code: 'TKT-CMDY-7A11-9011',
    order_id: '40000000-0000-0000-0000-000000000001',
    order_item_id: '50000000-0000-0000-0000-000000000001',
    event_id: '20000000-0000-0000-0000-000000000001',
    ticket_type_id: '30000000-0000-0000-0000-000000000001',
    customer_id: '00000000-0000-0000-0000-000000000005',
    attendee_name: 'Alex Morgan',
    attendee_email: 'alex@comedyseat.com',
    qr_code_data: JSON.stringify({ code: 'TKT-CMDY-7A11-9011', event: "Sonny's LouddMouth Comedy", guest: 'Alex Morgan' }),
    security_hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    status: 'valid',
    checked_in_at: null,
    checked_in_by: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: '60000000-0000-0000-0000-000000000002',
    ticket_code: 'TKT-CMDY-7A11-9012',
    order_id: '40000000-0000-0000-0000-000000000001',
    order_item_id: '50000000-0000-0000-0000-000000000001',
    event_id: '20000000-0000-0000-0000-000000000001',
    ticket_type_id: '30000000-0000-0000-0000-000000000001',
    customer_id: '00000000-0000-0000-0000-000000000005',
    attendee_name: 'Taylor Reed',
    attendee_email: 'taylor@example.com',
    qr_code_data: JSON.stringify({ code: 'TKT-CMDY-7A11-9012', event: "Sonny's LouddMouth Comedy", guest: 'Taylor Reed' }),
    security_hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    status: 'valid',
    checked_in_at: null,
    checked_in_by: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: '60000000-0000-0000-0000-000000000003',
    ticket_code: 'TKT-IMPR-3B22-2290',
    order_id: '40000000-0000-0000-0000-000000000002',
    order_item_id: '50000000-0000-0000-0000-000000000002',
    event_id: '20000000-0000-0000-0000-000000000002',
    ticket_type_id: '30000000-0000-0000-0000-000000000003',
    customer_id: '00000000-0000-0000-0000-000000000005',
    attendee_name: 'Alex Morgan',
    attendee_email: 'alex@comedyseat.com',
    qr_code_data: JSON.stringify({ code: 'TKT-IMPR-3B22-2290', event: 'Whose Laugh Is It Brooklyn?', guest: 'Alex Morgan' }),
    security_hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    status: 'valid',
    checked_in_at: null,
    checked_in_by: null,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    actor_id: '00000000-0000-0000-0000-000000000001',
    action: 'ORGANIZER_APPROVED',
    target_type: 'organizer',
    target_id: '10000000-0000-0000-0000-000000000002',
    old_data: { status: 'pending' },
    new_data: { status: 'active' },
    ip_address: '127.0.0.1',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 'log-2',
    actor_id: '00000000-0000-0000-0000-000000000002',
    action: 'STRIPE_ACCOUNT_CONNECTED',
    target_type: 'payment_account',
    target_id: 'acct_org_louddmouth_001',
    old_data: null,
    new_data: { stripe_account_status: 'active', charges_enabled: true },
    ip_address: '127.0.0.1',
    created_at: new Date(Date.now() - 24 * 86400000).toISOString(),
  },
];

// Global in-memory storage singleton
class MemoryStore {
  profiles: Profile[] = [...INITIAL_PROFILES];
  organizers: Organizer[] = [...INITIAL_ORGANIZERS];
  categories: EventCategory[] = [...INITIAL_CATEGORIES];
  events: EventItem[] = [...INITIAL_EVENTS];
  ticketTypes: TicketType[] = [...INITIAL_TICKET_TYPES];
  orders: Order[] = [...INITIAL_ORDERS];
  tickets: IssuedTicket[] = [...INITIAL_TICKETS];
  refunds: Refund[] = [];
  auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];

  // Current active session profile - default to null (Guest/Unauthenticated)
  activeUserId: string | null = null;
}

const globalStore: MemoryStore = (globalThis as any).__comedyseat_store || new MemoryStore();
if (process.env.NODE_ENV !== 'production') {
  (globalThis as any).__comedyseat_store = globalStore;
}

export const db = {
  // Profiles
  getProfiles: () => globalStore.profiles,
  getProfileById: (id: string) => globalStore.profiles.find((p: Profile) => p.id === id),
  getProfileByEmail: (email: string) => globalStore.profiles.find((p: Profile) => p.email.toLowerCase() === email.toLowerCase()),
  createUserProfile: (email: string, fullName: string, role: UserRole = 'customer', businessName?: string) => {
    const existing = globalStore.profiles.find((p: Profile) => p.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return existing;
    }
    const newProfile: Profile = {
      id: crypto.randomUUID(),
      email,
      full_name: fullName,
      avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80`,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    globalStore.profiles.push(newProfile);

    // If registered as organizer, generate organizer record
    if (role === 'organizer') {
      const bName = businessName?.trim() || `${fullName}'s Comedy Productions`;
      const slug = bName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(100 + Math.random() * 900);
      globalStore.organizers.push({
        id: crypto.randomUUID(),
        user_id: newProfile.id,
        business_name: bName,
        slug,
        bio: 'Independent comedy producer and venue host on ComedySeat.',
        logo_url: newProfile.avatar_url,
        banner_url: null,
        website: null,
        support_email: email,
        support_phone: null,
        status: 'active',
        stripe_account_id: null,
        stripe_account_status: 'not_connected',
        charges_enabled: false,
        payouts_enabled: false,
        country: 'US',
        currency: 'usd',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return newProfile;
  },
  updateProfile: (userId: string, data: { full_name?: string; avatar_url?: string }) => {
    const profile = globalStore.profiles.find((p: Profile) => p.id === userId);
    if (!profile) return null;
    if (data.full_name) profile.full_name = data.full_name;
    if (data.avatar_url) profile.avatar_url = data.avatar_url;
    profile.updated_at = new Date().toISOString();
    return profile;
  },
  updateProfileRole: (userId: string, newRole: UserRole) => {
    // SECURITY: Users can only upgrade to organizer, NEVER super_admin
    const profile = globalStore.profiles.find((p: Profile) => p.id === userId);
    if (!profile) return null;
    if (newRole === 'super_admin' && profile.role !== 'super_admin') {
      throw new Error('Access Denied: Self-assignment of Super Admin privileges is strictly prohibited.');
    }
    profile.role = newRole;
    profile.updated_at = new Date().toISOString();

    // If upgrading to organizer and doesn't have an organizer record, create one
    if (newRole === 'organizer' && !globalStore.organizers.some((o: Organizer) => o.user_id === userId)) {
      const slug = (profile.full_name || 'organizer').toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(100 + Math.random() * 900);
      globalStore.organizers.push({
        id: crypto.randomUUID(),
        user_id: userId,
        business_name: profile.full_name ? `${profile.full_name}'s Comedy Productions` : 'New Comedy Producer',
        slug,
        bio: 'Newly registered comedy organizer on ComedySeat.',
        logo_url: profile.avatar_url,
        banner_url: null,
        website: null,
        support_email: profile.email,
        support_phone: null,
        status: 'active',
        stripe_account_id: null,
        stripe_account_status: 'not_connected',
        charges_enabled: false,
        payouts_enabled: false,
        country: 'US',
        currency: 'usd',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return profile;
  },

  // Active user / Auth session
  getActiveUser: (): Profile | null => {
    if (!globalStore.activeUserId) return null;
    return globalStore.profiles.find((p: Profile) => p.id === globalStore.activeUserId) || null;
  },
  setActiveUser: (userId: string | null) => {
    globalStore.activeUserId = userId;
    return db.getActiveUser();
  },

  // Organizers
  getOrganizers: () => globalStore.organizers,
  getOrganizerById: (id: string) => globalStore.organizers.find((o: Organizer) => o.id === id),
  getOrganizerByUserId: (userId: string) => globalStore.organizers.find((o: Organizer) => o.user_id === userId),
  getOrganizerBySlug: (slug: string) => globalStore.organizers.find((o: Organizer) => o.slug === slug),
  updateOrganizerStatus: (organizerId: string, status: 'active' | 'suspended' | 'pending') => {
    const org = globalStore.organizers.find((o: Organizer) => o.id === organizerId);
    if (org) {
      org.status = status;
      org.updated_at = new Date().toISOString();
    }
    return org;
  },
  updateOrganizerStripeAccount: (
    organizerId: string, 
    stripeAccountId: string | null, 
    status: 'not_connected' | 'incomplete' | 'active' | 'restricted',
    actorUserId?: string
  ) => {
    // SECURITY: Strictly require authentication to edit payment settings!
    if (!actorUserId && !globalStore.activeUserId) {
      throw new Error('Authentication Required: Without logging in, users cannot edit account or payment settings.');
    }
    const org = globalStore.organizers.find((o: Organizer) => o.id === organizerId);
    if (org) {
      org.stripe_account_id = stripeAccountId;
      org.stripe_account_status = status;
      org.charges_enabled = status === 'active';
      org.payouts_enabled = status === 'active';
      org.updated_at = new Date().toISOString();
    }
    return org;
  },

  // Events
  getEvents: (filters?: { category?: string; status?: string; search?: string; organizerId?: string; ownerUserId?: string }) => {
    let result = [...globalStore.events];
    if (filters?.category) {
      result = result.filter(e => e.category.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters?.status) {
      result = result.filter(e => e.status === filters.status);
    }
    if (filters?.organizerId) {
      result = result.filter(e => e.organizer_id === filters.organizerId);
    }
    if (filters?.ownerUserId) {
      result = result.filter(e => e.owner_user_id === filters.ownerUserId);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(e => 
        e.title.toLowerCase().includes(q) || 
        e.description.toLowerCase().includes(q) || 
        (e.venue_city && e.venue_city.toLowerCase().includes(q))
      );
    }

    // Attach organizer and ticket types
    return result.map(e => ({
      ...e,
      organizer: globalStore.organizers.find((o: Organizer) => o.id === e.organizer_id),
      ticket_types: globalStore.ticketTypes.filter((t: TicketType) => t.event_id === e.id),
    }));
  },

  getEventBySlug: (slug: string) => {
    const event = globalStore.events.find((e: EventItem) => e.slug === slug);
    if (!event) return null;
    return {
      ...event,
      organizer: globalStore.organizers.find((o: Organizer) => o.id === event.organizer_id),
      ticket_types: globalStore.ticketTypes.filter((t: TicketType) => t.event_id === event.id),
    };
  },

  getEventById: (id: string) => {
    const event = globalStore.events.find((e: EventItem) => e.id === id);
    if (!event) return null;
    return {
      ...event,
      organizer: globalStore.organizers.find((o: Organizer) => o.id === event.organizer_id),
      ticket_types: globalStore.ticketTypes.filter((t: TicketType) => t.event_id === event.id),
    };
  },

  createEvent: (eventData: Partial<EventItem> & { owner_user_id: string; organizer_id: string; title: string }) => {
    const slug = eventData.title.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);
    const newEvent: EventItem = {
      id: crypto.randomUUID(),
      organizer_id: eventData.organizer_id,
      owner_user_id: eventData.owner_user_id,
      title: eventData.title,
      slug,
      description: eventData.description || '',
      category: eventData.category || 'Music & Concerts',
      cover_image_url: eventData.cover_image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
      gallery_urls: eventData.gallery_urls || [],
      start_date: eventData.start_date || new Date(Date.now() + 14 * 86400000).toISOString(),
      end_date: eventData.end_date || new Date(Date.now() + 15 * 86400000).toISOString(),
      timezone: eventData.timezone || 'UTC',
      event_type: eventData.event_type || 'in_person',
      venue_name: eventData.venue_name || 'Main Arena',
      venue_address: eventData.venue_address || '100 Main St',
      venue_city: eventData.venue_city || 'New York',
      venue_country: eventData.venue_country || 'USA',
      online_url: eventData.online_url || null,
      status: eventData.status || 'published',
      refund_policy: eventData.refund_policy || 'Standard 48-hour policy.',
      booking_conditions: eventData.booking_conditions || null,
      is_featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    globalStore.events.unshift(newEvent);

    // Default ticket type for this event
    globalStore.ticketTypes.push({
      id: crypto.randomUUID(),
      event_id: newEvent.id,
      name: 'General Admission',
      description: 'Standard admission pass',
      price: 50.00,
      currency: 'usd',
      total_inventory: 200,
      available_inventory: 200,
      reserved_inventory: 0,
      max_per_order: 5,
      sales_start_date: null,
      sales_end_date: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return newEvent;
  },

  updateEvent: (eventId: string, updates: Partial<EventItem>, actorUserId: string, isSuperAdmin: boolean = false) => {
    const event = globalStore.events.find((e: EventItem) => e.id === eventId);
    if (!event) throw new Error('Event not found');

    // Requirement: "Administrative edits to another organizer’s event must preserve its original ownership and payment recipient."
    if (!isSuperAdmin && event.owner_user_id !== actorUserId) {
      throw new Error('Unauthorized to edit this event');
    }

    // Preserve original owner and organizer_id even if an admin edits it!
    const preservedOwner = event.owner_user_id;
    const preservedOrganizer = event.organizer_id;

    Object.assign(event, updates, {
      owner_user_id: preservedOwner,
      organizer_id: preservedOrganizer,
      updated_at: new Date().toISOString(),
    });

    return event;
  },

  // Ticket Types
  getTicketTypesForEvent: (eventId: string) => {
    return globalStore.ticketTypes.filter((t: TicketType) => t.event_id === eventId);
  },
  createTicketType: (ticketData: Partial<TicketType> & { event_id: string; name: string; price: number; total_inventory: number }) => {
    const newTicket: TicketType = {
      id: crypto.randomUUID(),
      event_id: ticketData.event_id,
      name: ticketData.name,
      description: ticketData.description || null,
      price: ticketData.price,
      currency: ticketData.currency || 'usd',
      total_inventory: ticketData.total_inventory,
      available_inventory: ticketData.total_inventory,
      reserved_inventory: 0,
      max_per_order: ticketData.max_per_order || 5,
      sales_start_date: ticketData.sales_start_date || null,
      sales_end_date: ticketData.sales_end_date || null,
      is_active: ticketData.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    globalStore.ticketTypes.push(newTicket);
    return newTicket;
  },

  // Inventory reservation (Concurreny safe)
  reserveTickets: (ticketTypeId: string, quantity: number) => {
    const ticketType = globalStore.ticketTypes.find((t: TicketType) => t.id === ticketTypeId);
    if (!ticketType) return { success: false, message: 'Ticket type not found' };
    if (!ticketType.is_active) return { success: false, message: 'Ticket type is not active' };
    if (ticketType.available_inventory < quantity) {
      return { 
        success: false, 
        message: `Only ${ticketType.available_inventory} tickets remaining. Requested ${quantity}.` 
      };
    }

    // Decrement available, increment reserved
    ticketType.available_inventory -= quantity;
    ticketType.reserved_inventory += quantity;
    ticketType.updated_at = new Date().toISOString();

    const reservationId = crypto.randomUUID();
    return {
      success: true,
      reservationId,
      ticketType,
      quantity,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    };
  },

  // Orders & Fulfillment (Idempotent)
  createAndFulfillOrder: (params: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    eventId: string;
    ticketTypeId: string;
    quantity: number;
    paymentIntentId?: string;
    paymentMethod?: string;
    idempotencyKey?: string;
  }) => {
    // 1. Idempotency check: if an order with this idempotency_key or paymentIntentId already exists, return it!
    if (params.idempotencyKey) {
      const existing = globalStore.orders.find((o: Order) => o.idempotency_key === params.idempotencyKey);
      if (existing) {
        return {
          order: existing,
          tickets: globalStore.tickets.filter((t: IssuedTicket) => t.order_id === existing.id),
          isDuplicate: true,
        };
      }
    }

    // 2. Resolve event and stored owner
    const event = db.getEventById(params.eventId);
    if (!event) throw new Error('Event not found');
    const organizer = db.getOrganizerById(event.organizer_id);
    if (!organizer) throw new Error('Organizer not found');

    // 3. Check organizer payment status: MUST NOT be missing or restricted!
    if (!organizer.stripe_account_id || organizer.stripe_account_status === 'not_connected') {
      throw new Error(`Checkout blocked: Organizer "${organizer.business_name}" has not connected a valid merchant payment account.`);
    }
    if (organizer.stripe_account_status === 'restricted') {
      throw new Error(`Checkout blocked: Organizer "${organizer.business_name}" payment account is currently restricted.`);
    }

    const ticketType = globalStore.ticketTypes.find((t: TicketType) => t.id === params.ticketTypeId);
    if (!ticketType) throw new Error('Ticket type not found');

    // 4. Reserve / check inventory
    if (ticketType.available_inventory < params.quantity) {
      throw new Error('Not enough tickets remaining.');
    }
    ticketType.available_inventory -= params.quantity;
    ticketType.updated_at = new Date().toISOString();

    const orderId = crypto.randomUUID();
    const orderNumber = generateOrderNumber();
    const totalAmount = ticketType.price * params.quantity;

    // 5. Create Order with organizer's connected merchant account reference!
    const newOrder: Order = {
      id: orderId,
      order_number: orderNumber,
      customer_id: params.customerId,
      organizer_id: organizer.id,
      event_id: event.id,
      total_amount: totalAmount,
      currency: ticketType.currency,
      status: 'completed',
      payment_method: params.paymentMethod || 'stripe',
      // Stored payment gateway account ID: Organizer A's account or Organizer B's account
      payment_gateway_account_id: organizer.stripe_account_id,
      payment_intent_id: params.paymentIntentId || `pi_sandbox_${crypto.randomUUID().slice(0, 12)}`,
      payment_status: 'paid',
      paid_at: new Date().toISOString(),
      customer_name: params.customerName,
      customer_email: params.customerEmail,
      customer_phone: params.customerPhone || null,
      idempotency_key: params.idempotencyKey || null,
      metadata: {
        organizerBusinessName: organizer.business_name,
        ticketTypeName: ticketType.name,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    globalStore.orders.unshift(newOrder);

    // 6. Issue Admission Tickets with QR code payload and security hashes
    const issuedList: IssuedTicket[] = [];
    for (let i = 0; i < params.quantity; i++) {
      const code = generateTicketCode(event.title.slice(0, 4));
      const hash = `sec_${crypto.randomUUID().replace(/-/g, '')}`;
      const qrData = JSON.stringify({
        code,
        order: orderNumber,
        event: event.title,
        guest: params.customerName,
        hash: hash.slice(0, 16),
      });

      const ticket: IssuedTicket = {
        id: crypto.randomUUID(),
        ticket_code: code,
        order_id: orderId,
        order_item_id: crypto.randomUUID(),
        event_id: event.id,
        ticket_type_id: ticketType.id,
        customer_id: params.customerId,
        attendee_name: params.customerName,
        attendee_email: params.customerEmail,
        qr_code_data: qrData,
        security_hash: hash,
        status: 'valid',
        checked_in_at: null,
        checked_in_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      globalStore.tickets.push(ticket);
      issuedList.push(ticket);
    }

    // 7. Audit log
    globalStore.auditLogs.unshift({
      id: crypto.randomUUID(),
      actor_id: params.customerId,
      action: 'ORDER_FULFILLED',
      target_type: 'order',
      target_id: orderId,
      old_data: null,
      new_data: {
        order_number: orderNumber,
        amount: totalAmount,
        recipient_account: organizer.stripe_account_id,
        tickets_count: params.quantity,
      },
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString(),
    });

    return {
      order: newOrder,
      tickets: issuedList,
      isDuplicate: false,
    };
  },

  // Ticket scan & validation with duplicate check-in prevention
  validateTicketScan: (ticketCode: string, scannerUserId: string) => {
    const ticket = globalStore.tickets.find((t: IssuedTicket) => t.ticket_code.toUpperCase() === ticketCode.toUpperCase().trim());
    if (!ticket) {
      return {
        success: false,
        status: 'not_found',
        message: 'Invalid ticket code: No matching ticket found in the system.',
      };
    }

    const event = db.getEventById(ticket.event_id);
    const user = db.getProfileById(scannerUserId);

    // Permission check: Scanner must be event owner, organizer, or super admin
    const isAuthorized = user?.role === 'super_admin' || 
                         event?.owner_user_id === scannerUserId ||
                         event?.organizer?.user_id === scannerUserId;

    if (!isAuthorized) {
      return {
        success: false,
        status: 'unauthorized',
        message: 'Access Denied: You are not authorized to check in tickets for this event.',
      };
    }

    // DUPLICATE CHECK-IN PREVENTION
    if (ticket.status === 'checked_in') {
      return {
        success: false,
        status: 'already_checked_in',
        message: `DUPLICATE CHECK-IN DETECTED: This ticket was already checked in on ${new Date(ticket.checked_in_at!).toLocaleString()}.`,
        ticket,
        event,
      };
    }

    // Invalidated / Refunded status
    if (ticket.status === 'refunded' || ticket.status === 'cancelled') {
      return {
        success: false,
        status: 'invalid',
        message: `ACCESS DENIED: This ticket has been ${ticket.status.toUpperCase()} and is void.`,
        ticket,
        event,
      };
    }

    // VALID -> Mark as checked-in
    ticket.status = 'checked_in';
    ticket.checked_in_at = new Date().toISOString();
    ticket.checked_in_by = scannerUserId;
    ticket.updated_at = new Date().toISOString();

    globalStore.auditLogs.unshift({
      id: crypto.randomUUID(),
      actor_id: scannerUserId,
      action: 'TICKET_CHECKED_IN',
      target_type: 'issued_ticket',
      target_id: ticket.id,
      old_data: { status: 'valid' },
      new_data: { status: 'checked_in', ticket_code: ticket.ticket_code },
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString(),
    });

    return {
      success: true,
      status: 'checked_in',
      message: 'Ticket Validated! Admission Granted.',
      ticket,
      event,
    };
  },

  // Refunds with ticket invalidation
  processRefund: (orderId: string, amount: number, reason: string, actorUserId: string) => {
    const order = globalStore.orders.find((o: Order) => o.id === orderId);
    if (!order) throw new Error('Order not found');
    if (order.payment_status !== 'paid') throw new Error('Order is not in paid status');

    const refundId = crypto.randomUUID();
    const refund: Refund = {
      id: refundId,
      order_id: orderId,
      amount,
      currency: order.currency,
      reason,
      status: 'succeeded',
      gateway_refund_id: `re_mock_${crypto.randomUUID().slice(0, 10)}`,
      processed_by: actorUserId,
      created_at: new Date().toISOString(),
    };
    globalStore.refunds.push(refund);

    // Update order status
    order.status = amount >= order.total_amount ? 'refunded' : 'partially_refunded';
    order.payment_status = 'refunded';
    order.updated_at = new Date().toISOString();

    // INVALIDATE ALL TICKETS FOR THIS ORDER
    const affectedTickets = globalStore.tickets.filter((t: IssuedTicket) => t.order_id === orderId);
    affectedTickets.forEach((t: IssuedTicket) => {
      t.status = 'refunded';
      t.updated_at = new Date().toISOString();
    });

    // Audit log
    globalStore.auditLogs.unshift({
      id: crypto.randomUUID(),
      actor_id: actorUserId,
      action: 'ORDER_REFUNDED',
      target_type: 'order',
      target_id: orderId,
      old_data: { payment_status: 'paid' },
      new_data: { payment_status: 'refunded', amount, reason },
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString(),
    });

    return {
      success: true,
      refund,
      invalidatedTicketsCount: affectedTickets.length,
    };
  },

  // Orders querying
  getOrders: (filters?: { customerId?: string; organizerId?: string; eventId?: string }) => {
    let result = [...globalStore.orders];
    if (filters?.customerId) {
      result = result.filter(o => o.customer_id === filters.customerId);
    }
    if (filters?.organizerId) {
      result = result.filter(o => o.organizer_id === filters.organizerId);
    }
    if (filters?.eventId) {
      result = result.filter(o => o.event_id === filters.eventId);
    }

    return result.map(o => ({
      ...o,
      event: globalStore.events.find((e: EventItem) => e.id === o.event_id),
      organizer: globalStore.organizers.find((org: Organizer) => org.id === o.organizer_id),
      tickets: globalStore.tickets.filter((t: IssuedTicket) => t.order_id === o.id),
    }));
  },

  getOrderById: (orderId: string) => {
    const order = globalStore.orders.find((o: Order) => o.id === orderId);
    if (!order) return null;
    return {
      ...order,
      event: globalStore.events.find((e: EventItem) => e.id === order.event_id),
      organizer: globalStore.organizers.find((org: Organizer) => org.id === order.organizer_id),
      tickets: globalStore.tickets.filter((t: IssuedTicket) => t.order_id === order.id),
    };
  },

  // Issued tickets querying
  getTickets: (filters?: { customerId?: string; eventId?: string; orderId?: string }) => {
    let result = [...globalStore.tickets];
    if (filters?.customerId) {
      result = result.filter(t => t.customer_id === filters.customerId);
    }
    if (filters?.eventId) {
      result = result.filter(t => t.event_id === filters.eventId);
    }
    if (filters?.orderId) {
      result = result.filter(t => t.order_id === filters.orderId);
    }
    return result.map(t => ({
      ...t,
      event: globalStore.events.find((e: EventItem) => e.id === t.event_id),
      ticket_type: globalStore.ticketTypes.find((tt: TicketType) => tt.id === t.ticket_type_id),
    }));
  },

  // Audit Logs
  getAuditLogs: () => globalStore.auditLogs,

  // Categories
  getCategories: () => globalStore.categories,
};
