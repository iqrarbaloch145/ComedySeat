'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Lock, CreditCard, Heart, Smile } from 'lucide-react';
import { ComedySeatLogo } from './ComedySeatLogo';

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/dashboard')) {
    return null;
  }
  return (
    <footer className="border-t border-white/10 bg-[#121115] text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <ComedySeatLogo size="md" subtitle="Pull Up A Seat To Comedy" />
            <img
              src="/images/comedyseat-logo.png"
              alt="ComedySeat - Pull Up A Seat To Comedy"
              className="h-7 w-auto object-contain opacity-90"
            />
            <p className="text-xs text-slate-400 leading-relaxed">
              Pull Up A Seat To Comedy. The exclusive comedy event ticketing marketplace where comedy clubs, stand-up producers, and independent festival creators receive payments directly into their own connected merchant accounts.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#ff4d6d] font-medium">
              <Shield className="w-3.5 h-3.5" />
              Direct Connected Merchant Payouts
            </div>
          </div>

          {/* Discover Comedy */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Comedy Happenings</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/events?category=Stand+up+Comedy" className="hover:text-white transition-colors">Stand up Comedy</Link></li>
              <li><Link href="/events?category=Improv" className="hover:text-white transition-colors">Improv Shows</Link></li>
              <li><Link href="/events?category=Open+Mic" className="hover:text-white transition-colors">Open Mic Nights</Link></li>
              <li><Link href="/events?category=Comedy+Festivals" className="hover:text-white transition-colors">Comedy Festivals</Link></li>
              <li><Link href="/events?category=Comedy+Theater" className="hover:text-white transition-colors">Comedy Theater</Link></li>
              <li><Link href="/events?category=Comedy+Courses" className="hover:text-white transition-colors">Comedy Workshops & Courses</Link></li>
            </ul>
          </div>

          {/* For Organizers */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">For Comedy Producers</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/dashboard/organizer" className="hover:text-white transition-colors">Organizer Workspace</Link></li>
              <li><Link href="/dashboard/organizer" className="hover:text-white transition-colors">Stripe Connect Direct Setup</Link></li>
              <li><Link href="/dashboard/organizer" className="hover:text-white transition-colors">Real-Time QR Ticket Scanner</Link></li>
              <li><Link href="/dashboard/organizer" className="hover:text-white transition-colors">Attendee List CSV Export</Link></li>
            </ul>
          </div>

          {/* Direct Payout Guarantee */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Payment Routing</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Every comedy club and producer receives ticket sale proceeds directly into their own merchant account. Zero intermediary pooling.
            </p>
            <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1.5 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Lock className="w-3 h-3 text-[#d9072a]" />
                <span>Anti-Overselling Concurrency Lock</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <CreditCard className="w-3 h-3 text-emerald-400" />
                <span>Stripe Connect Direct Charges</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            2024–{new Date().getFullYear()} Copyright © Comedy Seat – Exclusive Comedy Event Ticket Marketplace. Powered by LouddMouth Brand.
          </div>
          <div className="flex items-center gap-6">
            <span>Direct Connected Merchant Gateways</span>
            <span>RLS Protected Supabase PostgreSQL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
