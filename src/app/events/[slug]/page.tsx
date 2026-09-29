'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/data-store';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { TicketType } from '@/types/database';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Building2, 
  CreditCard, 
  ShieldCheck, 
  AlertTriangle, 
  Plus, 
  Minus, 
  Ticket, 
  ArrowLeft,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function EventDetailPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const event = db.getEventBySlug(slug);

  const [selectedTicketId, setSelectedTicketId] = useState<string>(
    event?.ticket_types?.[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [reserving, setReserving] = useState<boolean>(false);
  const [reservationError, setReservationError] = useState<string | null>(null);

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Event Not Found</h2>
        <p className="text-slate-400 text-sm mb-6">The requested event could not be found or has been removed.</p>
        <Link href="/events">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </Link>
      </div>
    );
  }

  const selectedTicket = event.ticket_types?.find((t: TicketType) => t.id === selectedTicketId) || event.ticket_types?.[0];
  const organizer = event.organizer;

  const isPaymentAccountActive = organizer?.stripe_account_id && organizer?.stripe_account_status === 'active';
  const isPaymentAccountDisconnected = !organizer?.stripe_account_id || organizer?.stripe_account_status === 'not_connected';

  const totalPrice = selectedTicket ? selectedTicket.price * quantity : 0;

  const handleProceedToCheckout = () => {
    if (!selectedTicket) return;
    if (isPaymentAccountDisconnected) {
      setReservationError('Checkout is blocked because this organizer has not connected a valid payment account.');
      return;
    }

    setReserving(true);
    setReservationError(null);

    // Reserve ticket inventory in store
    const res = db.reserveTickets(selectedTicket.id, quantity);
    if (!res.success) {
      setReservationError(res.message || 'Failed to reserve tickets.');
      setReserving(false);
      return;
    }

    // Redirect to checkout with query params
    const checkoutUrl = `/checkout?eventId=${event.id}&ticketTypeId=${selectedTicket.id}&quantity=${quantity}&reservationId=${res.reservationId}`;
    router.push(checkoutUrl);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Back button */}
      <Link href="/events" className="inline-flex items-center text-xs text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
        Back to all events
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Cols: Event Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Cover Banner */}
          <div className="relative aspect-[21/9] sm:aspect-[16/7] rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl">
            <img
              src={event.cover_image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80'}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
            <div className="absolute top-4 left-4">
              <Badge variant="glow" className="backdrop-blur-md">
                {event.category}
              </Badge>
            </div>
          </div>

          {/* Title & Metadata */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {event.title}
            </h1>

            {/* Quick Meta Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="p-4 rounded-xl glass-card flex items-start gap-3">
                <Calendar className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-white">Date & Schedule</div>
                  <div className="text-xs text-slate-400">{formatDate(event.start_date)}</div>
                  <div className="text-[11px] text-slate-500">{formatDateTime(event.start_date)}</div>
                </div>
              </div>

              <div className="p-4 rounded-xl glass-card flex items-start gap-3">
                <MapPin className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-white">Location / Venue</div>
                  <div className="text-xs text-slate-300 font-medium">{event.venue_name}</div>
                  <div className="text-[11px] text-slate-400">{event.venue_address}, {event.venue_city}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">About This Event</h2>
            <div className="text-sm text-slate-300 leading-relaxed space-y-3 whitespace-pre-line bg-slate-900/40 p-6 rounded-2xl border border-white/5">
              {event.description}
            </div>
          </div>

          {/* Organizer Card */}
          <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider">Event Producer</div>
                  <div className="text-base font-bold text-white">{organizer?.business_name}</div>
                  <div className="text-xs text-slate-400">{organizer?.support_email}</div>
                </div>
              </div>
              <Link href={`/organizers/${organizer?.slug}`}>
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
              </Link>
            </div>
            {organizer?.bio && (
              <p className="text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                {organizer.bio}
              </p>
            )}
          </div>

          {/* Booking Conditions & Refund Policy */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Refund Policy & Booking Terms
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {event.refund_policy}
            </p>
            {event.booking_conditions && (
              <p className="text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-2">
                <strong>Conditions:</strong> {event.booking_conditions}
              </p>
            )}
          </div>
        </div>

        {/* Right Col: Ticket Selection & Direct Checkout Panel */}
        <div className="space-y-6">
          <div className="sticky top-28 rounded-3xl glass-panel p-6 sm:p-8 border border-purple-500/30 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs text-slate-400 block">Select Admission</span>
                <h3 className="text-lg font-bold text-white">Tickets & Pricing</h3>
              </div>
              <Badge variant="secondary" className="font-mono text-[10px]">
                {event.ticket_types?.length || 0} Tiers Available
              </Badge>
            </div>

            {/* Direct Payment Routing Callout */}
            <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/25 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Direct Merchant Settlement</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Tickets for this event are sold directly by <strong>{organizer?.business_name}</strong>.
                Your payment is routed to their registered merchant account:
              </p>
              <div className="font-mono text-[10px] text-emerald-400 bg-slate-950/80 px-2 py-1 rounded border border-emerald-500/20">
                {organizer?.stripe_account_id || 'Not Connected (Blocked)'}
              </div>
            </div>

            {/* Blocked Checkout Alert if Disconnected */}
            {isPaymentAccountDisconnected && (
              <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>Checkout Blocked</span>
                </div>
                <p className="leading-relaxed">
                  The organizer has not connected a valid merchant payment account. As per platform policy, ticket sales cannot proceed without verified direct routing.
                </p>
              </div>
            )}

            {/* Ticket Tier Options */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 block">
                Choose Ticket Tier:
              </label>
              {event.ticket_types?.map((t) => {
                const isSelected = t.id === selectedTicketId;
                const isSoldOut = t.available_inventory <= 0;

                return (
                  <div
                    key={t.id}
                    onClick={() => !isSoldOut && setSelectedTicketId(t.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-900/30 border-purple-500 text-white shadow-md'
                        : isSoldOut
                        ? 'bg-slate-900/30 border-white/5 opacity-50 cursor-not-allowed'
                        : 'bg-slate-900/60 border-white/10 hover:border-white/20 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-purple-400 bg-purple-500' : 'border-slate-500'}`}>
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <span className="font-semibold text-sm text-white">{t.name}</span>
                      </div>
                      <span className="font-extrabold text-base text-white">
                        {formatCurrency(t.price, t.currency)}
                      </span>
                    </div>

                    {t.description && (
                      <p className="text-xs text-slate-400 mt-1 pl-5.5 leading-relaxed">
                        {t.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pl-5.5">
                      <span>Max {t.max_per_order} per order</span>
                      {isSoldOut ? (
                        <span className="text-rose-400 font-bold uppercase">Sold Out</span>
                      ) : (
                        <span className="text-emerald-400 font-medium">{t.available_inventory} remaining</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quantity Selector */}
            {selectedTicket && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                  <span>Quantity</span>
                  <span>Limit: {selectedTicket.max_per_order}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isPaymentAccountDisconnected}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-extrabold text-lg text-white font-mono px-4">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(selectedTicket.max_per_order, selectedTicket.available_inventory, quantity + 1))}
                    disabled={quantity >= selectedTicket.max_per_order || quantity >= selectedTicket.available_inventory || isPaymentAccountDisconnected}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Price Summary */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Tickets Subtotal</span>
                <span>{formatCurrency(totalPrice, selectedTicket?.currency || 'usd')}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Platform Commission</span>
                <span className="text-emerald-400 font-medium">$0.00 (0% Promo)</span>
              </div>
              <div className="flex items-center justify-between text-base font-extrabold text-white pt-2 border-t border-white/10">
                <span>Total Amount</span>
                <span>{formatCurrency(totalPrice, selectedTicket?.currency || 'usd')}</span>
              </div>
            </div>

            {/* Error Message */}
            {reservationError && (
              <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs">
                {reservationError}
              </div>
            )}

            {/* Checkout Action Button */}
            <Button
              size="lg"
              variant="gradient"
              disabled={isPaymentAccountDisconnected || reserving || !selectedTicket || selectedTicket.available_inventory <= 0}
              onClick={handleProceedToCheckout}
              className="w-full h-12 text-base font-bold shadow-xl shadow-purple-600/30"
            >
              <Ticket className="w-4 h-4 mr-2" />
              {reserving ? 'Reserving Tickets...' : isPaymentAccountDisconnected ? 'Payment Account Missing' : 'Proceed to Checkout'}
            </Button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>10-Minute Anti-Overselling Inventory Hold</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
