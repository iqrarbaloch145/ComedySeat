'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/data-store';
import { formatCurrency, formatDate } from '@/lib/utils';
import QRCode from 'qrcode';
import { 
  Ticket, 
  Calendar as CalendarIcon, 
  MapPin, 
  Printer, 
  Sparkles, 
  User, 
  ShieldAlert, 
  Building2, 
  ArrowRight,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  ShoppingCart,
  Heart,
  Award,
  HelpCircle,
  Search,
  Moon,
  Sun,
  Bell,
  Plus,
  Home,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Download,
  AlertTriangle,
  Globe,
  Lock,
  Layers,
  CreditCard,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AuthGate } from '@/components/AuthGate';
import { ComedySeatLogo } from '@/components/ComedySeatLogo';
import { DashboardProfileMenu } from '@/components/DashboardProfileMenu';
import { DashboardSettingsPanel } from '@/components/DashboardSettingsPanel';

export default function CustomerDashboardPage() {
  const { user, upgradeToOrganizer, logout } = useAuth();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'tickets' | 'orders' | 'shows' | 'venues' | 'rewards' | 'support' | 'settings'>('tickets');
  
  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeMsg, setUpgradeMsg] = useState<string | null>(null);

  // QR Code store for passes
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});

  // Refund state
  const [refundStatus, setRefundStatus] = useState<string | null>(null);

  // Get orders and tickets for this customer
  const orders = user ? db.getOrders({ customerId: user.id }) : [];
  const tickets = user ? db.getTickets({ customerId: user.id }) : [];
  const publishedEvents = db.getEvents({ status: 'published' });

  // Generate QR codes for tickets
  useEffect(() => {
    if (!user) return;
    tickets.forEach(async (t) => {
      try {
        const url = await QRCode.toDataURL(t.ticket_code, {
          width: 160,
          margin: 1,
          color: {
            dark: '#111022',
            light: '#ffffff',
          },
        });
        setQrCodes((prev) => ({ ...prev, [t.id]: url }));
      } catch (err) {
        console.error('Error generating QR', err);
      }
    });
  }, [tickets, user]);

  // Filtered tickets & orders
  const filteredTickets = useMemo(() => {
    if (!searchQuery.trim()) return tickets;
    const q = searchQuery.toLowerCase();
    return tickets.filter(t => 
      t.ticket_code.toLowerCase().includes(q) || 
      t.attendee_name.toLowerCase().includes(q)
    );
  }, [tickets, searchQuery]);

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter(o => 
      o.order_number.toLowerCase().includes(q) ||
      (o.event?.title || '').toLowerCase().includes(q)
    );
  }, [orders, searchQuery]);

  if (!user) {
    return (
      <AuthGate
        title="Customer Account Login Required"
        message="Without logging in, users cannot access account settings, view booked comedy seats, or manage orders. Please sign in or register below."
        returnUrl="/dashboard/customer"
      />
    );
  }

  // Lifetime metrics
  const totalSpent = orders.reduce((sum, o) => sum + (o.payment_status === 'paid' ? o.total_amount : 0), 0);
  const activeTickets = tickets.filter(t => t.status === 'valid').length;

  const handleUpgrade = async () => {
    setUpgrading(true);
    const res = await upgradeToOrganizer();
    setUpgrading(false);
    if (res.success) {
      setUpgradeMsg(res.message);
      setTimeout(() => setUpgradeMsg(null), 5000);
    }
  };

  const handlePrintPass = (ticketCode: string) => {
    window.print();
  };

  const handleRequestRefund = (orderId: string) => {
    setRefundStatus(`Refund requested for order. Your comedy club box office has been notified.`);
    setTimeout(() => setRefundStatus(null), 6000);
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
                  <span className="block text-[9px] text-[#ff4d6d] font-semibold tracking-wider uppercase -mt-0.5">Fan Wallet</span>
                </div>
              )}
            </Link>
          </div>

          {/* Quick Return to Website button in sidebar */}
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
                  onClick={() => setActiveTab('tickets')}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    activeTab === 'tickets'
                      ? 'bg-gradient-to-r from-[#d9072a] to-[#99051d] text-white shadow-lg shadow-[#d9072a]/35'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Ticket className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && (
                    <div className="flex items-center justify-between w-full">
                      <span>My Passes & QR</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                        {tickets.length}
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
                      <span>Order History</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                        {orders.length}
                      </span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('shows')}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    activeTab === 'shows'
                      ? 'bg-gradient-to-r from-[#d9072a] to-[#99051d] text-white shadow-lg shadow-[#d9072a]/35'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <CalendarIcon className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Upcoming Shows</span>}
                </button>

                <button
                  onClick={() => setActiveTab('venues')}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    activeTab === 'venues'
                      ? 'bg-gradient-to-r from-[#d9072a] to-[#99051d] text-white shadow-lg shadow-[#d9072a]/35'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Building2 className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Saved Clubs</span>}
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
                  onClick={() => setActiveTab('rewards')}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    activeTab === 'rewards'
                      ? 'bg-gradient-to-r from-[#d9072a] to-[#99051d] text-white shadow-lg shadow-[#d9072a]/35'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Award className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Comedy Rewards</span>}
                </button>

                <button
                  onClick={() => setActiveTab('support')}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    activeTab === 'support'
                      ? 'bg-gradient-to-r from-[#d9072a] to-[#99051d] text-white shadow-lg shadow-[#d9072a]/35'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Disputes &amp; Refunds</span>}
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    activeTab === 'settings'
                      ? 'bg-gradient-to-r from-[#d9072a] to-[#99051d] text-white shadow-lg shadow-[#d9072a]/35'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Account Settings</span>}
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom Sidebar Footer */}
        <div className="px-4 py-6 border-t border-[#1b1933] space-y-2">
          {/* Upgrade to Organizer button */}
          {user.role === 'customer' ? (
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold bg-[#d9072a] hover:bg-[#b90623] text-white shadow-lg shadow-[#d9072a]/20 transition"
              title="Become a Comedy Club Organizer"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              {!sidebarCollapsed && (
                <span className="truncate">{upgrading ? 'Upgrading...' : 'Host Comedy Shows'}</span>
              )}
            </button>
          ) : (
            <Link
              href="/dashboard/organizer"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/30 transition"
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              {!sidebarCollapsed && <span className="truncate">Organizer Portal</span>}
            </Link>
          )}

          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3.5 px-3.5 py-2 rounded-2xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            <User className="w-4 h-4 shrink-0" />
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
              placeholder="Search passes, venues, orders..."
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
              <span className="w-2 h-2 rounded-full bg-[#d9072a] absolute top-2.5 right-2.5" />
            </button>

            {/* User Profile – real user data, clickable with Settings + Logout */}
            <DashboardProfileMenu accentColor="red" onOpenSettings={() => setActiveTab('settings')} />
          </div>
        </header>

        {/* Upgrade alert */}
        {upgradeMsg && (
          <div className="m-8 mb-0 p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{upgradeMsg}</span>
            </div>
            <Link href="/dashboard/organizer">
              <Button size="sm" className="bg-emerald-500 text-white text-xs">
                Go to Organizer Console
              </Button>
            </Link>
          </div>
        )}

        {refundStatus && (
          <div className="m-8 mb-0 p-4 rounded-2xl bg-purple-950/70 border border-purple-500/40 text-purple-300 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>{refundStatus}</span>
          </div>
        )}

        {/* ===================== TAB 1: TICKETS & QR PASSES ===================== */}
        {activeTab === 'tickets' && (
          <div className="p-8 space-y-6 max-w-[1400px]">
            {/* ROW 1: Greeting Banner + Activity Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Greeting Card (2 cols) */}
              <div className="lg:col-span-2 rounded-[28px] bg-[#16142a] border border-[#262343] p-7 flex flex-col justify-between relative overflow-hidden shadow-xl">
                <div className="absolute -top-24 -left-24 w-60 h-60 bg-[#d9072a]/15 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
                  <span className="text-xs text-[#ff4d6d] font-bold uppercase tracking-wider">
                    Verified Digital Ticket Wallet
                  </span>
                  <Link href="/events">
                    <button className="px-4 py-1.5 rounded-full bg-[#201d39] hover:bg-[#282548] border border-[#2f2b52] text-xs font-semibold text-slate-200 flex items-center gap-2 transition">
                      <span>Browse Shows</span>
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#d9072a] to-[#ff3859] flex items-center justify-center text-white shadow-md shadow-[#d9072a]/40">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  </Link>
                </div>

                <div className="space-y-1 mb-7 relative z-10">
                  <div className="text-xs text-slate-400 font-medium">
                    You hold {activeTickets} active digital QR admission passes.
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Welcome back, {(user.full_name || 'Fan').split(' ')[0]}!
                  </h1>
                </div>

                {/* 3 Pill Badges */}
                <div className="flex flex-wrap items-center gap-3 relative z-10">
                  <div className="px-4 py-2 rounded-full bg-[#1e1b36] border border-[#2b274d] text-xs text-slate-300 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Digital Passes Active</span>
                  </div>
                  <div className="px-4 py-2 rounded-full bg-[#1e1b36] border border-[#2b274d] text-xs text-slate-300 font-medium flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-[#d9072a]" />
                    <span>Verified Door Entry</span>
                  </div>
                  <div className="px-4 py-2 rounded-full bg-[#1e1b36] border border-[#2b274d] text-xs text-slate-300 font-medium flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-sky-400" />
                    <span>Direct Club Payments</span>
                  </div>
                </div>
              </div>

              {/* Right Activity Card (1 col) */}
              <div className="rounded-[28px] bg-[#16142a] border border-[#262343] p-6 flex flex-col justify-between shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-bold text-white">Your Comedy Activity</h2>
                  <span className="text-[10px] text-slate-500 font-medium uppercase">Attendance</span>
                </div>

                {/* Glowing dual-curve chart */}
                <div className="relative w-full h-36 my-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 320 120">
                    <defs>
                      <linearGradient id="redGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#d9072a" />
                        <stop offset="50%" stopColor="#ff4d6d" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                    </defs>
                    <line x1="20" y1="20" x2="310" y2="20" stroke="#23203c" strokeDasharray="3 3" />
                    <line x1="20" y1="60" x2="310" y2="60" stroke="#23203c" strokeDasharray="3 3" />
                    <line x1="20" y1="100" x2="310" y2="100" stroke="#23203c" strokeDasharray="3 3" />
                    
                    <path
                      d="M 25 80 Q 70 90 110 70 T 180 85 T 240 75 T 305 80"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                    <path
                      d="M 25 60 Q 70 75 110 45 Q 150 20 180 22 Q 220 75 250 55 Q 280 45 305 65"
                      fill="none"
                      stroke="url(#redGlow)"
                      strokeWidth="3.5"
                    />
                    <circle cx="180" cy="22" r="5" fill="#d9072a" stroke="#ffffff" strokeWidth="2.5" />
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
              {/* Card 1: Active Passes */}
              <div className="rounded-[24px] bg-[#16142a] border border-[#262343] p-5 flex flex-col justify-between hover:border-[#d9072a]/40 transition shadow-lg relative overflow-hidden">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400">Active Passes</span>
                    <div className="w-8 h-8 rounded-full bg-[#1d1a36] border border-[#2f2b52] flex items-center justify-center text-[#ff4d6d]">
                      <Ticket className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <div className="text-2xl font-extrabold text-white tracking-tight">
                      {activeTickets}
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#d9072a]/15 text-[#ff4d6d] border border-[#d9072a]/25">
                      Ready at door
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">Instant QR scanning</div>
                </div>

                {/* Crimson Wave Sparkline */}
                <div className="mt-4 pt-2">
                  <svg className="w-full h-10 overflow-visible" viewBox="0 0 160 40">
                    <defs>
                      <linearGradient id="redSpark" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#d9072a" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#d9072a" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0 30 Q 30 10 60 25 T 110 15 T 160 22 L 160 40 L 0 40 Z" fill="url(#redSpark)" />
                    <path d="M 0 30 Q 30 10 60 25 T 110 15 T 160 22" fill="none" stroke="#d9072a" strokeWidth="2.5" />
                  </svg>
                </div>
              </div>

              {/* Card 2: Shows Booked */}
              <div className="rounded-[24px] bg-[#16142a] border border-[#262343] p-5 flex flex-col justify-between hover:border-[#10b981]/40 transition shadow-lg relative overflow-hidden">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400">Shows Booked</span>
                    <div className="w-8 h-8 rounded-full bg-[#1d1a36] border border-[#2f2b52] flex items-center justify-center text-emerald-400">
                      <CalendarIcon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <div className="text-2xl font-extrabold text-white tracking-tight">
                      {orders.length}
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                      Confirmed
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">Across verified comedy clubs</div>
                </div>

                <div className="mt-4 pt-2">
                  <svg className="w-full h-10 overflow-visible" viewBox="0 0 160 40">
                    <defs>
                      <linearGradient id="greenSpark" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0 25 Q 40 35 80 15 T 130 28 T 160 18 L 160 40 L 0 40 Z" fill="url(#greenSpark)" />
                    <path d="M 0 25 Q 40 35 80 15 T 130 28 T 160 18" fill="none" stroke="#10b981" strokeWidth="2.5" />
                  </svg>
                </div>
              </div>

              {/* Card 3: Total Spent */}
              <div className="rounded-[24px] bg-[#16142a] border border-[#262343] p-5 flex flex-col justify-between hover:border-[#38bdf8]/40 transition shadow-lg relative overflow-hidden">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400">Total Spend on Comedy</span>
                    <div className="w-8 h-8 rounded-full bg-[#1d1a36] border border-[#2f2b52] flex items-center justify-center text-sky-400">
                      <CreditCard className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <div className="text-2xl font-extrabold text-white tracking-tight">
                      {formatCurrency(totalSpent, 'usd')}
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/25">
                      Direct Payout
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">Direct-to-club transactions</div>
                </div>

                <div className="mt-4 pt-2">
                  <svg className="w-full h-10 overflow-visible" viewBox="0 0 160 40">
                    <defs>
                      <linearGradient id="blueSpark" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0 28 Q 35 15 75 30 T 120 18 T 160 24 L 160 40 L 0 40 Z" fill="url(#blueSpark)" />
                    <path d="M 0 28 Q 35 15 75 30 T 120 18 T 160 24" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
                  </svg>
                </div>
              </div>

              {/* Card 4: Loyalty Points */}
              <div className="rounded-[24px] bg-[#16142a] border border-[#262343] p-5 flex flex-col justify-between hover:border-[#f59e0b]/40 transition shadow-lg relative overflow-hidden">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400">Comedy Club Points</span>
                    <div className="w-8 h-8 rounded-full bg-[#1d1a36] border border-[#2f2b52] flex items-center justify-center text-amber-400">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <div className="text-2xl font-extrabold text-white tracking-tight">
                      350 pts
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
                      VIP Status
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">Front-row upgrades available</div>
                </div>

                <div className="mt-4 pt-2">
                  <svg className="w-full h-10 overflow-visible" viewBox="0 0 160 40">
                    <defs>
                      <linearGradient id="amberSpark" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0 32 Q 45 12 85 24 T 135 15 T 160 26 L 160 40 L 0 40 Z" fill="url(#amberSpark)" />
                    <path d="M 0 32 Q 45 12 85 24 T 135 15 T 160 26" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* ROW 3: DIGITAL TICKET WALLET PASSES */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Digital QR Admission Passes</h2>
                  <p className="text-xs text-slate-400">Present your mobile QR code at the door for instant admission.</p>
                </div>
              </div>

              {filteredTickets.length === 0 ? (
                <div className="p-12 text-center rounded-[28px] bg-[#16142a] border border-[#262343] space-y-3">
                  <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
                  <h3 className="text-base font-bold text-white">No tickets booked yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Explore our comedy lineup and reserve your front-row comedy seats today.
                  </p>
                  <Link href="/events">
                    <Button className="bg-[#d9072a] hover:bg-[#b90623] text-white rounded-full mt-2">
                      Find Comedy Shows
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredTickets.map((t) => {
                    const qrUrl = qrCodes[t.id];
                    return (
                      <div
                        key={t.id}
                        className="rounded-[28px] bg-[#16142a] border border-[#2b274c] overflow-hidden shadow-2xl relative flex flex-col justify-between"
                      >
                        {/* Ticket Header Banner */}
                        <div className="p-6 bg-gradient-to-r from-[#d9072a]/20 via-[#1c1a36] to-[#16142a] border-b border-[#2b274c] flex items-start justify-between gap-4">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#d9072a]/20 text-[#ff4d6d] border border-[#d9072a]/30">
                              Admission Pass
                            </span>
                            <h3 className="text-lg font-bold text-white mt-1.5 leading-snug">
                              Sonny&apos;s LouddMouth Comedy Showcase
                            </h3>
                            <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-[#d9072a]" />
                              <span>The Laugh Lounge NYC • New York</span>
                            </div>
                          </div>

                          <Badge variant={t.status === 'valid' ? 'success' : 'secondary'} className="capitalize text-[10px]">
                            {t.status.replace('_', ' ')}
                          </Badge>
                        </div>

                        {/* Perforated Divider Simulation */}
                        <div className="relative py-2 flex items-center justify-between px-2">
                          <div className="w-4 h-4 rounded-full bg-[#0c0b16] -ml-4" />
                          <div className="flex-1 border-b border-dashed border-[#2b274c] mx-2" />
                          <div className="w-4 h-4 rounded-full bg-[#0c0b16] -mr-4" />
                        </div>

                        {/* Ticket QR Body */}
                        <div className="p-6 pt-2 flex flex-col sm:flex-row items-center justify-between gap-6">
                          <div className="space-y-3 text-left w-full sm:w-auto">
                            <div>
                              <div className="text-[10px] text-slate-400 uppercase font-semibold">Attendee Name</div>
                              <div className="text-sm font-bold text-white">{t.attendee_name}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-400 uppercase font-semibold">Pass Code</div>
                              <div className="font-mono text-sm font-bold text-emerald-400 tracking-wider">
                                {t.ticket_code}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-400 uppercase font-semibold">Seat Tier</div>
                              <div className="text-xs text-slate-200">General Admission / Table Reserved</div>
                            </div>
                          </div>

                          {/* QR Code Container */}
                          <div className="p-3 bg-white rounded-2xl shadow-xl shrink-0 flex flex-col items-center">
                            {qrUrl ? (
                              <img src={qrUrl} alt={t.ticket_code} className="w-28 h-28 object-contain" />
                            ) : (
                              <div className="w-28 h-28 bg-slate-100 flex items-center justify-center text-xs text-slate-400 font-mono">
                                Loading QR...
                              </div>
                            )}
                            <span className="text-[9px] font-mono font-bold text-slate-800 mt-1">
                              SCAN AT DOOR
                            </span>
                          </div>
                        </div>

                        {/* Ticket Actions */}
                        <div className="p-4 bg-[#121124] border-t border-[#262343] flex items-center justify-between gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrintPass(t.ticket_code)}
                            className="rounded-xl border-[#2f2b52] hover:bg-white/5 text-xs"
                          >
                            <Printer className="w-3.5 h-3.5 mr-1.5" />
                            Print Pass
                          </Button>

                          <button
                            onClick={() => handleRequestRefund(t.order_id)}
                            className="text-[11px] text-slate-400 hover:text-rose-400 transition"
                          >
                            Request Refund
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB 2: ORDER HISTORY ===================== */}
        {activeTab === 'orders' && (
          <div className="p-8 space-y-6 max-w-[1400px]">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Confirmed Orders & Invoices</h1>
              <p className="text-xs text-slate-400">All direct payment transactions and booking receipts.</p>
            </div>

            <div className="rounded-[28px] bg-[#16142a] border border-[#262343] overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#121124] text-slate-400 font-semibold border-b border-[#262343]">
                  <tr>
                    <th className="p-4">Order #</th>
                    <th className="p-4">Comedy Show</th>
                    <th className="p-4">Passes</th>
                    <th className="p-4">Payment Method</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#23203c] text-slate-300">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-white/5 transition">
                      <td className="p-4 font-mono font-bold text-white">{ord.order_number}</td>
                      <td className="p-4 max-w-[200px] truncate text-white">{ord.event?.title || 'Live Show'}</td>
                      <td className="p-4 font-semibold">{ord.tickets?.length || 1} pass(es)</td>
                      <td className="p-4 text-slate-400 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-sky-400" />
                        <span>Direct Charge</span>
                      </td>
                      <td className="p-4">
                        <Badge variant={ord.payment_status === 'paid' ? 'success' : 'destructive'} className="text-[10px]">
                          {ord.payment_status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right font-bold text-white font-mono">
                        {formatCurrency(ord.total_amount, ord.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== TAB 3: UPCOMING SHOWS ===================== */}
        {activeTab === 'shows' && (
          <div className="p-8 space-y-6 max-w-[1400px]">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Featured Comedy Specials</h1>
                <p className="text-xs text-slate-400">Discover upcoming stand-up headliners and reserve your seat.</p>
              </div>
              <Link href="/events">
                <Button className="bg-[#d9072a] hover:bg-[#b90623] text-white rounded-full text-xs">
                  View Full Schedule
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedEvents.map((evt) => (
                <div key={evt.id} className="rounded-[24px] bg-[#16142a] border border-[#262343] p-6 space-y-4 hover:border-[#d9072a]/40 transition shadow-lg">
                  <Badge variant="glow">{evt.category}</Badge>
                  <h3 className="text-base font-bold text-white">{evt.title}</h3>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#d9072a]" />
                    <span>{formatDate(evt.start_date)} • {evt.venue_city}</span>
                  </div>
                  <Link href={`/events/${evt.slug}`} className="block pt-2">
                    <Button className="w-full bg-[#d9072a] hover:bg-[#b90623] text-white rounded-xl text-xs">
                      Reserve Seats
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== TAB 4: SAVED VENUES ===================== */}
        {activeTab === 'venues' && (
          <div className="p-8 space-y-6 max-w-[1400px]">
            <h1 className="text-2xl font-bold text-white tracking-tight">Verified Comedy Clubs & Venues</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {db.getOrganizers().map((org) => (
                <div key={org.id} className="rounded-[28px] bg-[#16142a] border border-[#262343] p-6 flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-black border border-[#d9072a]/50 flex items-center justify-center p-2 shrink-0">
                    <Building2 className="w-7 h-7 text-[#d9072a]" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <h3 className="text-base font-bold text-white">{org.business_name}</h3>
                    <p className="text-xs text-slate-400">{org.bio}</p>
                    <div className="pt-2 flex items-center gap-2">
                      <Link href={`/organizers/${org.slug}`}>
                        <Button size="sm" variant="outline" className="rounded-xl border-[#2f2b52] text-xs">
                          View Club Schedule
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== TAB 5: REWARDS ===================== */}
        {activeTab === 'rewards' && (
          <div className="p-8 space-y-6 max-w-3xl mx-auto">
            <div className="rounded-[28px] bg-[#16142a] border border-[#262343] p-8 shadow-xl text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
                <Award className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white">Comedy Loyalty Rewards</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Earn 10 points for every ticket booked directly with verified comedy clubs. Redeem points for front-row table upgrades and VIP pass perks.
              </p>
              <div className="p-4 rounded-2xl bg-[#121124] border border-[#2b274c] inline-block font-mono text-xl font-extrabold text-amber-400">
                Current Balance: 350 Comedy Points
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 6: SUPPORT & DISPUTES ===================== */}
        {activeTab === 'support' && (
          <div className="p-8 space-y-6 max-w-2xl mx-auto">
            <div className="rounded-[28px] bg-[#16142a] border border-[#262343] p-8 shadow-xl space-y-4 text-center">
              <HelpCircle className="w-12 h-12 text-[#d9072a] mx-auto" />
              <h2 className="text-xl font-bold text-white">Ticket Support & Box Office Disputes</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Need to transfer a ticket, change an attendee name, or request a refund for a rescheduled show? Our box office team is ready to assist.
              </p>
              <div className="pt-2">
                <a href="mailto:support@comedyseat.com">
                  <Button className="bg-[#d9072a] hover:bg-[#b90623] text-white rounded-full text-xs">
                    Contact Support: support@comedyseat.com
                  </Button>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB: ACCOUNT SETTINGS ===================== */}
        {activeTab === 'settings' && (
          <DashboardSettingsPanel
            onLogout={() => {
              logout();
            }}
          />
        )}
      </main>
    </div>
  );
}
