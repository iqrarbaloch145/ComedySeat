'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { 
  Ticket, 
  Calendar, 
  Sparkles, 
  Menu, 
  X, 
  User, 
  Building2, 
  Shield, 
  Smile
} from 'lucide-react';
import { Button } from './ui/button';
import { ComedySeatLogo } from './ComedySeatLogo';

export function Navbar() {
  const pathname = usePathname();
  const { user, upgradeToOrganizer } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeMsg, setUpgradeMsg] = useState<string | null>(null);

  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  const handleBecomeOrganizer = async () => {
    setUpgrading(true);
    const res = await upgradeToOrganizer();
    setUpgrading(false);
    if (res.success) {
      setUpgradeMsg('Welcome! You are now an Event Organizer.');
      setTimeout(() => setUpgradeMsg(null), 4000);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#16151a]/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo - ComedySeat Official */}
          <div className="flex items-center gap-8">
            <ComedySeatLogo size="md" subtitle="Pull Up A Seat To Comedy" />

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
              <Link href="/events" className="hover:text-white transition-colors flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#d9072a]" />
                Comedy Events
              </Link>
              <Link href="/events?category=Stand+up+Comedy" className="hover:text-white transition-colors">
                Stand Up
              </Link>
              <Link href="/events?category=Improv" className="hover:text-white transition-colors">
                Improv
              </Link>
              <Link href="/events?category=Open+Mic" className="hover:text-white transition-colors">
                Open Mic
              </Link>
              <Link href="/events?category=Comedy+Festivals" className="hover:text-white transition-colors">
                Festivals
              </Link>
            </nav>
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-4">
            {upgradeMsg && (
              <span className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-full animate-fadeIn">
                {upgradeMsg}
              </span>
            )}

            {!user ? (
              <div className="flex items-center gap-3">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm" className="border-white/20 text-slate-200 hover:text-white hover:border-white/40">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="bg-[#d9072a] hover:bg-[#ca0c2a] text-white font-bold shadow-md shadow-[#d9072a]/20">
                    Register
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {user.role === 'customer' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBecomeOrganizer}
                    disabled={upgrading}
                    className="border-[#d9072a]/40 text-slate-200 hover:border-[#d9072a] hover:bg-[#d9072a]/10"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#d9072a]" />
                    {upgrading ? 'Upgrading...' : 'Create Comedy Event'}
                  </Button>
                )}

                {user.role === 'organizer' && (
                  <Link href="/dashboard/organizer">
                    <Button variant="comedy" size="sm">
                      <Building2 className="w-3.5 h-3.5 mr-1.5" />
                      Organizer Portal
                    </Button>
                  </Link>
                )}

                {user.role === 'super_admin' && (
                  <Link href="/dashboard/admin">
                    <Button variant="default" size="sm" className="bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-500 hover:to-amber-400">
                      <Shield className="w-3.5 h-3.5 mr-1.5 text-amber-200" />
                      Super Admin
                    </Button>
                  </Link>
                )}

                {/* Customer Bookings / Dashboard */}
                <Link href="/dashboard/customer">
                  <Button variant="outline" size="sm" className="border-white/10 hover:border-white/20">
                    <Ticket className="w-3.5 h-3.5 mr-1.5 text-[#d9072a]" />
                    My Seats
                  </Button>
                </Link>

                {/* User Avatar with Sign Out button */}
                <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-[#d9072a]/40 flex items-center justify-center overflow-hidden">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-slate-300" />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#16151a] px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
          >
            All Comedy Events
          </Link>
          <Link
            href="/events?category=Stand+up+Comedy"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
          >
            Stand Up Comedy
          </Link>
          <Link
            href="/events?category=Improv"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
          >
            Improv
          </Link>
          <Link
            href="/events?category=Open+Mic"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
          >
            Open Mic
          </Link>
          <Link
            href="/dashboard/customer"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
          >
            My Seats & Tickets
          </Link>

          {user?.role === 'organizer' && (
            <Link
              href="/dashboard/organizer"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-[#ff4d6d] hover:bg-[#d9072a]/10"
            >
              Organizer Dashboard & Ticket Scanner
            </Link>
          )}

          {user?.role === 'super_admin' && (
            <Link
              href="/dashboard/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-amber-300 hover:bg-amber-950/40"
            >
              Super Admin Management Portal
            </Link>
          )}

          {user?.role === 'customer' && (
            <div className="pt-2">
              <Button
                onClick={() => {
                  handleBecomeOrganizer();
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-[#d9072a] hover:bg-[#ca0c2a] text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Become a Comedy Event Organizer
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
