import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/data-store';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  Calendar, 
  MapPin, 
  Ticket, 
  ArrowRight, 
  ShieldCheck, 
  CreditCard, 
  Sparkles, 
  Lock, 
  Building2,
  Search,
  CheckCircle2,
  Mic,
  Smile,
  Radio,
  PartyPopper,
  Theater,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  const events = db.getEvents({ status: 'published' });
  const categories = db.getCategories();
  const featuredEvents = events.filter(e => e.is_featured);

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'stand-up-comedy':
        return <Mic className="w-6 h-6" />;
      case 'improv':
        return <Smile className="w-6 h-6" />;
      case 'open-mic':
        return <Radio className="w-6 h-6" />;
      case 'comedy-festivals':
        return <PartyPopper className="w-6 h-6" />;
      case 'comedy-theater':
        return <Theater className="w-6 h-6" />;
      case 'comedy-courses':
        return <GraduationCap className="w-6 h-6" />;
      default:
        return <Ticket className="w-6 h-6" />;
    }
  };

  return (
    <div className="flex flex-col gap-20 pb-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-16 pb-16 md:pt-24 md:pb-24 overflow-hidden border-b border-white/5">
        <div className="hero-glow top-0 left-1/4 -translate-x-1/2 opacity-30" />
        <div className="hero-glow bottom-0 right-10 opacity-30" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Official Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d9072a]/15 border border-[#d9072a]/30 text-[#ff4d6d] text-xs font-semibold mb-6 shadow-inner backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#d9072a]" />
            <span>Pull Up A Seat To Comedy — Exclusive Ticketing Marketplace</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Discover Stand-Up, Improv & <br />
            <span className="text-[#d9072a]">Live Comedy Specials.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            The dedicated comedy ticketing marketplace. Reserve front-row tables, general admission seats, and VIP passes directly from renowned comedy clubs and independent producers.
          </p>

          {/* Quick Search Bar */}
          <div className="mt-10 max-w-3xl mx-auto">
            <form action="/events" method="GET" className="p-2 rounded-2xl bg-[#1c1a22]/90 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-center gap-2 border border-white/10">
              <div className="flex items-center gap-3 px-4 py-2 w-full sm:w-1/2 border-b sm:border-b-0 sm:border-r border-white/10">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  name="search"
                  placeholder="Search comedians, clubs, tours..."
                  className="bg-transparent border-none text-sm text-white placeholder:text-slate-400 focus:outline-none w-full"
                />
              </div>
              <div className="flex items-center gap-3 px-4 py-2 w-full sm:w-1/3">
                <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  name="city"
                  placeholder="City (New York, Chicago...)"
                  className="bg-transparent border-none text-sm text-white placeholder:text-slate-400 focus:outline-none w-full"
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto h-11 px-6 rounded-xl bg-[#d9072a] hover:bg-[#ca0c2a] text-white font-bold shrink-0 shadow-lg shadow-[#d9072a]/30">
                Find Seats
              </Button>
            </form>
          </div>

          {/* Value Props Pills */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Direct Box Office Payouts</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#d9072a]" />
              <span>10-Minute Anti-Overselling Seat Hold</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>Cryptographic QR Admission Passes</span>
            </div>
          </div>
        </div>
      </section>

      {/* ComedySeat Passport Highlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl bg-gradient-to-r from-[#ca0c2a]/20 via-[#1c1a22] to-[#0f0e12] p-8 sm:p-10 border border-[#d9072a]/30 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <Badge className="bg-[#d9072a] text-white font-bold uppercase tracking-wider text-[10px]">
              Special Marketplace Perk
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Get Your ComedySeat Passport ($25)
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Unlock priority table reservations, waived 2-item minimum surcharges at participating clubs, and 15% off national comedy tour headliners.
            </p>
          </div>
          <Link href="/events">
            <Button size="lg" className="bg-[#d9072a] hover:bg-[#ca0c2a] text-white font-bold px-8 shadow-xl shadow-[#d9072a]/30 shrink-0">
              <Ticket className="w-4 h-4 mr-2" />
              Claim Your Passport
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Comedy Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#ff4d6d] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Headliners & Specials
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Featured Comedy Shows
            </h2>
          </div>
          <Link href="/events">
            <Button variant="outline" size="sm" className="border-white/20 hover:border-white/40 group">
              View All Comedy Shows
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredEvents.map((evt) => {
            const minPrice = evt.ticket_types && evt.ticket_types.length > 0 
              ? Math.min(...evt.ticket_types.map(t => t.price))
              : 0;

            const isOrgA = evt.organizer?.stripe_account_id === 'acct_org_louddmouth_001';
            const isOrgB = evt.organizer?.stripe_account_id === 'acct_org_standnyc_002';
            const isAdmin = evt.organizer?.stripe_account_id === 'acct_admin_comedyseat_001';

            return (
              <div 
                key={evt.id}
                className="group relative rounded-2xl overflow-hidden bg-[#1c1a22] border border-white/10 flex flex-col h-full hover:border-[#d9072a]/50 transition-all duration-300"
              >
                {/* Image & Badges */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                  <img
                    src={evt.cover_image_url || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80'}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1c1a22] via-[#1c1a22]/30 to-transparent" />
                  
                  {/* Category Pill */}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-[#d9072a]/80 text-white backdrop-blur-md font-semibold text-xs border border-white/10">
                      {evt.category}
                    </Badge>
                  </div>

                  {/* Payment Routing Badge */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white/90">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#16151a]/90 backdrop-blur-md border border-white/10 font-mono text-[10px]">
                      <CreditCard className="w-3 h-3 text-emerald-400" />
                      <span>
                        {isAdmin ? 'ComedySeat Special' : isOrgA ? "Sonny's LouddMouth" : isOrgB ? 'The Stand NYC' : 'Club Merchant'}
                      </span>
                    </div>
                    <div className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 text-[10px]">
                      Direct Payout
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Date & Time */}
                    <div className="flex items-center gap-2 text-xs text-[#ff4d6d] font-semibold mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(evt.start_date)}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white group-hover:text-[#ff4d6d] transition-colors line-clamp-1 mb-2">
                      {evt.title}
                    </h3>

                    {/* Venue / City */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{evt.venue_name}, {evt.venue_city}</span>
                    </div>

                    {/* Organizer link */}
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5 mb-4">
                      <Building2 className="w-3.5 h-3.5 text-[#ff4d6d] shrink-0" />
                      <span className="text-xs text-slate-300 truncate">
                        Produced by <span className="font-semibold text-white">{evt.organizer?.business_name}</span>
                      </span>
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Seats from</span>
                      <span className="text-xl font-extrabold text-white">
                        {formatCurrency(minPrice, evt.ticket_types?.[0]?.currency || 'usd')}
                      </span>
                    </div>
                    <Link href={`/events/${evt.slug}`}>
                      <Button size="sm" className="bg-[#d9072a] hover:bg-[#ca0c2a] text-white font-bold rounded-xl shadow-md shadow-[#d9072a]/20">
                        <Ticket className="w-3.5 h-3.5 mr-1.5" />
                        Select Seats
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Browse by Comedy Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-6">
          Explore by Comedy Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/events?category=${encodeURIComponent(cat.name)}`}
              className="p-5 rounded-2xl bg-[#1c1a22] border border-white/10 hover:border-[#d9072a]/40 flex flex-col items-center text-center group cursor-pointer transition-all hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#d9072a]/15 border border-[#d9072a]/30 flex items-center justify-center text-[#ff4d6d] group-hover:scale-110 group-hover:bg-[#d9072a] group-hover:text-white transition-all mb-3 shadow-md">
                {getCategoryIcon(cat.slug)}
              </div>
              <span className="text-sm font-semibold text-white group-hover:text-[#ff4d6d] transition-colors">
                {cat.name}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                {cat.description}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Platform Architecture & Payment Routing Guarantee */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl bg-[#1c1a22] p-8 sm:p-12 relative overflow-hidden border border-[#d9072a]/20 shadow-2xl">
          <div className="hero-glow -right-20 -top-20 opacity-30" />
          
          <div className="max-w-3xl mb-10 relative z-10">
            <Badge className="bg-[#d9072a]/20 text-[#ff4d6d] border border-[#d9072a]/40 mb-4 font-semibold">
              Marketplace Integrity & Direct Payments
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Engineered for Comedy Club Direct Payments & Security
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
              ComedySeat operates with strict direct payment routing, cryptographic seat reservation locks, and tamper-proof admission passes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {/* Column 1 */}
            <div className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Direct Connected Payouts</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When you buy tickets to Sonny&apos;s LouddMouth, payments route straight into his connected Stripe account. When you book The Stand NYC, it credits their account directly. Zero platform pooling.
              </p>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium pt-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Direct Charges</span>
              </div>
            </div>

            {/* Column 2 */}
            <div className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#d9072a]/20 border border-[#d9072a]/30 flex items-center justify-center text-[#ff4d6d]">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Anti-Overselling Concurrency</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tickets are reserved with PostgreSQL row locks and strict 10-minute expiration timers. Sold-out comedy club tables can never be double-booked.
              </p>
              <div className="text-[11px] text-[#ff4d6d] flex items-center gap-1.5 font-medium pt-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Atomic DB Reservation Locks</span>
              </div>
            </div>

            {/* Column 3 */}
            <div className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Duplicate Admission Defense</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Each admission ticket generates a tamper-proof QR code with an individual SHA-256 signature. Door staff scans it in real-time, preventing screenshot reuse.
              </p>
              <div className="text-[11px] text-sky-400 flex items-center gap-1.5 font-medium pt-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Real-Time Check-In Scanner</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Organizer Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl bg-gradient-to-r from-[#d9072a]/25 via-[#1c1a22] to-black p-8 sm:p-12 border border-[#d9072a]/30 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Are you a Comedy Club or Producer?
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Register your comedy club, connect your Stripe account, create ticket tiers with table options, and start selling comedy tickets in minutes.
            </p>
          </div>
          <Link href="/dashboard/organizer">
            <Button size="lg" className="bg-[#d9072a] hover:bg-[#ca0c2a] text-white font-bold shadow-xl shadow-[#d9072a]/30">
              <Building2 className="w-4 h-4 mr-2" />
              Open Box Office Portal
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
