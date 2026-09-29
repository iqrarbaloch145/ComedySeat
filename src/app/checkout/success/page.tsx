'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/data-store';
import { formatCurrency, formatDate } from '@/lib/utils';
import QRCode from 'qrcode';
import { 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Ticket, 
  Download, 
  Printer, 
  ArrowRight, 
  Building2, 
  ShieldCheck,
  CreditCard,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');
  const autoCreated = searchParams.get('autoCreated') === 'true';

  const order = orderId ? db.getOrderById(orderId) : null;
  const [qrImages, setQrImages] = useState<Record<string, string>>({});

  useEffect(() => {
    if (order?.tickets) {
      order.tickets.forEach(async (t) => {
        try {
          const url = await QRCode.toDataURL(t.qr_code_data, {
            width: 200,
            margin: 1,
            color: {
              dark: '#0f172a',
              light: '#ffffff',
            },
          });
          setQrImages(prev => ({ ...prev, [t.id]: url }));
        } catch (err) {
          console.error('QR code generation error', err);
        }
      });
    }
  }, [order]);

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Order Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">We could not load the details for this order.</p>
        <Link href="/events">
          <Button variant="outline">Back to Comedy Shows</Button>
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
      {/* Top Banner Success */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <Badge variant="success">Payment Confirmed & Verified</Badge>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          You&apos;re Going to {order.event?.title}!
        </h1>
        <p className="text-sm text-slate-300 max-w-lg mx-auto">
          Your order <strong className="text-white font-mono">{order.order_number}</strong> was successfully charged directly by{' '}
          <strong className="text-white">{order.organizer?.business_name}</strong>.
        </p>
      </div>

      {/* Auto-Account Created Notice */}
      {autoCreated && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#d9072a]/20 via-[#1c1a22] to-[#1c1a22] border border-[#d9072a]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-left shadow-xl">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#d9072a] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#d9072a]/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-base text-white flex items-center gap-2">
                ComedySeat Account Created Automatically!
                <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px] border border-emerald-500/30">
                  Signed In
                </Badge>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                We created your account for <strong className="text-white">{order.customer_email}</strong>. Your tickets, digital QR passes, and comedy bookings are securely saved in your personal seat wallet.
              </p>
            </div>
          </div>
          <Link href="/dashboard/customer" className="shrink-0 w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-[#d9072a] hover:bg-[#ca0c2a] text-white font-bold text-xs h-10 shadow-lg shadow-[#d9072a]/20">
              <Ticket className="w-3.5 h-3.5 mr-1.5" />
              View My Seats
            </Button>
          </Link>
        </div>
      )}

      {/* Payment Routing Receipt Box */}
      <div className="p-4 rounded-2xl bg-[#1c1a22] border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="font-semibold text-white">Direct Box Office Payout Confirmed</div>
            <div className="text-slate-400">
              Payment was processed directly into comedy club account:{' '}
              <span className="font-mono text-emerald-400">{order.payment_gateway_account_id}</span>
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Charged</span>
          <span className="text-lg font-bold text-white font-mono">
            {formatCurrency(order.total_amount, order.currency)}
          </span>
        </div>
      </div>

      {/* Issued Tickets Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#d9072a]" />
            Your Comedy Admission Passes ({order.tickets?.length || 0})
          </h2>
          <Button variant="outline" size="sm" onClick={handlePrint} className="print:hidden border-white/20 hover:border-white/40">
            <Printer className="w-3.5 h-3.5 mr-1.5 text-[#d9072a]" />
            Print / Save Passes
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {order.tickets?.map((ticket, idx) => (
            <div
              key={ticket.id}
              className="rounded-2xl bg-white text-slate-900 p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between border-2 border-slate-200"
            >
              {/* Ticket Cutout Dots for aesthetic pass */}
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-950" />
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-950" />

              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#d9072a]">
                    Admission Pass #{idx + 1}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                    {ticket.status}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-950 leading-tight mb-2">
                  {order.event?.title}
                </h3>

                <div className="space-y-1 text-xs text-slate-600 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#d9072a]" />
                    <span>{formatDate(order.event?.start_date || '')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#d9072a]" />
                    <span className="truncate">{order.event?.venue_name}, {order.event?.venue_city}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs mb-4">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Attendee</div>
                  <div className="font-bold text-slate-900">{ticket.attendee_name}</div>
                  <div className="text-[11px] text-slate-600 font-mono">{ticket.attendee_email}</div>
                </div>
              </div>

              {/* QR Code and Code Section */}
              <div className="flex items-center justify-between pt-3 border-t border-dashed border-slate-300">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    Ticket Code
                  </div>
                  <div className="font-mono text-xs font-black tracking-wider text-slate-950 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block">
                    {ticket.ticket_code}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono truncate max-w-[130px]">
                    Hash: {ticket.security_hash.slice(0, 14)}...
                  </div>
                </div>

                {qrImages[ticket.id] ? (
                  <img
                    src={qrImages[ticket.id]}
                    alt={`QR Code ${ticket.ticket_code}`}
                    className="w-20 h-20 rounded-lg border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] text-slate-400">
                    Loading QR...
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <Link href="/dashboard/customer">
          <Button variant="outline" className="w-full sm:w-auto">
            View in Customer Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
        <Link href="/events">
          <Button variant="default" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white">
            Discover More Events
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-slate-400">Loading order receipt...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
