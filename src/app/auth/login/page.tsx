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
  ArrowRight, 
  Sparkles, 
  User, 
  Building2, 
  Shield, 
  AlertCircle, 
  CheckCircle2, 
  LogIn, 
  UserPlus,
  Check
} from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRoleParam = searchParams.get('role') as UserRole | null;
  const redirectUrl = searchParams.get('redirect') || '/dashboard/customer';

  const { login, switchUser, demoUsers } = useAuth();
  
  // Selected role tab for login context
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    initialRoleParam === 'organizer' ? 'organizer' : 
    initialRoleParam === 'super_admin' ? 'super_admin' : 'customer'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter demo accounts by the currently selected role
  const roleAccounts = demoUsers.filter(u => u.role === selectedRole);

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
        const dest = res.user?.role === 'organizer' 
          ? '/dashboard/organizer' 
          : res.user?.role === 'super_admin' 
          ? '/dashboard/admin' 
          : redirectUrl;
        router.push(dest);
      }, 500);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleQuickLogin = (userId: string, targetRole: UserRole) => {
    switchUser(userId);
    const dest = targetRole === 'organizer' 
      ? '/dashboard/organizer' 
      : targetRole === 'super_admin' 
      ? '/dashboard/admin' 
      : redirectUrl;
    router.push(dest);
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg(null);
    // Find the first account for this role to pre-fill email as a helpful convenience
    const matching = demoUsers.find(u => u.role === role);
    if (matching) {
      setEmail(matching.email);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-[#1c1a22] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <ComedySeatLogo size="lg" subtitle="Pull Up A Seat To Comedy" />
          <h1 className="text-2xl font-black text-white tracking-tight pt-2">
            Welcome Back to ComedySeat
          </h1>
          <p className="text-xs text-slate-400">
            Sign in to manage your tickets, access your box office, or explore live comedy.
          </p>
        </div>

        {/* Top Toggle: Sign In vs Register */}
        <div className="grid grid-cols-2 p-1 bg-black/40 border border-white/10 rounded-2xl gap-1">
          <button
            type="button"
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold bg-[#d9072a] text-white shadow-md shadow-[#d9072a]/20 transition"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <Link
            href={`/auth/register?role=${selectedRole}${redirectUrl ? `&redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register New</span>
          </Link>
        </div>

        {/* Role Selection Tabs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Choose your account type:</span>
            <span className="text-[11px] text-[#ff4d6d] font-mono uppercase tracking-wider">
              {selectedRole === 'customer' ? 'Comedy Fan' : selectedRole === 'organizer' ? 'Club Organizer' : 'Admin'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleRoleSelect('customer')}
              className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                selectedRole === 'customer'
                  ? 'bg-sky-500/15 border-sky-500 text-white shadow-sm'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
              }`}
            >
              <User className={`w-4 h-4 ${selectedRole === 'customer' ? 'text-sky-400' : 'text-slate-400'}`} />
              <span className="text-xs font-bold leading-tight">User / Fan</span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">Ticket Buyer</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('organizer')}
              className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                selectedRole === 'organizer'
                  ? 'bg-[#d9072a]/20 border-[#d9072a] text-white shadow-sm'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
              }`}
            >
              <Building2 className={`w-4 h-4 ${selectedRole === 'organizer' ? 'text-[#ff4d6d]' : 'text-slate-400'}`} />
              <span className="text-xs font-bold leading-tight">Organizer</span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">Club & Producer</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('super_admin')}
              className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                selectedRole === 'super_admin'
                  ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
              }`}
            >
              <Shield className={`w-4 h-4 ${selectedRole === 'super_admin' ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className="text-xs font-bold leading-tight">Admin</span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">Super Admin</span>
            </button>
          </div>
        </div>

        {/* Selected Role Quick Access Banner */}
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#ff4d6d]" />
              {selectedRole === 'customer' && 'Signing in as Comedy Fan / User'}
              {selectedRole === 'organizer' && 'Signing in as Comedy Club / Organizer'}
              {selectedRole === 'super_admin' && 'Signing in as ComedySeat Administrator'}
            </div>
            <p className="text-[11px] text-slate-400">
              {selectedRole === 'customer' && 'Access reserved front-row tables, tickets & QR passes.'}
              {selectedRole === 'organizer' && 'Direct Stripe ticket payouts, box office & door scanner.'}
              {selectedRole === 'super_admin' && 'Venue approvals, platform analytics, fee configs & audit logs.'}
            </p>
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

        {/* Standard Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <Input
                type="email"
                placeholder={
                  selectedRole === 'organizer' ? 'louddmouth@comedyseat.com' :
                  selectedRole === 'super_admin' ? 'admin@comedyseat.com' : 'alex@comedyseat.com'
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-[#d9072a]"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
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
                placeholder="•••••••• (Any password for test accounts)"
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
            {loading ? 'Authenticating...' : `Sign In as ${selectedRole === 'organizer' ? 'Organizer' : selectedRole === 'super_admin' ? 'Admin' : 'User'}`}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        {/* 1-Click Instant Demo Login Section for this role */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#d9072a]" />
              1-Click Demo Logins ({roleAccounts.length} available)
            </span>
            <span className="text-[10px] text-slate-500">Instant Access</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {roleAccounts.map((u) => {
              const icon = u.role === 'super_admin' ? (
                <Shield className="w-4 h-4 text-amber-400 shrink-0" />
              ) : u.role === 'organizer' ? (
                <Building2 className="w-4 h-4 text-[#ff4d6d] shrink-0" />
              ) : (
                <User className="w-4 h-4 text-sky-400 shrink-0" />
              );

              return (
                <button
                  key={u.id}
                  onClick={() => handleQuickLogin(u.id, u.role)}
                  type="button"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#d9072a]/40 flex items-center justify-between text-xs transition group"
                >
                  <div className="flex items-center gap-2.5 text-left truncate">
                    {icon}
                    <div className="truncate">
                      <div className="font-bold text-white group-hover:text-[#ff4d6d] transition truncate">
                        {u.full_name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{u.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    <span className="text-[10px] bg-white/10 group-hover:bg-[#d9072a] group-hover:text-white px-2 py-0.5 rounded-md font-semibold transition text-slate-300">
                      Login Now →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Link to Register */}
        <div className="text-center text-xs text-slate-400 pt-3 border-t border-white/10">
          Need a brand new account?{' '}
          <Link
            href={`/auth/register?role=${selectedRole}${redirectUrl ? `&redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
            className="text-[#ff4d6d] font-bold hover:underline"
          >
            Register as {selectedRole === 'organizer' ? 'Event Organizer' : selectedRole === 'super_admin' ? 'Administrator' : 'Comedy Fan'} →
          </Link>
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
