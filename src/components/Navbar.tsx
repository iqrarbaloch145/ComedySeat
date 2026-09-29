'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/data-store';
import {
  Ticket,
  Calendar,
  Sparkles,
  Menu,
  X,
  User,
  Building2,
  Shield,
  LogIn,
  LogOut,
  UserPlus,
  Settings,
  LayoutDashboard,
} from 'lucide-react';
import { Button } from './ui/button';
import { ComedySeatLogo } from './ComedySeatLogo';

export function Navbar() {
  const pathname = usePathname();
  const { user, organizer, demoUsers, switchUser, logout, upgradeToOrganizer } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeMsg, setUpgradeMsg] = useState<string | null>(null);

  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/profile')) {
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

  const dashboardHref =
    user?.role === 'super_admin'
      ? '/dashboard/admin'
      : user?.role === 'organizer'
      ? '/dashboard/organizer'
      : '/dashboard/customer';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#16151a]/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <ComedySeatLogo size="md" subtitle="Pull Up A Seat To Comedy" />

            {/* Nav Links */}
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

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {upgradeMsg && (
              <span className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-full">
                {upgradeMsg}
              </span>
            )}

            {!user ? (
              <div className="flex items-center gap-2.5">
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-slate-200 hover:text-white hover:border-white/40 h-9 px-3.5 rounded-xl text-xs font-semibold"
                  >
                    <LogIn className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button
                    size="sm"
                    className="bg-[#d9072a] hover:bg-[#ca0c2a] text-white font-bold h-9 px-3.5 rounded-xl text-xs shadow-md shadow-[#d9072a]/20"
                  >
                    <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                    Register
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/* Quick role CTA buttons */}
                {user.role === 'customer' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBecomeOrganizer}
                    disabled={upgrading}
                    className="border-[#d9072a]/40 text-slate-200 hover:border-[#d9072a] hover:bg-[#d9072a]/10 h-9 rounded-xl text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#d9072a]" />
                    {upgrading ? 'Upgrading...' : 'Create Show'}
                  </Button>
                )}

                {user.role === 'organizer' && (
                  <Link href="/dashboard/organizer">
                    <Button
                      variant="comedy"
                      size="sm"
                      className="h-9 rounded-xl text-xs font-bold shadow-md shadow-[#d9072a]/25"
                    >
                      <Building2 className="w-3.5 h-3.5 mr-1.5" />
                      Organizer Portal
                    </Button>
                  </Link>
                )}

                {user.role === 'super_admin' && (
                  <Link href="/dashboard/admin">
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-500 hover:to-amber-400 h-9 rounded-xl text-xs font-bold shadow-md shadow-amber-500/20"
                    >
                      <Shield className="w-3.5 h-3.5 mr-1.5 text-amber-200" />
                      Super Admin
                    </Button>
                  </Link>
                )}

                <Link href="/dashboard/customer">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/10 hover:border-white/20 h-9 rounded-xl text-xs"
                  >
                    <Ticket className="w-3.5 h-3.5 mr-1.5 text-[#d9072a]" />
                    My Seats
                  </Button>
                </Link>

                {/* ── Profile Avatar Button (no arrow) ── */}
                <div className="relative">
                  <button
                    id="profile-menu-btn"
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="w-9 h-9 rounded-full bg-slate-800 border-2 border-[#d9072a]/60 hover:border-[#d9072a] flex items-center justify-center overflow-hidden transition-all shadow-md hover:shadow-[#d9072a]/30 hover:scale-105"
                    title={user.full_name || 'Account menu'}
                    aria-label="Open account menu"
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name || 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-slate-300" />
                    )}
                  </button>

                  {/* Dropdown */}
                  {accountMenuOpen && (
                    <>
                      {/* Backdrop to close on outside click */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setAccountMenuOpen(false)}
                      />

                      <div className="absolute right-0 top-11 w-72 rounded-2xl bg-[#181622] border border-[#2d2945] shadow-2xl shadow-black/60 p-3 z-50 space-y-2">
                        {/* Profile Header */}
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-br from-[#d9072a]/10 to-white/[0.03] border border-[#d9072a]/20">
                          <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-[#d9072a]/50 flex items-center justify-center overflow-hidden shrink-0">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.full_name || 'User'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-5 h-5 text-slate-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm text-white truncate">
                              {user.full_name || 'User'}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                            <span
                              className={`inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                user.role === 'super_admin'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : user.role === 'organizer'
                                  ? 'bg-[#d9072a]/20 text-[#ff4d6d] border border-[#d9072a]/30'
                                  : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                              }`}
                            >
                              {user.role === 'super_admin'
                                ? '🛡️ Super Admin'
                                : user.role === 'organizer'
                                ? '🏢 Organizer'
                                : '🎟️ Comedy Fan'}
                            </span>
                          </div>
                        </div>

                        {/* Main Nav Links */}
                        <div className="space-y-0.5 text-xs py-1">
                          <Link
                            href={dashboardHref}
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition group"
                          >
                            <LayoutDashboard className="w-4 h-4 text-[#ff4d6d] group-hover:scale-110 transition-transform" />
                            <span>My Dashboard</span>
                          </Link>

                          <Link
                            href="/dashboard/customer"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition group"
                          >
                            <Ticket className="w-4 h-4 text-[#ff4d6d] group-hover:scale-110 transition-transform" />
                            <span>My Seats &amp; QR Tickets</span>
                          </Link>

                          {user.role === 'organizer' && (
                            <Link
                              href="/dashboard/organizer"
                              onClick={() => setAccountMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition group"
                            >
                              <Building2 className="w-4 h-4 text-[#d9072a] group-hover:scale-110 transition-transform" />
                              <span>Organizer Box Office</span>
                            </Link>
                          )}

                          {user.role === 'super_admin' && (
                            <Link
                              href="/dashboard/admin"
                              onClick={() => setAccountMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition group"
                            >
                              <Shield className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                              <span>Admin Management</span>
                            </Link>
                          )}
                        </div>

                        {/* Settings */}
                        <div className="border-t border-white/5 pt-1.5 space-y-0.5 text-xs">
                          <Link
                            href="/profile/settings"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition group"
                          >
                            <Settings className="w-4 h-4 text-slate-400 group-hover:rotate-45 transition-transform duration-300" />
                            <span>Account Settings</span>
                          </Link>
                        </div>

                        {/* Demo Switcher */}
                        <div className="border-t border-white/5 pt-1.5">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#d9072a]" />
                            <span>Switch Demo Account</span>
                          </div>
                          <div className="space-y-0.5">
                            {demoUsers.map((u) => (
                              <button
                                key={u.id}
                                onClick={() => {
                                  switchUser(u.id);
                                  setAccountMenuOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition ${
                                  user.id === u.id
                                    ? 'bg-[#d9072a]/15 text-[#ff4d6d] font-bold border border-[#d9072a]/30'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                              >
                                <span className="truncate">{u.full_name}</span>
                                <span className="text-[9px] font-mono uppercase text-slate-500 shrink-0 ml-2">
                                  {u.role.replace('_', ' ')}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Sign Out */}
                        <div className="border-t border-white/5 pt-1.5">
                          <button
                            onClick={() => {
                              logout();
                              setAccountMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition text-left group"
                          >
                            <LogOut className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="w-8 h-8 rounded-full bg-slate-800 border border-[#d9072a]/60 flex items-center justify-center overflow-hidden"
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-slate-300" />
                )}
              </button>
            )}
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
            My Seats &amp; Tickets
          </Link>

          {user && (
            <>
              <Link
                href="/profile/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-800"
              >
                Account Settings
              </Link>
            </>
          )}

          {user?.role === 'organizer' && (
            <Link
              href="/dashboard/organizer"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-[#ff4d6d] hover:bg-[#d9072a]/10"
            >
              Organizer Dashboard &amp; Ticket Scanner
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

          {user ? (
            <div className="pt-2">
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/30 text-left flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 flex gap-2">
              <Link href="/auth/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">Sign In</Button>
              </Link>
              <Link href="/auth/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-[#d9072a] hover:bg-[#ca0c2a] text-white">Register</Button>
              </Link>
            </div>
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
