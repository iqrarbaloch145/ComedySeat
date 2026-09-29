'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ComedySeatLogo } from '@/components/ComedySeatLogo';
import { Lock, Mail, ArrowRight, Sparkles, User, Building2, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard/customer';

  const { login, switchUser, demoUsers } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        router.push(redirectUrl);
      }, 500);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleQuickLogin = (userId: string) => {
    switchUser(userId);
    router.push(redirectUrl);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[#1c1a22] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <ComedySeatLogo size="lg" subtitle="Pull Up A Seat To Comedy" />
          <h1 className="text-2xl font-black text-white tracking-tight pt-2">
            Sign In to ComedySeat
          </h1>
          <p className="text-xs text-slate-400">
            Access your reserved tickets, box office, or organizer dashboard.
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

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <span className="text-[11px] text-[#ff4d6d] hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <Input
                type="password"
                placeholder="••••••••"
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
            {loading ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        {/* Link to Register */}
        <div className="text-center text-xs text-slate-400">
          Don&apos;t have an account yet?{' '}
          <Link
            href={`/auth/register?redirect=${encodeURIComponent(redirectUrl)}`}
            className="text-[#ff4d6d] font-bold hover:underline"
          >
            Create an Account
          </Link>
        </div>

        {/* Instant Reviewer Login Divider */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#d9072a]" />
            One-Click Demo Sign-In
          </div>
          <div className="grid grid-cols-1 gap-2">
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
                  onClick={() => handleQuickLogin(u.id)}
                  type="button"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {icon}
                    <div className="text-left">
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
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-400">Loading sign in...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
