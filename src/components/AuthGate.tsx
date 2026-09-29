'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Lock, LogIn, UserPlus, ShieldAlert, Sparkles, User, Building2, Shield } from 'lucide-react';
import { Button } from './ui/button';

interface AuthGateProps {
  title?: string;
  message?: string;
  returnUrl?: string;
}

export function AuthGate({
  title = 'Authentication Required',
  message = 'Without logging in or registering, users cannot access account tools, edit payment settings, or manage tickets.',
  returnUrl = '/dashboard/customer',
}: AuthGateProps) {
  const { switchUser, demoUsers } = useAuth();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[#1c1a22] border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6 text-center">
        {/* Brand & Lock Badge */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-[#d9072a]/10 border border-[#d9072a]/30 flex items-center justify-center">
          <Lock className="w-8 h-8 text-[#d9072a]" />
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#d9072a] text-white flex items-center justify-center text-[10px] font-bold">
            !
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link href={`/auth/login?redirect=${encodeURIComponent(returnUrl)}`} className="flex-1">
            <Button className="w-full bg-[#d9072a] hover:bg-[#ca0c2a] text-white font-bold h-11 shadow-lg shadow-[#d9072a]/20">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </Link>
          <Link href={`/auth/register?redirect=${encodeURIComponent(returnUrl)}`} className="flex-1">
            <Button variant="outline" className="w-full border-white/20 hover:border-white/40 text-white font-medium h-11">
              <UserPlus className="w-4 h-4 mr-2 text-[#d9072a]" />
              Register
            </Button>
          </Link>
        </div>

        {/* Quick Demo Access Divider */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#d9072a]" />
            Instant One-Click Reviewer Access
          </div>
          <div className="grid grid-cols-1 gap-2 text-left">
            {demoUsers.map((u) => {
              const icon = u.role === 'super_admin' ? (
                <Shield className="w-4 h-4 text-amber-400" />
              ) : u.role === 'organizer' ? (
                <Building2 className="w-4 h-4 text-[#d9072a]" />
              ) : (
                <User className="w-4 h-4 text-sky-400" />
              );

              return (
                <button
                  key={u.id}
                  onClick={() => switchUser(u.id)}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {icon}
                    <div>
                      <div className="font-semibold text-white">{u.full_name}</div>
                      <div className="text-[10px] text-slate-400">{u.email}</div>
                    </div>
                  </div>
                  <span className="text-[9px] uppercase px-2 py-0.5 rounded bg-white/10 text-slate-300 font-mono">
                    {u.role.replace('_', ' ')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Return to Website Home Page option */}
        <div className="pt-1">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition py-2.5 px-4 rounded-xl border border-white/10 hover:border-[#d9072a]/50 bg-white/5 hover:bg-[#d9072a]/10 w-full group"
          >
            <span className="text-[#d9072a] group-hover:-translate-x-0.5 transition-transform">←</span>
            <span>Return to Website Home Page</span>
          </Link>
        </div>

        <div className="text-[11px] text-slate-400">
          Protected by ComedySeat Ticketing Security & Supabase Auth
        </div>
      </div>
    </div>
  );
}
