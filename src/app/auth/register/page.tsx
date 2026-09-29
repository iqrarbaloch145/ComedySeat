'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ComedySeatLogo } from '@/components/ComedySeatLogo';
import { Lock, Mail, User, Building2, ArrowRight, AlertCircle, CheckCircle2, Ticket } from 'lucide-react';

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
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

    const res = await register(fullName, email, password, role);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        const dest = redirectUrl || (role === 'organizer' ? '/dashboard/organizer' : '/dashboard/customer');
        router.push(dest);
      }, 700);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[#1c1a22] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <ComedySeatLogo size="lg" subtitle="Pull Up A Seat To Comedy" />
          <h1 className="text-2xl font-black text-white tracking-tight pt-2">
            Create Your Account
          </h1>
          <p className="text-xs text-slate-400">
            Join ComedySeat to reserve comedy seats or promote live shows.
          </p>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>{successMsg}</div>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">I am joining as a:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  role === 'customer'
                    ? 'bg-[#d9072a]/20 border-[#d9072a] text-white'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <Ticket className="w-4 h-4 mb-1 text-[#ff4d6d]" />
                <div className="text-xs font-bold text-white">Comedy Fan</div>
                <div className="text-[10px] text-slate-400 leading-tight">Buy tickets & reserve seats</div>
              </button>

              <button
                type="button"
                onClick={() => setRole('organizer')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  role === 'organizer'
                    ? 'bg-[#d9072a]/20 border-[#d9072a] text-white'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <Building2 className="w-4 h-4 mb-1 text-[#ff4d6d]" />
                <div className="text-xs font-bold text-white">Organizer / Club</div>
                <div className="text-[10px] text-slate-400 leading-tight">Sell tickets & get direct payouts</div>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <Input
                type="text"
                placeholder="e.g. Alex Morgan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-[#d9072a]"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Create Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <Input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-[#d9072a]"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d9072a] hover:bg-[#ca0c2a] text-white font-bold h-11 shadow-lg shadow-[#d9072a]/20"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        {/* Link to Login */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/10">
          Already have an account?{' '}
          <Link
            href={`/auth/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
            className="text-[#ff4d6d] font-bold hover:underline"
          >
            Sign In Here
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
