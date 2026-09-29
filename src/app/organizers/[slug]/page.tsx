'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { db } from '@/lib/data-store';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  Ticket, 
  ArrowLeft,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function PublicOrganizerPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const organizer = db.getOrganizerBySlug(slug);

  if (!organizer) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Organizer Not Found</h2>
        <p className="text-slate-400 text-sm mb-6">The requested organizer profile could not be found.</p>
        <Link href="/events">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </Link>
      </div>
    );
  }

  const organizerEvents = db.getEvents({ organizerId: organizer.id, status: 'published' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
      {/* Back button */}
      <Link href="/events" className="inline-flex items-center text-xs text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
        Back to all events
      </Link>

      {/* Organizer Hero Banner */}
      <div className="rounded-3xl glass-panel p-8 sm:p-12 relative overflow-hidden border border-white/10 shadow-2xl">
        <div className="hero-glow -right-20 -top-20 opacity-40" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-purple-900/50 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-xl shrink-0 overflow-hidden">
            {organizer.logo_url ? (
              <img src={organizer.logo_url} alt={organizer.business_name} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-10 h-10" />
            )}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {organizer.business_name}
              </h1>
              <Badge variant="glow" className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                Verified Producer
              </Badge>
              {organizer.stripe_account_id && (
                <Badge variant="success" className="flex items-center gap-1 font-mono text-[10px]">
                  <CreditCard className="w-3 h-3" />
                  Stripe Connected
                </Badge>
              )}
            </div>

            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              {organizer.bio || 'Independent event producer publishing verified experiences on EventHub.'}
            </p>

            {/* Contact details */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
              {organizer.support_email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-400" />
                  <span>{organizer.support_email}</span>
                </div>
              )}
              {organizer.website && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  <a href={organizer.website} target="_blank" rel="noreferrer" className="hover:underline text-slate-300">
                    {organizer.website.replace('https://', '')}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Events from this Organizer */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Events by {organizer.business_name}
          </h2>
          <span className="text-xs text-slate-400">
            {organizerEvents.length} Active {organizerEvents.length === 1 ? 'Event' : 'Events'}
          </span>
        </div>

        {organizerEvents.length === 0 ? (
          <div className="p-12 text-center rounded-2xl glass-card border border-white/5 space-y-3">
            <Ticket className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No active public events</h3>
            <p className="text-xs text-slate-400">This organizer does not have any published events right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {organizerEvents.map((evt) => {
              const minPrice = evt.ticket_types && evt.ticket_types.length > 0
                ? Math.min(...evt.ticket_types.map(t => t.price))
                : 0;

              return (
                <div key={evt.id} className="group rounded-2xl overflow-hidden glass-card flex flex-col h-full">
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                    <img
                      src={evt.cover_image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80'}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="glow">{evt.category}</Badge>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-purple-400 font-medium mb-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(evt.start_date)}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1 mb-2">
                        {evt.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{evt.venue_name}, {evt.venue_city}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">From</span>
                        <span className="text-xl font-extrabold text-white">
                          {formatCurrency(minPrice, evt.ticket_types?.[0]?.currency || 'usd')}
                        </span>
                      </div>
                      <Link href={`/events/${evt.slug}`}>
                        <Button size="sm" variant="gradient">
                          Select Tickets
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
