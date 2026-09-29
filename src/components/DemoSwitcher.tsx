'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/types/database';
import { Shield, Sparkles, Building2, User, ChevronDown, Check, ArrowRight, LogIn, LogOut, Lock } from 'lucide-react';
import Link from 'next/link';

export function DemoSwitcher() {
  const pathname = usePathname();
  const { user, organizer, demoUsers, switchUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return <Shield className="w-4 h-4 text-amber-400" />;
      case 'organizer':
        return <Building2 className="w-4 h-4 text-[#ff4d6d]" />;
      case 'customer':
      default:
        return <User className="w-4 h-4 text-sky-400" />;
    }
  };

  const getDashboardLink = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return '/dashboard/admin';
      case 'organizer':
        return '/dashboard/organizer';
      case 'customer':
      default:
        return '/dashboard/customer';
    }
  };

  // If user is logged out / guest
  if (!user) {
    return (
      <div className="bg-[#121117] border-b border-[#d9072a]/30 px-4 py-2 text-xs backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-400" />
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              Guest / Unauthenticated Mode:
            </span>
            <span className="text-slate-400 hidden sm:inline">
              Account and payment management are strictly locked without logging in.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/15 text-slate-300 hover:bg-white/10 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#ff4d6d]" />
                <span className="font-medium">Quick Sign-In</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 rounded-2xl bg-[#1c1a22] border border-white/15 shadow-2xl p-2 z-50 backdrop-blur-xl">
                  <div className="text-[11px] font-semibold text-slate-400 px-2 py-1.5 border-b border-white/10">
                    Sign in with test account:
                  </div>
                  <div className="space-y-1 mt-1">
                    {demoUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setIsOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-xl flex items-start justify-between transition-all hover:bg-white/10 text-slate-300"
                      >
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5">{getRoleIcon(u.role)}</div>
                          <div>
                            <div className="font-medium text-white">{u.full_name}</div>
                            <div className="text-[10px] text-slate-400">{u.email}</div>
                          </div>
                        </div>
                        <span className="uppercase text-[9px] tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">
                          {u.role.replace('_', ' ')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/auth/login"
              className="flex items-center gap-1 px-3 py-1 rounded-md bg-[#d9072a] hover:bg-[#ca0c2a] text-white font-semibold transition-all shadow-sm shadow-[#d9072a]/30"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // When logged in
  return (
    <div className="bg-[#121117] border-b border-[#d9072a]/30 px-4 py-2 text-xs backdrop-blur-md sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#ff4d6d]" />
            Active Session:
          </span>
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#d9072a]/15 border border-[#d9072a]/30 text-rose-200 hover:bg-[#d9072a]/25 transition-all"
            >
              {getRoleIcon(user.role)}
              <span className="font-medium text-white">{user.full_name}</span>
              <span className="uppercase text-[10px] tracking-wider px-1.5 py-0.2 rounded bg-[#d9072a]/20 text-[#ff4d6d] border border-[#d9072a]/30">
                {user.role.replace('_', ' ')}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-rose-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 rounded-2xl bg-[#1c1a22] border border-white/15 shadow-2xl p-2 z-50 backdrop-blur-xl">
                <div className="text-[11px] font-semibold text-slate-400 px-2 py-1.5 border-b border-white/10">
                  Switch active account:
                </div>
                <div className="space-y-1 mt-1">
                  {demoUsers.map((u) => {
                    const isSelected = u.id === user.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-xl flex items-start justify-between transition-all ${
                          isSelected
                            ? 'bg-[#d9072a]/20 border border-[#d9072a]/40 text-white'
                            : 'hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5">{getRoleIcon(u.role)}</div>
                          <div>
                            <div className="font-medium flex items-center gap-1.5">
                              {u.full_name}
                              {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 inline" />}
                            </div>
                            <div className="text-[10px] text-slate-400">{u.email}</div>
                          </div>
                        </div>
                        <span className="uppercase text-[9px] tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">
                          {u.role.replace('_', ' ')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {organizer && (
            <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
              <span>Merchant Account:</span>
              {organizer.stripe_account_id ? (
                <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-mono text-[10px]">
                  {organizer.stripe_account_id} ({organizer.stripe_account_status})
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/30 text-rose-400 font-mono text-[10px]">
                  Disconnected (Blocks Checkout)
                </span>
              )}
            </div>
          )}

          <Link
            href={getDashboardLink(user.role)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#d9072a] hover:bg-[#ca0c2a] text-white font-medium transition-all shadow-sm shadow-[#d9072a]/30"
          >
            Go to {user.role === 'super_admin' ? 'Admin' : user.role === 'organizer' ? 'Organizer' : 'Customer'} Dashboard
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={logout}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 border border-white/15 text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            title="Log out to test Guest mode"
          >
            <LogOut className="w-3 h-3 text-rose-400" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
