'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/data-store';
import { formatCurrency } from '@/lib/utils';
import { TicketType } from '@/types/database';
import { 
  ShieldCheck, 
  CreditCard, 
  Clock, 
  AlertTriangle, 
  Building2, 
  Lock, 
  Ticket, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, switchUser } = useAuth();

  const eventId = searchParams.get('eventId');
  const ticketTypeId = searchParams.get('ticketTypeId');
  const quantityParam = parseInt(searchParams.get('quantity') || '1', 10);
  const reservationId = searchParams.get('reservationId');

  const [customerName, setCustomerName] = useState(user?.full_name || 'Alex Morgan');
  const [customerEmail, setCustomerEmail] = useState(user?.email || 'alex@comedyseat.com');
  const [customerPhone, setCustomerPhone] = useState('+1 (555) 234-5678');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  useEffect(() => {
    if (user?.full_name) setCustomerName(user.full_name);
    if (user?.email) setCustomerEmail(user.email);
  }, [user]);

  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reservation countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Resolve Event & Stored Owner strictly on server/store (NEVER trusted from client props)
  const event = eventId ? db.getEventById(eventId) : null;
  const ticketType = event?.ticket_types?.find((t: TicketType) => t.id === ticketTypeId);
  const organizer = event?.organizer;

  if (!event || !ticketType || !organizer) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Invalid Checkout Session</h2>
        <p className="text-xs text-slate-400 mb-6">
          Your ticket selection or reservation session could not be verified.
        </p>
        <Link href="/events">
          <Button variant="outline">Back to Events</Button>
        </Link>
      </div>
    );
  }

  // Strict check on organizer payment account
  const isPaymentBlocked = !organizer.stripe_account_id || organizer.stripe_account_status === 'not_connected';
  const isPaymentRestricted = organizer.stripe_account_status === 'restricted';

  const subtotal = ticketType.price * quantityParam;
  const processingFee = 0.00; // 0% platform commission promo
  const totalAmount = subtotal + processingFee;

  const handleCompletePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isPaymentBlocked) {
      setErrorMessage(`Checkout Blocked: Organizer "${organizer.business_name}" has not connected a valid merchant payment account. Ticket purchases cannot proceed.`);
      return;
    }
    if (isPaymentRestricted) {
      setErrorMessage(`Checkout Blocked: Organizer "${organizer.business_name}" payment gateway is restricted.`);
      return;
    }
    if (timeLeft <= 0) {
      setErrorMessage('Your 10-minute reservation has expired. Please return to the event page to reserve tickets again.');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate/call checkout API route with Idempotency Key
      const idempotencyKey = `idem_${reservationId || crypto.randomUUID()}`;

      const res = await fetch('/api/checkout/sandbox-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: user?.id || '00000000-0000-0000-0000-000000000005',
          customerName,
          customerEmail,
          customerPhone,
          eventId: event.id,
          ticketTypeId: ticketType.id,
          quantity: quantityParam,
          idempotencyKey,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Payment processing failed');
      }

      // Automatically sign in the buyer with their auto-created account!
      if (data.user?.id) {
        switchUser(data.user.id);
      }

      // Redirect to confirmation success page with order details and account confirmation
      const successParams = new URLSearchParams({
        orderId: data.order.id,
        orderNumber: data.order.order_number,
        autoCreated: data.autoCreatedAccount ? 'true' : 'false',
        email: customerEmail,
      });
      router.push(`/checkout/success?${successParams.toString()}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment failed. Please verify your details and try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Back button */}
      <Link href={`/events/${event.slug}`} className="inline-flex items-center text-xs text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
        Return to {event.title}
      </Link>

      {/* Reservation Timer Bar */}
      <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 mb-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-purple-300">
          <Clock className="w-4 h-4 text-purple-400 animate-pulse" />
          <span>
            Tickets temporarily held for: <strong className="text-white font-mono text-sm">{formatTimer(timeLeft)}</strong>
          </span>
        </div>
        <span className="text-slate-400 text-[11px]">
          Row-level database lock prevents other users from buying these {quantityParam} {ticketType.name} tickets.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Customer Info & Payment Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl glass-panel p-6 sm:p-8 border border-white/10 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Checkout & Buyer Details</h2>
              <p className="text-xs text-slate-400 mt-1">
                Your admission tickets and QR codes will be issued to this email address.
              </p>
            </div>

            {!user && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center justify-between">
                <span>Checking out as Guest. Admission QR pass will be emailed directly.</span>
                <Link href="/auth/login" className="text-[#ff4d6d] font-bold hover:underline ml-2">
                  Sign In / Register
                </Link>
              </div>
            )}

            <form onSubmit={handleCompletePayment} className="space-y-6">
              {/* Buyer Contact */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Full Legal Name (Attendee)
                  </label>
                  <Input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Email Address (Ticket Delivery)
                    </label>
                    <Input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="alex@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Mobile Number
                    </label>
                    <Input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </div>

              {/* Connected Merchant Direct Routing Notice */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    Payment Routing Verification
                  </span>
                  <Badge variant="success" className="font-mono text-[9px]">
                    Direct Charge
                  </Badge>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed">
                  Recipient Merchant:{' '}
                  <strong className="text-white">{organizer.business_name}</strong>
                </div>
                <div className="font-mono text-[10px] text-emerald-400 bg-slate-950 px-2 py-1 rounded border border-emerald-500/20 flex items-center justify-between">
                  <span>Merchant Gateway Account:</span>
                  <span>{organizer.stripe_account_id || 'NOT CONNECTED'}</span>
                </div>
              </div>

              {/* Payment Card Simulation */}
              <div className="space-y-4 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Payment Method</span>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Lock className="w-3.5 h-3.5 text-purple-400" />
                    <span>256-bit TLS Encrypted</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-purple-500/30 space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Card Number
                    </label>
                    <Input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      disabled={isPaymentBlocked}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Expiry
                      </label>
                      <Input
                        type="text"
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                        disabled={isPaymentBlocked}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        CVC / CVV
                      </label>
                      <Input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        disabled={isPaymentBlocked}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{errorMessage}</div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                variant="gradient"
                disabled={isPaymentBlocked || isProcessing || timeLeft <= 0}
                className="w-full h-12 text-base font-bold shadow-xl shadow-purple-600/30"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Verifying & Routing Direct Payment...
                  </span>
                ) : isPaymentBlocked ? (
                  'Payment Account Disconnected (Checkout Blocked)'
                ) : (
                  `Pay ${formatCurrency(totalAmount, ticketType.currency)} Directly to Organizer`
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Right: Order Summary (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl glass-panel p-6 sm:p-8 border border-white/10 space-y-6">
            <h3 className="text-base font-bold text-white tracking-tight border-b border-white/10 pb-3">
              Order Summary
            </h3>

            {/* Event Snippet */}
            <div className="flex gap-3">
              <img
                src={event.cover_image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80'}
                alt={event.title}
                className="w-16 h-16 rounded-xl object-cover shrink-0"
              />
              <div className="overflow-hidden">
                <span className="text-[10px] uppercase font-semibold text-purple-400 block truncate">
                  {event.category}
                </span>
                <h4 className="text-sm font-bold text-white truncate">{event.title}</h4>
                <div className="text-xs text-slate-400 truncate">{event.venue_name}, {event.venue_city}</div>
              </div>
            </div>

            {/* Ticket Breakdown */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-white block">{ticketType.name}</span>
                  <span className="text-slate-400">{quantityParam} × {formatCurrency(ticketType.price, ticketType.currency)}</span>
                </div>
                <span className="font-bold text-white font-mono">{formatCurrency(subtotal, ticketType.currency)}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Platform Commission</span>
                <span className="text-emerald-400 font-medium">$0.00 (0% Promo)</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Direct Merchant Processing</span>
                <span className="text-slate-300">Included</span>
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Total Due</span>
                <span className="text-2xl font-extrabold text-white">
                  {formatCurrency(totalAmount, ticketType.currency)}
                </span>
              </div>
              <Badge variant="glow">Instant QR Delivery</Badge>
            </div>

            {/* Single Organizer Notice */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-[11px] text-slate-400 space-y-1">
              <div className="text-slate-300 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Single-Organizer Checkout Policy</span>
              </div>
              <p className="leading-relaxed">
                To guarantee independent payment routing to {organizer.business_name}&apos;s merchant account, only tickets from this organizer can be purchased in this session.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-slate-400">Loading checkout session...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
