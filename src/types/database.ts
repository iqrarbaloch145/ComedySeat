export type UserRole = 'customer' | 'organizer' | 'super_admin';

export type OrganizerStatus = 'pending' | 'active' | 'suspended' | 'rejected';
export type StripeAccountStatus = 'not_connected' | 'incomplete' | 'active' | 'restricted';

export type EventStatus = 'draft' | 'pending_approval' | 'published' | 'cancelled' | 'completed' | 'archived';
export type EventType = 'in_person' | 'online' | 'hybrid';

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded' | 'disputed';
export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunded';

export type TicketStatus = 'valid' | 'checked_in' | 'cancelled' | 'refunded';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Organizer {
  id: string;
  user_id: string;
  business_name: string;
  slug: string;
  bio: string | null;
  logo_url: string | null;
  banner_url: string | null;
  website: string | null;
  support_email: string | null;
  support_phone: string | null;
  status: OrganizerStatus;
  stripe_account_id: string | null;
  stripe_account_status: StripeAccountStatus;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  country: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface EventCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface EventItem {
  id: string;
  organizer_id: string;
  owner_user_id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  cover_image_url: string | null;
  gallery_urls: string[];
  start_date: string;
  end_date: string;
  timezone: string;
  event_type: EventType;
  venue_name: string | null;
  venue_address: string | null;
  venue_city: string | null;
  venue_country: string | null;
  online_url: string | null;
  status: EventStatus;
  refund_policy: string;
  booking_conditions: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  // Joins
  organizer?: Organizer;
  ticket_types?: TicketType[];
}

export interface TicketType {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  total_inventory: number;
  available_inventory: number;
  reserved_inventory: number;
  max_per_order: number;
  sales_start_date: string | null;
  sales_end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TicketReservation {
  id: string;
  ticket_type_id: string;
  user_id: string | null;
  session_id: string;
  quantity: number;
  expires_at: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  organizer_id: string;
  event_id: string;
  total_amount: number;
  currency: string;
  status: OrderStatus;
  payment_method: string;
  payment_gateway_account_id: string; // The organizer's or admin's connected account
  payment_intent_id: string | null;
  payment_status: PaymentStatus;
  paid_at: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  idempotency_key: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Joins
  event?: EventItem;
  organizer?: Organizer;
  items?: OrderItem[];
  tickets?: IssuedTicket[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  ticket_type_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
  ticket_type?: TicketType;
}

export interface IssuedTicket {
  id: string;
  ticket_code: string;
  order_id: string;
  order_item_id: string;
  event_id: string;
  ticket_type_id: string;
  customer_id: string;
  attendee_name: string;
  attendee_email: string;
  qr_code_data: string;
  security_hash: string;
  status: TicketStatus;
  checked_in_at: string | null;
  checked_in_by: string | null;
  created_at: string;
  updated_at: string;
  event?: EventItem;
  ticket_type?: TicketType;
}

export interface Refund {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  reason: string | null;
  status: 'pending' | 'succeeded' | 'failed';
  gateway_refund_id: string | null;
  processed_by: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  target_type: string;
  target_id: string;
  old_data: any;
  new_data: any;
  ip_address: string | null;
  created_at: string;
}

export interface PlatformSetting {
  id: string;
  key: string;
  value: any;
  description: string | null;
  updated_by: string | null;
  updated_at: string;
}
