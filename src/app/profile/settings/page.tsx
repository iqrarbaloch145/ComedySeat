'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/data-store';
import {
  User,
  Mail,
  Camera,
  Save,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Shield,
  Building2,
  Ticket,
  Sparkles,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ComedySeatLogo } from '@/components/ComedySeatLogo';

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=200&q=80',
];

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, logout, upgradeToOrganizer } = useAuth();

  // Redirect if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0c0b16] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-slate-400 text-sm">You must be signed in to access settings.</p>
          <Link href="/auth/login">
            <Button className="bg-[#d9072a] hover:bg-[#ca0c2a] text-white">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  const [fullName, setFullName] = useState(user.full_name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar_url || SAMPLE_AVATARS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim()) {
      setErrorMsg('Name cannot be empty.');
      return;
    }
    setSaving(true);
    setErrorMsg(null);

    try {
      db.updateProfile(user.id, {
        full_name: fullName.trim(),
        avatar_url: selectedAvatar,
      });
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setErrorMsg('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    const res = await upgradeToOrganizer();
    setUpgrading(false);
    if (res.success) {
      setSuccessMsg(res.message);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const dashboardHref =
    user.role === 'super_admin'
      ? '/dashboard/admin'
      : user.role === 'organizer'
      ? '/dashboard/organizer'
      : '/dashboard/customer';

  const roleColor =
    user.role === 'super_admin'
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      : user.role === 'organizer'
      ? 'bg-[#d9072a]/20 text-[#ff4d6d] border-[#d9072a]/40'
      : 'bg-sky-500/20 text-sky-300 border-sky-500/40';

  return (
    <div className="min-h-screen bg-[#0c0b16] text-white">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-[#16151a]/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition flex items-center gap-1.5 text-xs"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <span className="text-white/10">/</span>
            <span className="text-xs text-slate-300 font-medium">Account Settings</span>
          </div>

          <div className="flex items-center gap-2">
            <Link href={dashboardHref}>
              <Button variant="outline" size="sm" className="border-white/10 text-slate-300 hover:text-white h-8 text-xs rounded-xl">
                Dashboard
              </Button>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-rose-400 hover:bg-rose-950/30 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-black tracking-tight">Account Settings</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your ComedySeat profile, avatar, and account preferences.</p>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-sm text-rose-300 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-sm text-emerald-300 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left – Profile Picture */}
          <div className="lg:col-span-1 space-y-4">
            {/* Current Avatar Preview */}
            <div className="bg-[#1c1a22] border border-white/10 rounded-3xl p-6 text-center space-y-4">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full mx-auto border-4 border-[#d9072a]/60 overflow-hidden shadow-xl shadow-[#d9072a]/10">
                  <img
                    src={selectedAvatar}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = SAMPLE_AVATARS[0];
                    }}
                  />
                </div>
                <div className="absolute bottom-0 right-0 w-7 h-7 bg-[#d9072a] rounded-full flex items-center justify-center border-2 border-[#1c1a22] shadow">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              <div>
                <div className="font-bold text-white text-sm">{fullName || user.full_name || 'User'}</div>
                <div className="text-xs text-slate-400">{user.email}</div>
                <span className={`inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${roleColor}`}>
                  {user.role === 'super_admin' ? '🛡️ Super Admin' : user.role === 'organizer' ? '🏢 Organizer' : '🎟️ Comedy Fan'}
                </span>
              </div>
            </div>

            {/* Custom URL Input */}
            <div className="bg-[#1c1a22] border border-white/10 rounded-3xl p-5 space-y-3">
              <label className="text-xs font-semibold text-slate-300 block">Custom Photo URL</label>
              <Input
                type="url"
                placeholder="https://your-image-url.com/photo.jpg"
                value={customAvatarUrl}
                onChange={(e) => setCustomAvatarUrl(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-[#d9072a] text-xs"
              />
              <Button
                onClick={() => {
                  if (customAvatarUrl.trim()) {
                    setSelectedAvatar(customAvatarUrl.trim());
                  }
                }}
                variant="outline"
                size="sm"
                className="w-full border-white/20 text-slate-300 hover:border-[#d9072a] text-xs h-8"
              >
                <Camera className="w-3.5 h-3.5 mr-1.5" />
                Use This Photo
              </Button>
            </div>
          </div>

          {/* Right – Form */}
          <div className="lg:col-span-2 space-y-4">
            {/* Profile Info */}
            <div className="bg-[#1c1a22] border border-white/10 rounded-3xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-[#ff4d6d]" />
                Profile Information
              </h2>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Display Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-[#d9072a]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    type="email"
                    value={user.email}
                    disabled
                    className="pl-9 bg-white/5 border-white/10 text-slate-400 cursor-not-allowed opacity-60"
                  />
                </div>
                <p className="text-[11px] text-slate-500">Email cannot be changed in this demo.</p>
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#d9072a] hover:bg-[#ca0c2a] text-white font-bold w-full h-10 shadow-lg shadow-[#d9072a]/20"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </Button>
            </div>

            {/* Avatar Picker Grid */}
            <div className="bg-[#1c1a22] border border-white/10 rounded-3xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#ff4d6d]" />
                Choose Profile Picture
              </h2>
              <p className="text-xs text-slate-400">Click any avatar below to set it as your profile photo.</p>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {SAMPLE_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedAvatar(url)}
                    className={`relative aspect-square rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${
                      selectedAvatar === url
                        ? 'border-[#d9072a] shadow-lg shadow-[#d9072a]/30 scale-110'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img src={url} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover" />
                    {selectedAvatar === url && (
                      <div className="absolute inset-0 bg-[#d9072a]/20 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Role / Account Type */}
            <div className="bg-[#1c1a22] border border-white/10 rounded-3xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                {user.role === 'super_admin' ? (
                  <Shield className="w-4 h-4 text-amber-400" />
                ) : user.role === 'organizer' ? (
                  <Building2 className="w-4 h-4 text-[#ff4d6d]" />
                ) : (
                  <Ticket className="w-4 h-4 text-sky-400" />
                )}
                Account Type &amp; Role
              </h2>

              <div className={`p-4 rounded-2xl border ${roleColor} bg-transparent`}>
                <div className="font-bold text-sm mb-1">
                  {user.role === 'super_admin'
                    ? '🛡️ Platform Super Administrator'
                    : user.role === 'organizer'
                    ? '🏢 Comedy Club / Event Organizer'
                    : '🎟️ Comedy Fan / Ticket Buyer'}
                </div>
                <div className="text-xs text-slate-400">
                  {user.role === 'super_admin' &&
                    'Full platform access: venue approvals, audit logs, fee management and analytics.'}
                  {user.role === 'organizer' &&
                    'Box office access: create shows, sell tickets, direct Stripe payouts and QR scanner.'}
                  {user.role === 'customer' &&
                    'Fan access: browse events, reserve comedy seats, manage QR tickets and check-in.'}
                </div>
              </div>

              {user.role === 'customer' && (
                <Button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  variant="outline"
                  className="border-[#d9072a]/40 text-slate-200 hover:border-[#d9072a] hover:bg-[#d9072a]/10 w-full h-10 text-xs"
                >
                  <Sparkles className="w-4 h-4 mr-2 text-[#d9072a]" />
                  {upgrading ? 'Upgrading...' : 'Upgrade to Event Organizer Account'}
                </Button>
              )}
            </div>

            {/* Danger Zone */}
            <div className="bg-[#1c1a22] border border-rose-500/20 rounded-3xl p-6 space-y-3">
              <h2 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Session
              </h2>
              <p className="text-xs text-slate-400">Sign out of your ComedySeat account on this device.</p>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-rose-500/40 text-rose-400 hover:bg-rose-950/40 hover:border-rose-400 w-full h-10 text-xs"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out of ComedySeat
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
