'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/data-store';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Organizer } from '@/types/database';
import { 
  Shield, 
  Users, 
  Building2, 
  Calendar as CalendarIcon, 
  Ticket, 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Settings, 
  PlusCircle, 
  RefreshCcw,
  Sparkles,
  BarChart3,
  DollarSign,
  Lock,
  Layers,
  Home,
  Globe,
  Moon,
  Sun,
  Bell,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  ShoppingCart,
  Clock,
  ExternalLink,
  Download,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AuthGate } from '@/components/AuthGate';
import { ComedySeatLogo } from '@/components/ComedySeatLogo';
import { DashboardProfileMenu } from '@/components/DashboardProfileMenu';

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'organizers' | 'events' | 'orders' | 'refunds' | 'logs' | 'settings'>('overview');
  
  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [organizerFilter, setOrganizerFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Refund processing state
  const [refundOrderId, setRefundOrderId] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState<string>('Customer cancellation request');
  const [refundStatusMsg, setRefundStatusMsg] = useState<string | null>(null);

  // Platform-wide records
  const allOrganizers = db.getOrganizers();
  const allEvents = db.getEvents();
  const allOrders = db.getOrders();
  const allLogs = db.getAuditLogs();

  // Platform Gross Sales
  const platformTotalSales = allOrders.reduce((sum, o) => sum + (o.payment_status === 'paid' ? o.total_amount : 0), 0);
  const totalTicketsIssued = allOrders.reduce((sum, o) => sum + (o.tickets?.length || 0), 0);

  // Admin's OWN event earnings (strictly separated as required!)
  const adminOrganizer = allOrganizers.find((o: Organizer) => o.user_id === user?.id);
  const adminOwnOrders = allOrders.filter(o => o.organizer_id === adminOrganizer?.id);
  const adminOwnEarnings = adminOwnOrders.reduce((sum, o) => sum + (o.payment_status === 'paid' ? o.total_amount : 0), 0);

  // Independent third-party organizers gross
  const thirdPartyOrganizersSales = platformTotalSales - adminOwnEarnings;

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return allOrders.filter((ord) => {
      if (organizerFilter !== 'all' && ord.organizer_id !== organizerFilter) return false;
      if (statusFilter !== 'all' && ord.payment_status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNum = ord.order_number.toLowerCase().includes(q);
        const matchCust = (ord.customer_name || '').toLowerCase().includes(q) || (ord.customer_email || '').toLowerCase().includes(q);
        const matchEvent = (ord.event?.title || '').toLowerCase().includes(q);
        if (!matchNum && !matchCust && !matchEvent) return false;
      }
      return true;
    });
  }, [allOrders, organizerFilter, statusFilter, searchQuery]);

  if (!user) {
    return (
      <AuthGate
        title="Super Admin Authentication Required"
        message="Without logging in or registering, platform administration, organizer payouts, and financial moderation cannot be viewed or edited."
        returnUrl="/dashboard/admin"
      />
    );
  }

  if (user.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-[#0c0b16] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-[28px] bg-[#16142a] border border-[#262343] p-8 text-center space-y-4 shadow-2xl">
          <Shield className="w-14 h-14 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Super Admin Access Required</h2>
          <p className="text-xs text-slate-400">
            This management console is restricted to platform administrators.
            You are currently signed in as &quot;{user.full_name}&quot; ({user.role}).
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link href="/">
              <Button variant="outline" className="rounded-xl border-[#2f2b52] text-xs">
                Back to Home
              </Button>
            </Link>
            <Link href="/dashboard/customer">
              <Button className="bg-[#d9072a] text-white rounded-xl text-xs">
                Go to Customer Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Toggle organizer status (Approve / Suspend / Reactivate)
  const handleToggleOrganizerStatus = (orgId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    db.updateOrganizerStatus(orgId, nextStatus);
  };

  // Process refund and ticket invalidation
  const handleProcessRefund = (orderId: string, amount: number) => {
    try {
      const res = db.processRefund(orderId, amount, refundReason, user.id);
      setRefundStatusMsg(`Refund processed successfully: Order refunded and ${res.invalidatedTicketsCount} admission ticket(s) invalidated.`);
      setRefundOrderId(null);
      setTimeout(() => setRefundStatusMsg(null), 6000);
    } catch (err: any) {
      setRefundStatusMsg(`Refund failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0b16] text-slate-100 flex font-sans antialiased selection:bg-[#d9072a]/30 selection:text-white">
      {/* ===================== LEFT SIDEBAR ===================== */}
      <aside 
        className={`${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } transition-all duration-300 ease-in-out shrink-0 bg-[#121124] border-r border-[#1f1d38] flex flex-col justify-between relative z-30 min-h-screen`}
      >
        {/* Sidebar Collapse Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-[#1c1a36] border border-[#2e2b54] text-slate-400 hover:text-white flex items-center justify-center text-xs shadow-md transition hover:scale-105 z-40"
          title="Toggle Sidebar"
        >
          {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Top Header Logo */}
        <div>
          <div className="h-20 px-5 flex items-center gap-3 border-b border-[#1b1933]">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-black border border-[#d9072a]/50 flex items-center justify-center p-1.5 shadow-lg shadow-[#d9072a]/25 shrink-0 group-hover:scale-105 transition-transform">
                <img
                  src="/images/comedyseat-icon.png"
                  alt="ComedySeat"
                  className="w-full h-full object-contain"
                />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <div className="flex items-baseline">
                    <span className="font-black text-xl tracking-tight text-[#d9072a]">Comedy</span>
                    <span className="font-black text-xl tracking-tight text-white">Seat</span>
                    <span className="text-[#d9072a] font-bold text-xs">.</span>
                    <span className="text-[8px] font-bold text-[#d9072a] border border-[#d9072a]/40 rounded-full px-0.5 ml-1">TM</span>
                  </div>
                  <span className="block text-[9px] text-amber-400 font-semibold tracking-wider uppercase -mt-0.5">Admin Console</span>
                </div>
              )}
            </Link>
          </div>

          {/* Return to Website button in sidebar */}
          <div className="px-4 pt-4">
            <Link
              href="/"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold bg-[#d9072a]/15 text-[#ff4d6d] hover:bg-[#d9072a]/25 border border-[#d9072a]/30 transition group ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
              title="Return to Website Home Page"
            >
              <Home className="w-4 h-4 text-[#d9072a] group-hover:scale-110 transition-transform shrink-0" />
              {!sidebarCollapsed && <span>Return to Website</span>}
            </Link>
          </div>

          {/* Primary Navigation */}
          <div className="px-4 py-4 space-y-6">
            <div>
              {!sidebarCollapsed && (
                <div className="px-3 mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Primary
                </div>
              )}
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    activeTab === 'overview'
                      ? 'bg-gradient-to-r from-[#d9072a] to-[#99051d] text-white shadow-lg shadow-[#d9072a]/35'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Overview</span>}
                </button>

                <button
                  onClick={() => setActiveTab('organizers')}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    activeTab === 'organizers'
                      ? 'bg-gradient-to-r from-[#d9072a] to-[#99051d] text-white shadow-lg shadow-[#d9072a]/35'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Building2 className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && (
                    <div className="flex items-center justify-between w-full">
                      <span>Comedy Clubs</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                        {allOrganizers.length}
                      </span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('events')}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    activeTab === 'events'
                      ? 'bg-gradient-to-r from-[#d9072a] to-[#99051d] text-white shadow-lg shadow-[#d9072a]/35'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <CalendarIcon className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && (
                    <div className="flex items-center justify-between w-full">
                      <span>Live Shows</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                        {allEvents.length}
                      </span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    activeTab === 'orders'
                      ? 'bg-gradient-to-r from-[#d9072a] to-[#99051d] text-white shadow-lg shadow-[#d9072a]/35'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && (
                    <div className="flex items-center justify-between w-full">
                      <span>All Orders</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                        {allOrders.length}
                      </span>
                    </div>
                  )}
                </button>
              </nav>
            </div>

            {/* Secondary Navigation */}
            <div>
              {!sidebarCollapsed && (
                <div className="px-3 mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Secondary
                </div>
              )}
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('refunds')}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    activeTab === 'refunds'
                      ? 'bg-gradient-to-r from-[#d9072a] to-[#99051d] text-white shadow-lg shadow-[#d9072a]/35'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <RefreshCcw className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Refund Console</span>}
                </button>

                <button
                  onClick={() => setActiveTab('logs')}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    activeTab === 'logs'
                      ? 'bg-gradient-to-r from-[#d9072a] to-[#99051d] text-white shadow-lg shadow-[#d9072a]/35'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Shield className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Audit Trail</span>}
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom Sidebar Footer */}
        <div className="px-4 py-6 border-t border-[#1b1933] space-y-1">
          <Link
            href="/dashboard/organizer"
            className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-purple-400 hover:text-white hover:bg-white/5 transition"
          >
            <Building2 className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Organizer View</span>}
          </Link>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3.5 px-3.5 py-2 rounded-2xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            <Users className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ===================== MAIN CONTENT WRAPPER ===================== */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-20 px-8 border-b border-[#1b1933] bg-[#0f0e1c]/80 backdrop-blur-md flex items-center justify-between gap-4 sticky top-0 z-20">
          {/* Search bar */}
          <div className="relative w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search clubs, shows, orders, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#17152b] border border-[#2b2848] text-sm text-slate-200 placeholder:text-slate-500 rounded-full pl-11 pr-4 py-2.5 focus:outline-none focus:border-[#d9072a] transition shadow-inner"
            />
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-4">
            {/* Quick return to website button */}
            <Link
              href="/"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#17152b] border border-[#2b2848] text-slate-300 hover:text-white hover:border-[#d9072a] transition"
              title="Return to Website Home Page"
            >
              <Globe className="w-3.5 h-3.5 text-[#d9072a]" />
              <span>Return to Website</span>
            </Link>

            {/* Dark/Light mode switch */}
            <div className="bg-[#17152b] border border-[#2b2848] p-1 rounded-full flex items-center gap-1">
              <button
                onClick={() => setThemeMode('dark')}
                className={`p-1.5 rounded-full transition ${themeMode === 'dark' ? 'bg-[#2b274c] text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setThemeMode('light')}
                className={`p-1.5 rounded-full transition ${themeMode === 'light' ? 'bg-[#2b274c] text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Notification bell button */}
            <button className="w-10 h-10 rounded-full bg-[#17152b] border border-[#2b2848] flex items-center justify-center text-slate-300 hover:text-white hover:border-[#d9072a] transition relative">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-2.5 right-2.5" />
            </button>

            {/* User Profile – real logged-in admin data, clickable with Settings + Logout */}
            <DashboardProfileMenu accentColor="amber" />
          </div>
        </header>

        {refundStatusMsg && (
          <div className="m-8 mb-0 p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{refundStatusMsg}</span>
          </div>
        )}

        {/* ===================== TAB 1: OVERVIEW ===================== */}
        {activeTab === 'overview' && (
          <div className="p-8 space-y-6 max-w-[1400px]">
            {/* ROW 1: Greeting + Security Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Greeting Card (2 cols) */}
              <div className="lg:col-span-2 rounded-[28px] bg-[#16142a] border border-[#262343] p-7 flex flex-col justify-between relative overflow-hidden shadow-xl">
                <div className="absolute -top-24 -left-24 w-60 h-60 bg-[#d9072a]/15 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
                  <span className="text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    Marketplace Command Center
                  </span>
                  <div className="text-xs text-slate-400">
                    Direct Stripe Connect routing active across all clubs.
                  </div>
                </div>

                <div className="space-y-1 mb-7 relative z-10">
                  <div className="text-xs text-slate-400 font-medium">
                    Monitoring {allOrganizers.length} comedy clubs, {allEvents.length} live shows, and {allOrders.length} ticket transactions.
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Super Admin Console • ComedySeat
                  </h1>
                </div>

                {/* 3 Pill Badges */}
                <div className="flex flex-wrap items-center gap-3 relative z-10">
                  <div className="px-4 py-2 rounded-full bg-[#1e1b36] border border-[#2b274d] text-xs text-slate-300 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Direct Payouts 100%</span>
                  </div>
                  <div className="px-4 py-2 rounded-full bg-[#1e1b36] border border-[#2b274d] text-xs text-slate-300 font-medium flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-[#d9072a]" />
                    <span>Zero Escrow Pooling</span>
                  </div>
                  <div className="px-4 py-2 rounded-full bg-[#1e1b36] border border-[#2b274d] text-xs text-slate-300 font-medium flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                    <span>PCI-DSS Compliant</span>
                  </div>
                </div>
              </div>

              {/* Right Activity Card (1 col) */}
              <div className="rounded-[28px] bg-[#16142a] border border-[#262343] p-6 flex flex-col justify-between shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-bold text-white">Platform Throughput</h2>
                  <span className="text-[10px] text-slate-500 font-medium uppercase">Live Volume</span>
                </div>

                {/* Glowing dual-curve chart */}
                <div className="relative w-full h-36 my-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 320 120">
                    <defs>
                      <linearGradient id="adminGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#d9072a" />
                        <stop offset="50%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                    <line x1="20" y1="20" x2="310" y2="20" stroke="#23203c" strokeDasharray="3 3" />
                    <line x1="20" y1="60" x2="310" y2="60" stroke="#23203c" strokeDasharray="3 3" />
                    <line x1="20" y1="100" x2="310" y2="100" stroke="#23203c" strokeDasharray="3 3" />

                    <path
                      d="M 25 80 Q 70 85 110 70 T 180 85 T 240 70 T 305 75"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                    <path
                      d="M 25 60 Q 70 80 110 50 Q 150 15 180 18 Q 220 70 250 50 Q 280 40 305 60"
                      fill="none"
                      stroke="url(#adminGlow)"
                      strokeWidth="3.5"
                    />
                    <circle cx="180" cy="18" r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2.5" />
                  </svg>
                </div>

                <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400 items-center">
                  <span>Mon</span>
                  <span>Tue</span>
                  <div className="bg-[#d9072a]/30 border border-[#d9072a]/50 text-white font-extrabold rounded-lg py-1">
                    Wed
                  </div>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>

            {/* ROW 2: 4 METRIC KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Platform Gross Volume */}
              <div className="rounded-[24px] bg-[#16142a] border border-[#262343] p-5 flex flex-col justify-between hover:border-[#d9072a]/40 transition shadow-lg relative overflow-hidden">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400">Total Platform GMV</span>
                    <div className="w-8 h-8 rounded-full bg-[#1d1a36] border border-[#2f2b52] flex items-center justify-center text-[#ff4d6d]">
                      <CreditCard className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <div className="text-2xl font-extrabold text-white tracking-tight">
                      {formatCurrency(platformTotalSales, 'usd')}
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#d9072a]/15 text-[#ff4d6d] border border-[#d9072a]/25">
                      +18.4%
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">Direct-to-merchant volume</div>
                </div>

                <div className="mt-4 pt-2">
                  <svg className="w-full h-10 overflow-visible" viewBox="0 0 160 40">
                    <defs>
                      <linearGradient id="g1" x1="0%" y1="0%" x2="0%" y2="1">
                        <stop offset="0%" stopColor="#d9072a" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#d9072a" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0 30 Q 30 10 60 25 T 110 15 T 160 22 L 160 40 L 0 40 Z" fill="url(#g1)" />
                    <path d="M 0 30 Q 30 10 60 25 T 110 15 T 160 22" fill="none" stroke="#d9072a" strokeWidth="2.5" />
                  </svg>
                </div>
              </div>

              {/* Card 2: Active Clubs */}
              <div className="rounded-[24px] bg-[#16142a] border border-[#262343] p-5 flex flex-col justify-between hover:border-purple-500/40 transition shadow-lg relative overflow-hidden">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400">Comedy Clubs & Venues</span>
                    <div className="w-8 h-8 rounded-full bg-[#1d1a36] border border-[#2f2b52] flex items-center justify-center text-purple-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <div className="text-2xl font-extrabold text-white tracking-tight">
                      {allOrganizers.length}
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/25">
                      Verified
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">Stripe Connected Merchants</div>
                </div>

                <div className="mt-4 pt-2">
                  <svg className="w-full h-10 overflow-visible" viewBox="0 0 160 40">
                    <defs>
                      <linearGradient id="g2" x1="0%" y1="0%" x2="0%" y2="1">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0 25 Q 40 35 80 15 T 130 28 T 160 18 L 160 40 L 0 40 Z" fill="url(#g2)" />
                    <path d="M 0 25 Q 40 35 80 15 T 130 28 T 160 18" fill="none" stroke="#a855f7" strokeWidth="2.5" />
                  </svg>
                </div>
              </div>

              {/* Card 3: Tickets Sold */}
              <div className="rounded-[24px] bg-[#16142a] border border-[#262343] p-5 flex flex-col justify-between hover:border-[#10b981]/40 transition shadow-lg relative overflow-hidden">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400">Total Passes Issued</span>
                    <div className="w-8 h-8 rounded-full bg-[#1d1a36] border border-[#2f2b52] flex items-center justify-center text-emerald-400">
                      <Ticket className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <div className="text-2xl font-extrabold text-white tracking-tight">
                      {totalTicketsIssued}
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                      QR Encrypted
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">Across {allOrders.length} orders</div>
                </div>

                <div className="mt-4 pt-2">
                  <svg className="w-full h-10 overflow-visible" viewBox="0 0 160 40">
                    <defs>
                      <linearGradient id="g3" x1="0%" y1="0%" x2="0%" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0 28 Q 35 15 75 30 T 120 18 T 160 24 L 160 40 L 0 40 Z" fill="url(#g3)" />
                    <path d="M 0 28 Q 35 15 75 30 T 120 18 T 160 24" fill="none" stroke="#10b981" strokeWidth="2.5" />
                  </svg>
                </div>
              </div>

              {/* Card 4: Third-Party Club Volume */}
              <div className="rounded-[24px] bg-[#16142a] border border-[#262343] p-5 flex flex-col justify-between hover:border-sky-500/40 transition shadow-lg relative overflow-hidden">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400">Independent Club Sales</span>
                    <div className="w-8 h-8 rounded-full bg-[#1d1a36] border border-[#2f2b52] flex items-center justify-center text-sky-400">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <div className="text-2xl font-extrabold text-white tracking-tight">
                      {formatCurrency(thirdPartyOrganizersSales, 'usd')}
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/25">
                      Direct Payout
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">Zero intermediary custody</div>
                </div>

                <div className="mt-4 pt-2">
                  <svg className="w-full h-10 overflow-visible" viewBox="0 0 160 40">
                    <defs>
                      <linearGradient id="g4" x1="0%" y1="0%" x2="0%" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0 32 Q 45 12 85 24 T 135 15 T 160 26 L 160 40 L 0 40 Z" fill="url(#g4)" />
                    <path d="M 0 32 Q 45 12 85 24 T 135 15 T 160 26" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* ROW 3: REVENUE STREAMGRAPH + TOP PERFORMING VENUES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Large Card: Sales Analytics Streamgraph (2 cols) */}
              <div className="lg:col-span-2 rounded-[28px] bg-[#16142a] border border-[#262343] p-7 flex flex-col justify-between shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">Platform Sales Analytics</h2>
                    <p className="text-xs text-slate-400">Gross comedy ticket volume across connected merchant gateways</p>
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-[#201d39] border border-[#2f2b52] text-xs font-semibold text-slate-300">
                    Last 30 Days ▾
                  </div>
                </div>

                {/* 3D Stacked Ribbon River Flow */}
                <div className="w-full h-64 relative flex items-center justify-center py-4">
                  <svg className="w-full h-full" viewBox="0 0 600 240" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="admPurple" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#d9072a" stopOpacity="0.85" />
                        <stop offset="50%" stopColor="#ff4d6d" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.9" />
                      </linearGradient>
                      <linearGradient id="admGreen" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
                        <stop offset="50%" stopColor="#059669" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
                      </linearGradient>
                      <linearGradient id="admOrange" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ea580c" stopOpacity="0.85" />
                        <stop offset="50%" stopColor="#c2410c" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0.9" />
                      </linearGradient>
                    </defs>

                    {/* Ribbons */}
                    <path d="M 90 90 C 180 90, 210 135, 290 135 L 290 152 C 210 152, 180 110, 90 110 Z" fill="url(#admPurple)" opacity="0.8" />
                    <path d="M 90 116 C 180 116, 210 157, 290 157 L 290 173 C 210 173, 180 134, 90 134 Z" fill="url(#admGreen)" opacity="0.8" />
                    <path d="M 90 140 C 180 140, 210 178, 290 178 L 290 200 C 210 200, 180 162, 90 162 Z" fill="url(#admOrange)" opacity="0.85" />

                    <path d="M 310 135 C 390 135, 420 50, 510 50 L 510 72 C 420 72, 390 152, 310 152 Z" fill="url(#admPurple)" opacity="0.85" />
                    <path d="M 310 157 C 390 157, 420 78, 510 78 L 510 115 C 420 115, 390 173, 310 173 Z" fill="url(#admGreen)" opacity="0.85" />
                    <path d="M 310 178 C 390 178, 420 120, 510 120 L 510 170 C 420 170, 390 200, 310 200 Z" fill="url(#admOrange)" opacity="0.85" />

                    {/* Columns */}
                    <rect x="25" y="85" width="65" height="20" rx="8" fill="#d9072a" />
                    <rect x="25" y="111" width="65" height="20" rx="8" fill="#10b981" />
                    <rect x="25" y="137" width="65" height="24" rx="8" fill="#ea580c" />

                    <rect x="260" y="132" width="65" height="18" rx="8" fill="#d9072a" />
                    <rect x="260" y="154" width="65" height="18" rx="8" fill="#10b981" />
                    <rect x="260" y="176" width="65" height="18" rx="8" fill="#ea580c" />

                    <rect x="500" y="45" width="65" height="24" rx="8" fill="#d9072a" />
                    <rect x="500" y="74" width="65" height="35" rx="8" fill="#10b981" />
                    <rect x="500" y="114" width="65" height="50" rx="8" fill="#ea580c" />

                    <text x="57" y="70" fill="#94a3b8" fontSize="13" fontWeight="bold" textAnchor="middle">$3.6k</text>
                    <text x="292" y="118" fill="#94a3b8" fontSize="13" fontWeight="bold" textAnchor="middle">$3.4k</text>
                    <text x="532" y="32" fill="#94a3b8" fontSize="13" fontWeight="bold" textAnchor="middle">$4.2k</text>

                    <text x="57" y="215" fill="#64748b" fontSize="12" fontWeight="600" textAnchor="middle">Dec 18</text>
                    <text x="292" y="215" fill="#64748b" fontSize="12" fontWeight="600" textAnchor="middle">Dec 19</text>
                    <text x="532" y="215" fill="#64748b" fontSize="12" fontWeight="600" textAnchor="middle">Dec 20</text>
                  </svg>
                </div>
              </div>

              {/* Right Card: Top Comedy Clubs (1 col) */}
              <div className="rounded-[28px] bg-[#16142a] border border-[#262343] p-7 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-white tracking-tight">Active Comedy Clubs</h2>
                    <button
                      onClick={() => setActiveTab('organizers')}
                      className="text-xs text-[#ff4d6d] hover:underline font-semibold"
                    >
                      Manage
                    </button>
                  </div>

                  <div className="space-y-4">
                    {allOrganizers.map((org, idx) => (
                      <div
                        key={org.id}
                        className="p-3.5 rounded-2xl bg-[#1d1a36]/70 border border-[#2c284e] flex items-center justify-between gap-3 hover:border-[#d9072a]/40 transition group cursor-pointer"
                        onClick={() => setActiveTab('organizers')}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-black border border-[#d9072a]/40 text-[#ff4d6d] font-extrabold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </div>
                          <div className="truncate">
                            <div className="font-bold text-sm text-white truncate group-hover:text-[#ff4d6d] transition">
                              {org.business_name}
                            </div>
                            <div className="text-[11px] font-mono text-emerald-400">
                              {org.stripe_account_id}
                            </div>
                          </div>
                        </div>

                        <Badge variant={org.status === 'active' ? 'success' : 'destructive'} className="text-[10px]">
                          {org.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#23203c] mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Payment Gateway Routing:</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">DIRECT MERCHANTS</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: ORGANIZERS ===================== */}
        {activeTab === 'organizers' && (
          <div className="p-8 space-y-6 max-w-[1400px]">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Comedy Club Organizers</h1>
                <p className="text-xs text-slate-400">Moderation and connected Stripe merchant gateway status.</p>
              </div>
            </div>

            <div className="rounded-[28px] bg-[#16142a] border border-[#262343] overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#121124] text-slate-400 font-semibold border-b border-[#262343]">
                  <tr>
                    <th className="p-4">Business Name</th>
                    <th className="p-4">Owner Profile</th>
                    <th className="p-4">Stripe Account ID</th>
                    <th className="p-4">Gateway Status</th>
                    <th className="p-4">Direct Charges</th>
                    <th className="p-4 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#23203c] text-slate-300">
                  {allOrganizers.map((org) => (
                    <tr key={org.id} className="hover:bg-white/5 transition">
                      <td className="p-4">
                        <div className="font-bold text-white">{org.business_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">/organizers/{org.slug}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-white font-medium">{org.support_email}</div>
                        <div className="text-[10px] text-slate-400">{org.country.toUpperCase()} • {org.currency.toUpperCase()}</div>
                      </td>
                      <td className="p-4 font-mono text-emerald-400 font-semibold">
                        {org.stripe_account_id}
                      </td>
                      <td className="p-4">
                        <Badge variant={org.stripe_account_status === 'active' ? 'success' : 'destructive'} className="text-[10px]">
                          {org.stripe_account_status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${org.charges_enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {org.charges_enabled ? 'Enabled' : 'Blocked'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleOrganizerStatus(org.id, org.status)}
                          className={`rounded-xl text-xs ${org.status === 'active' ? 'text-rose-400 border-rose-500/30' : 'text-emerald-400 border-emerald-500/30'}`}
                        >
                          {org.status === 'active' ? 'Suspend Club' : 'Activate Club'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== TAB 3: LIVE SHOWS ===================== */}
        {activeTab === 'events' && (
          <div className="p-8 space-y-6 max-w-[1400px]">
            <h1 className="text-2xl font-bold text-white tracking-tight">Platform-Wide Comedy Shows</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allEvents.map((evt) => (
                <div key={evt.id} className="rounded-[24px] bg-[#16142a] border border-[#262343] p-6 space-y-3">
                  <Badge variant="glow">{evt.category}</Badge>
                  <h3 className="font-bold text-white text-base leading-snug">{evt.title}</h3>
                  <div className="text-xs text-slate-400">
                    {evt.venue_name} • {evt.venue_city}
                  </div>
                  <div className="pt-2 flex items-center justify-between text-xs border-t border-white/5">
                    <span className="font-mono text-emerald-400 font-semibold">
                      {evt.ticket_types?.length || 1} Tier(s)
                    </span>
                    <Badge variant={evt.status === 'published' ? 'success' : 'secondary'} className="text-[10px]">
                      {evt.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== TAB 4: ALL ORDERS & PASSES ===================== */}
        {activeTab === 'orders' && (
          <div className="p-8 space-y-6 max-w-[1400px]">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">All Confirmed Ticket Orders</h1>
                <p className="text-xs text-slate-400">Inspect direct payment accounts and trigger instant refunds.</p>
              </div>
            </div>

            <div className="rounded-[28px] bg-[#16142a] border border-[#262343] overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#121124] text-slate-400 font-semibold border-b border-[#262343]">
                  <tr>
                    <th className="p-4">Order #</th>
                    <th className="p-4">Show Title</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Merchant Account</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4 text-right">Refund</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#23203c] text-slate-300">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-white/5 transition">
                      <td className="p-4 font-mono font-bold text-white">{ord.order_number}</td>
                      <td className="p-4 max-w-[200px] truncate text-white">{ord.event?.title}</td>
                      <td className="p-4">
                        <div className="text-white font-medium">{ord.customer_name}</div>
                        <div className="text-[10px] text-slate-400">{ord.customer_email}</div>
                      </td>
                      <td className="p-4 font-mono text-emerald-400 font-semibold text-[10px]">
                        {ord.payment_gateway_account_id}
                      </td>
                      <td className="p-4">
                        <Badge variant={ord.payment_status === 'paid' ? 'success' : 'destructive'} className="text-[10px]">
                          {ord.payment_status}
                        </Badge>
                      </td>
                      <td className="p-4 font-bold text-white font-mono">
                        {formatCurrency(ord.total_amount, ord.currency)}
                      </td>
                      <td className="p-4 text-right">
                        {ord.payment_status === 'paid' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setRefundOrderId(ord.id);
                              setActiveTab('refunds');
                            }}
                            className="rounded-xl border-[#d9072a]/30 text-rose-400 hover:bg-rose-950/40 text-xs"
                          >
                            Refund
                          </Button>
                        ) : (
                          <span className="text-[10px] text-slate-500">Refunded</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== TAB 5: REFUND CONSOLE ===================== */}
        {activeTab === 'refunds' && (
          <div className="p-8 space-y-6 max-w-2xl mx-auto">
            <div className="rounded-[28px] bg-[#16142a] border border-[#262343] p-8 shadow-2xl space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-rose-900/30 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
                <RefreshCcw className="w-7 h-7" />
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold text-white">Direct Stripe Refund & Pass Invalidation</h2>
                <p className="text-xs text-slate-400">
                  Processing a refund automatically calls the connected merchant gateway, reverses ticket sale funds, and invalidates all associated QR admission codes.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Select Order to Refund</label>
                  <select
                    value={refundOrderId || ''}
                    onChange={(e) => setRefundOrderId(e.target.value)}
                    className="w-full bg-[#121124] border border-[#2f2b52] text-slate-200 rounded-xl p-2.5 text-xs focus:outline-none"
                  >
                    <option value="">-- Choose confirmed paid order --</option>
                    {allOrders.filter(o => o.payment_status === 'paid').map(o => (
                      <option key={o.id} value={o.id}>
                        {o.order_number} - {o.customer_name} ({formatCurrency(o.total_amount, o.currency)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Refund Reason</label>
                  <Input
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="bg-[#121124] border-[#2f2b52] rounded-xl text-white text-xs"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    disabled={!refundOrderId}
                    onClick={() => {
                      const ord = allOrders.find(o => o.id === refundOrderId);
                      if (ord) handleProcessRefund(ord.id, ord.total_amount);
                    }}
                    className="w-full bg-[#d9072a] hover:bg-[#b90623] text-white rounded-xl shadow-lg shadow-[#d9072a]/30 font-bold text-xs h-11"
                  >
                    Confirm Direct Refund & Invalidate Tickets
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 6: AUDIT TRAIL ===================== */}
        {activeTab === 'logs' && (
          <div className="p-8 space-y-6 max-w-[1400px]">
            <h1 className="text-2xl font-bold text-white tracking-tight">System Security & Audit Trail</h1>
            <div className="rounded-[28px] bg-[#16142a] border border-[#262343] overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#121124] text-slate-400 font-semibold border-b border-[#262343]">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Actor ID</th>
                    <th className="p-4">Target Entity</th>
                    <th className="p-4">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#23203c] text-slate-300">
                  {allLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition">
                      <td className="p-4 text-slate-400">{formatDate(log.created_at)}</td>
                      <td className="p-4 text-[#ff4d6d] font-bold">{log.action}</td>
                      <td className="p-4 text-slate-300">{log.actor_id || 'system'}</td>
                      <td className="p-4 text-purple-300">{log.target_type} ({log.target_id})</td>
                      <td className="p-4 text-emerald-400">{log.ip_address || '127.0.0.1'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
