'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ComedySeatLogo } from '@/components/ComedySeatLogo';
import { 
  Lock, 
  Mail, 
  User, 
  Building2, 
  Shield, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Ticket, 
  Sparkles,
  LogIn,
  UserPlus,
  BadgeCheck
} from 'lucide-react';

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRoleParam = searchParams.get('role') as UserRole | null;
  const redirectUrl = searchParams.get('redirect');

  const { register } = useAuth();
  const [role, setRole] = useState<UserRole>(
    initialRoleParam === 'organizer' ? 'organizer' : 
    initialRoleParam === 'super_admin' ? 'super_admin' : 'customer'
  );
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      setErrorMsg('Full name and email address are required.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await register(fullName, email, password, role, businessName);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        const dest = redirectUrl || (
          role === 'organizer' 
            ? '/dashboard/organizer' 
            : role === 'super_admin' 
            ? '/dashboard/admin' 
            : '/dashboard/customer'
        );
        router.push(dest);
      }, 600);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-[#1c1a22] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <ComedySeatLogo size="lg" subtitle="Pull Up A Seat To Comedy" />
          <h1 className="text-2xl font-black text-white tracking-tight pt-2">
            Create Your Account
          </h1>
          <p className="text-xs text-slate-400">
            Join the dedicated comedy ticketing network as a fan, club organizer, or administrator.
          </p>
        </div>

        {/* Top Toggle: Sign In vs Register */}
        <div className="grid grid-cols-2 p-1 bg-black/40 border border-white/10 rounded-2xl gap-1">
          <Link
            href={`/auth/login?role=${role}${redirectUrl ? `&redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
          <button
            type="button"
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold bg-[#d9072a] text-white shadow-md shadow-[#d9072a]/20 transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register New</span>
          </button>
        </div>

        {/* Role Selector Cards */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-slate-300">Choose your registration role:</label>
            <span className="text-[11px] text-[#ff4d6d] font-mono uppercase tracking-wider">
              {role === 'customer' ? 'Comedy Fan' : role === 'organizer' ? 'Club Organizer' : 'Admin'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Customer Role */}
            <button
              type="button"
              onClick={() => { setRole('customer'); setErrorMsg(null); }}
              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                role === 'customer'
                  ? 'bg-sky-500/15 border-sky-500 text-white shadow-sm ring-1 ring-sky-500/40'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${role === 'customer' ? 'bg-sky-500/20 text-sky-400' : 'bg-white/5 text-slate-400'}`}>
                <User className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold leading-tight">Fan / User</span>
              <span className="text-[10px] text-slate-400">Reserve Seats</span>
            </button>

            {/* Organizer Role */}
            <button
              type="button"
              onClick={() => { setRole('organizer'); setErrorMsg(null); }}
              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                role === 'organizer'
                  ? 'bg-[#d9072a]/20 border-[#d9072a] text-white shadow-sm ring-1 ring-[#d9072a]/40'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${role === 'organizer' ? 'bg-[#d9072a]/30 text-[#ff4d6d]' : 'bg-white/5 text-slate-400'}`}>
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold leading-tight">Organizer</span>
              <span className="text-[10px] text-slate-400">Sell & Payouts</span>
            </button>

            {/* Super Admin Role */}
            <button
              type="button"
              onClick={() => { setRole('super_admin'); setErrorMsg(null); }}
              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                role === 'super_admin'
                  ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm ring-1 ring-amber-500/40'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${role === 'super_admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-slate-400'}`}>
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold leading-tight">Admin</span>
              <span className="text-[10px] text-slate-400">Full System</span>
            </button>
          </div>
        </div>

        {/* Selected Role Perks Badge */}
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs flex items-center gap-3">
          <BadgeCheck className="w-4 h-4 text-[#ff4d6d] shrink-0" />
          <div className="space-y-0.5 text-slate-300 text-[11px]">
            {role === 'customer' && (
              <span><strong>User Benefits:</strong> Interactive table seat selection, 10-minute hold guarantee, instant QR admission tickets.</span>
            )}
            {role === 'organizer' && (
              <span><strong>Organizer Benefits:</strong> Direct Stripe box office payouts, custom comedy tiers, door QR scanner & sales analytics.</span>
            )}
            {role === 'super_admin' && (
              <span><strong>Admin Benefits:</strong> Comprehensive system audit trail, organizer verification, fee management & platform metrics.</span>
            )}
          </div>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-start gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>{successMsg}</div>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Your Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <Input
                type="text"
                placeholder={role === 'organizer' ? 'e.g. Sonny LouddMouth' : 'e.g. Alex Morgan'}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-[#d9072a]"
                required
              />
            </div>
          </div>

          {/* Conditional Business Name for Organizers */}
          {role === 'organizer' && (
            <div className="space-y-1 animate-fadeIn">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Comedy Club or Production Company Name</span>
                <span className="text-[10px] text-[#ff4d6d]">Optional</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <Input
                  type="text"
                  placeholder="e.g. Laugh Factory Chicago or Brooklyn Comedy Lab"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-[#d9072a]"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-[#d9072a]"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Create Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <Input
                type="password"
                placeholder="•••••••• (At least 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-[#d9072a]"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d9072a] hover:bg-[#ca0c2a] text-white font-bold h-11 shadow-lg shadow-[#d9072a]/20 text-xs"
          >
            {loading ? 'Creating Account...' : (
              role === 'organizer' 
                ? 'Register as Event Organizer & Get Started' 
                : role === 'super_admin' 
                ? 'Register as Administrator' 
                : 'Register as Comedy Fan'
            )}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        {/* Link to Login */}
        <div className="text-center text-xs text-slate-400 pt-3 border-t border-white/10">
          Already registered?{' '}
          <Link
            href={`/auth/login?role=${role}${redirectUrl ? `&redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
            className="text-[#ff4d6d] font-bold hover:underline"
          >
            Sign in as {role === 'organizer' ? 'Organizer' : role === 'super_admin' ? 'Admin' : 'User'} →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-400">Loading registration...</div>}>
      <RegisterFormContent />
    </Suspense>
  );
}
