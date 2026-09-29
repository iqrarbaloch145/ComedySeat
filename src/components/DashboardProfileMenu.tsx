'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  User,
  Settings,
  LogOut,
  Ticket,
  Building2,
  Shield,
  LayoutDashboard,
  ChevronDown,
} from 'lucide-react';

interface DashboardProfileMenuProps {
  /** Accent colour for the avatar ring – matches the dashboard theme */
  accentColor?: 'red' | 'amber' | 'purple';
  /** Called when the user clicks "Account Settings" — opens settings in-dashboard */
  onOpenSettings?: () => void;
}

export function DashboardProfileMenu({ accentColor = 'red', onOpenSettings }: DashboardProfileMenuProps) {
  const { user, organizer, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const ringColor =
    accentColor === 'amber'
      ? 'border-amber-400/70 shadow-amber-500/20'
      : accentColor === 'purple'
      ? 'border-purple-400/70 shadow-purple-500/20'
      : 'border-[#d9072a]/60 shadow-[#d9072a]/20';

  const roleBadgeClass =
    user.role === 'super_admin'
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      : user.role === 'organizer'
      ? 'bg-[#d9072a]/20 text-[#ff4d6d] border-[#d9072a]/30'
      : 'bg-sky-500/20 text-sky-300 border-sky-500/30';

  const roleLabel =
    user.role === 'super_admin'
      ? '🛡️ Super Admin'
      : user.role === 'organizer'
      ? '🏢 Organizer'
      : '🎟️ Comedy Fan';

  const dashboardHref =
    user.role === 'super_admin'
      ? '/dashboard/admin'
      : user.role === 'organizer'
      ? '/dashboard/organizer'
      : '/dashboard/customer';

  return (
    <div className="relative flex items-center gap-3">
      {/* Name text (hidden on small screens) */}
      <div className="hidden sm:block text-right">
        <div className="font-bold text-sm text-white leading-tight truncate max-w-[140px]">
          {user.full_name || 'User'}
        </div>
        <div
          className={`text-[10px] font-semibold ${
            accentColor === 'amber'
              ? 'text-amber-400'
              : accentColor === 'purple'
              ? 'text-purple-400'
              : 'text-[#ff4d6d]'
          }`}
        >
          {roleLabel}
        </div>
      </div>

      {/* Avatar button – no arrow */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-10 h-10 rounded-full border-2 overflow-hidden shadow-md flex items-center justify-center bg-slate-800 hover:scale-105 transition-transform ${ringColor}`}
        title="Account menu"
        aria-label="Open account menu"
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.full_name || 'User'}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-5 h-5 text-slate-300" />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Transparent backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-12 w-72 rounded-2xl bg-[#181622] border border-[#2d2945] shadow-2xl shadow-black/60 p-3 z-50 space-y-2">
            {/* Profile card */}
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-br from-[#d9072a]/10 to-white/[0.03] border border-[#d9072a]/20">
              <div
                className={`w-11 h-11 rounded-full border-2 overflow-hidden flex items-center justify-center bg-slate-800 shrink-0 ${ringColor}`}
              >
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
                {organizer && (
                  <div className="text-[10px] text-slate-500 truncate">{organizer.business_name}</div>
                )}
                <span
                  className={`inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleBadgeClass}`}
                >
                  {roleLabel}
                </span>
              </div>
            </div>

            {/* Navigation */}
            <div className="space-y-0.5 text-xs py-1">
              <Link
                href={dashboardHref}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition group"
              >
                <LayoutDashboard className="w-4 h-4 text-[#ff4d6d] group-hover:scale-110 transition-transform" />
                <span>My Dashboard</span>
              </Link>

              <Link
                href="/dashboard/customer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition group"
              >
                <Ticket className="w-4 h-4 text-[#ff4d6d] group-hover:scale-110 transition-transform" />
                <span>My Seats &amp; QR Tickets</span>
              </Link>

              {user.role === 'organizer' && (
                <Link
                  href="/dashboard/organizer"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition group"
                >
                  <Building2 className="w-4 h-4 text-[#d9072a] group-hover:scale-110 transition-transform" />
                  <span>Organizer Box Office</span>
                </Link>
              )}

              {user.role === 'super_admin' && (
                <Link
                  href="/dashboard/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition group"
                >
                  <Shield className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>Admin Management</span>
                </Link>
              )}
            </div>

            {/* Settings */}
            <div className="border-t border-white/5 pt-1.5 space-y-0.5 text-xs">
              <button
                onClick={() => {
                  setOpen(false);
                  if (onOpenSettings) {
                    onOpenSettings();
                  } else {
                    router.push('/profile/settings');
                  }
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition group text-left"
              >
                <Settings className="w-4 h-4 text-slate-400 group-hover:rotate-45 transition-transform duration-300" />
                <span>Account Settings</span>
              </button>
            </div>

            {/* Sign Out */}
            <div className="border-t border-white/5 pt-1.5">
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                  router.push('/');
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
  );
}
