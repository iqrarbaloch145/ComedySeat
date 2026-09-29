'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { db } from '@/lib/data-store';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  Calendar, 
  MapPin, 
  Ticket, 
  Search, 
  CreditCard, 
  Building2, 
  Filter, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function EventsExplorePage() {
  const allEvents = db.getEvents({ status: 'published' });
  const categories = db.getCategories();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredEvents = useMemo(() => {
    return allEvents.filter((evt) => {
      // Category filter
      if (selectedCategory !== 'all' && evt.category !== selectedCategory) {
        return false;
      }
      // Type filter
      if (selectedType !== 'all' && evt.event_type !== selectedType) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = evt.title.toLowerCase().includes(q);
        const matchesDesc = evt.description.toLowerCase().includes(q);
        const matchesCity = evt.venue_city?.toLowerCase().includes(q) || false;
        const matchesOrg = evt.organizer?.business_name.toLowerCase().includes(q) || false;
        if (!matchesTitle && !matchesDesc && !matchesCity && !matchesOrg) {
          return false;
        }
      }
      return true;
    });
  }, [allEvents, selectedCategory, selectedType, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Page Header */}
      <div className="mb-8">
        <Badge variant="glow" className="mb-2">
          ComedySeat Marketplace
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Explore Comedy Events & Live Shows
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Browse upcoming stand-up specials, improv battles, open mics, and festival tours from top comedy producers.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl glass-panel mb-8 flex flex-col md:flex-row items-center gap-4 border border-white/10">
        {/* Search */}
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by show title, comedian, club, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-900/60"
          />
        </div>

        {/* Category Dropdown */}
        <div className="w-full md:w-1/4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-border/80 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Event Type Dropdown */}
        <div className="w-full md:w-1/4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-border/80 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="all">All Formats</option>
            <option value="in_person">In-Person Only</option>
            <option value="online">Online / Virtual</option>
          </select>
        </div>
      </div>

      {/* Results Count & Badges */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-6">
        <span>Showing <strong className="text-white">{filteredEvents.length}</strong> events</span>
        {(selectedCategory !== 'all' || selectedType !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedType('all');
              setSearchQuery('');
            }}
            className="text-purple-400 hover:text-purple-300 underline font-medium"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="p-12 text-center rounded-2xl glass-card border border-white/5 space-y-4">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No events match your criteria</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search terms or clearing filters to discover events across other categories.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedCategory('all');
              setSelectedType('all');
              setSearchQuery('');
            }}
          >
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((evt) => {
            const minPrice = evt.ticket_types && evt.ticket_types.length > 0 
              ? Math.min(...evt.ticket_types.map(t => t.price))
              : 0;

            const isOrgA = evt.organizer?.stripe_account_id === 'acct_org_louddmouth_001';
            const isOrgB = evt.organizer?.stripe_account_id === 'acct_org_standnyc_002';
            const isAdmin = evt.organizer?.stripe_account_id === 'acct_admin_comedyseat_001';
            const isDisconnected = !evt.organizer?.stripe_account_id || evt.organizer?.stripe_account_status === 'not_connected';

            return (
              <div 
                key={evt.id}
                className="group relative rounded-2xl overflow-hidden glass-card flex flex-col h-full"
              >
                {/* Image */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                  <img
                    src={evt.cover_image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80'}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  {/* Category Pill */}
                  <div className="absolute top-3 left-3">
                    <Badge variant="glow" className="backdrop-blur-md">
                      {evt.category}
                    </Badge>
                  </div>

                  {/* Payment Routing Badge */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white/90">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md border border-white/10 font-mono text-[10px]">
                      <CreditCard className="w-3 h-3 text-emerald-400" />
                      <span>
                        {isAdmin ? 'ComedySeat Special' : isOrgA ? "Sonny's LouddMouth" : isOrgB ? 'The Stand NYC' : isDisconnected ? 'No Gateway' : 'Org Merchant'}
                      </span>
                    </div>

                    {isDisconnected ? (
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30 text-[10px]">
                        Checkout Blocked
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 text-[10px]">
                        Direct Payout
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Date */}
                    <div className="flex items-center gap-2 text-xs text-purple-400 font-medium mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(evt.start_date)}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1 mb-2">
                      {evt.title}
                    </h3>

                    {/* Venue */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{evt.venue_name}, {evt.venue_city}</span>
                    </div>

                    {/* Organizer Info */}
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-white/5 mb-4">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-xs text-slate-300 truncate">
                        By <span className="font-semibold text-white">{evt.organizer?.business_name}</span>
                      </span>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wider">From</span>
                      <span className="text-xl font-extrabold text-white">
                        {formatCurrency(minPrice, evt.ticket_types?.[0]?.currency || 'usd')}
                      </span>
                    </div>
                    <Link href={`/events/${evt.slug}`}>
                      <Button size="sm" variant="gradient" className="rounded-lg">
                        <Ticket className="w-3.5 h-3.5 mr-1.5" />
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
  );
}
