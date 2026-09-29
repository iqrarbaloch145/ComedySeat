'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/data-store';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  Ticket, 
  ShoppingCart, 
  Users, 
  QrCode, 
  Shield, 
  TrendingUp, 
  CreditCard, 
  Settings, 
  HelpCircle, 
  Search, 
  Moon, 
  Sun, 
  Bell, 
  Plus, 
  Clock, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  Download, 
  Sparkles, 
  ChevronDown, 
  Building2,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  Filter,
  Home,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AuthGate } from '@/components/AuthGate';
import { DashboardProfileMenu } from '@/components/DashboardProfileMenu';
import { DashboardSettingsPanel } from '@/components/DashboardSettingsPanel';

export default function OrganizerDashboardPage() {
  const { user, organizer, connectStripeAccount, disconnectStripeAccount } = useAuth();

  // Navigation tab state matching sidebar in screenshot
  const [activeTab, setActiveTab] = useState<
    'overview' | 'calendars' | 'events' | 'tickets' | 'orders' | 'customers' | 'checkin' | 'promotions' | 'analytics' | 'payouts' | 'settings'
  >('overview');

  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
  const [useLiveDbStats, setUseLiveDbStats] = useState(false);

  // Scanner state
  const [scanCode, setScanCode] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);

  // New event schedule modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Stand up Comedy');
  const [newVenue, setNewVenue] = useState('The Laugh Lounge NYC');
  const [newCity, setNewCity] = useState('New York');
  const [newPrice, setNewPrice] = useState('45');
  const [newTotalQty, setNewTotalQty] = useState('180');
  const [newDesc, setNewDesc] = useState('');

  // Get organizer records — strictly for the logged-in user, no fallback to random first organizer
  const myOrganizer = organizer || (user ? db.getOrganizerByUserId(user.id) : null);
  const allEvents = myOrganizer ? db.getEvents({ organizerId: myOrganizer.id }) : [];
  const allOrders = myOrganizer ? db.getOrders({ organizerId: myOrganizer.id }) : [];

  // Filtered lists based on search
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return allEvents;
    const q = searchQuery.toLowerCase();
    return allEvents.filter(e => 
      e.title.toLowerCase().includes(q) || 
      (e.venue_name || '').toLowerCase().includes(q) || 
      (e.category || '').toLowerCase().includes(q)
    );
  }, [allEvents, searchQuery]);

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return allOrders;
    const q = searchQuery.toLowerCase();
    return allOrders.filter(o => 
      o.order_number.toLowerCase().includes(q) || 
      (o.customer_name || '').toLowerCase().includes(q) || 
      (o.customer_email || '').toLowerCase().includes(q) ||
      (o.event?.title || '').toLowerCase().includes(q)
    );
  }, [allOrders, searchQuery]);

  if (!user) {
    return (
      <AuthGate
        title="Organizer Box Office Login Required"
        message="Without logging in or registering, users cannot access organizer tools, edit Stripe payout settings, manage events, or scan admission tickets."
        returnUrl="/dashboard/organizer"
      />
    );
  }

  // Total sales across this organizer's events
  const totalSales = allOrders.reduce((sum, o) => sum + (o.payment_status === 'paid' ? o.total_amount : 0), 0);
  const totalTicketsSold = allOrders.reduce((sum, o) => sum + (o.tickets?.length || 0), 0);
  const totalCustomers = new Set(allOrders.map(o => o.customer_email)).size;

  // Handle ticket scan validation
  const handleValidateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanCode.trim() || !user) return;
    const result = db.validateTicketScan(scanCode.trim(), user.id);
    setScanResult(result);
  };

  // Handle CSV Attendee Export
  const handleExportCSV = () => {
    const attendees: string[] = ['Order Number,Customer Name,Customer Email,Event Title,Ticket Code,Status,Amount'];
    allOrders.forEach(o => {
      o.tickets?.forEach(t => {
        attendees.push(`"${o.order_number}","${t.attendee_name}","${t.attendee_email}","${o.event?.title || ''}","${t.ticket_code}","${t.status}",${o.total_amount}`);
      });
    });

    const blob = new Blob([attendees.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${myOrganizer?.slug || 'organizer'}-attendees-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Create Event
  const handleCreateNewEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !myOrganizer) return;

    db.createEvent({
      organizer_id: myOrganizer.id,
      owner_user_id: user.id,
      title: newTitle,
      category: newCategory,
      venue_name: newVenue,
      venue_city: newCity,
      description: newDesc || `Exclusive comedy show presented by ${myOrganizer.business_name}`,
      status: 'published',
    });

    setShowScheduleModal(false);
    setNewTitle('');
    setNewDesc('');
    setActiveTab('events');
  };

  // Team / Performer avatars matching screenshot quick join
  const teamAvatars = [
    { name: 'Marcus Sterling', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80', color: 'from-cyan-500 to-blue-600' },
    { name: 'Elena Rostova', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80', color: 'from-amber-500 to-orange-600' },
    { name: 'Devon Miles', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80', color: 'from-indigo-500 to-purple-600' },
    { name: 'Tariq Vance', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=80', color: 'from-sky-500 to-indigo-600' },
    { name: 'Sophia Chen', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80', color: 'from-rose-500 to-pink-600' },
  ];

  // Top events matching screenshot list
  const topEventsData = [
    { id: 1, name: 'Cultural Fusion Fest', sold: '789 / 1200 sold', revenue: '$35K', color: '#a855f7' },
    { id: 2, name: 'Tech Innovation Gala', sold: '892 / 1000 sold', revenue: '$44K', color: '#8b5cf6' },
    { id: 3, name: 'Visionary Vibes Live', sold: '789 / 1200 sold', revenue: '$18K', color: '#7c3aed' },
    { id: 4, name: 'Comedy Cellar Roast', sold: '789 / 1200 sold', revenue: '$35K', color: '#6d28d9' },
  ];

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
                  <span className="block text-[9px] text-[#ff4d6d] font-semibold tracking-wider uppercase -mt-0.5">Box Office Hub</span>
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
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    activeTab === 'overview'
                      ? 'bg-gradient-to-r from-[#d9072a] to-[#99051d] text-white shadow-lg shadow-[#d9072a]/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Overview</span>}
                </button>

                <button
                  onClick={() => setActiveTab('calendars')}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    activeTab === 'calendars'
                      ? 'bg-gradient-to-r from-[#d9072a] to-[#99051d] text-white shadow-lg shadow-[#d9072a]/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <CalendarIcon className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Calendars</span>}
                </button>

                <button
                  onClick={() => setActiveTab('events')}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    activeTab === 'events'
                      ? 'bg-gradient-to-r from-[#d9072a] to-[#99051d] text-white shadow-lg shadow-[#d9072a]/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Ticket className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && (
                    <div className="flex items-center justify-between w-full">
                      <span>Events</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                        {allEvents.length}
                      </span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('tickets')}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    activeTab === 'tickets'
                      ? 'bg-gradient-to-r from-[#d9072a] to-[#99051d] text-white shadow-lg shadow-[#d9072a]/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Shield className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Tickets</span>}
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    activeTab === 'orders'
                      ? 'bg-gradient-to-r from-[#d9072a] to-[#99051d] text-white shadow-lg shadow-[#d9072a]/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && (
                    <div className="flex items-center justify-between w-full">
                      <span>Orders</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                        {allOrders.length}
                      </span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('customers')}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    activeTab === 'customers'
                      ? 'bg-gradient-to-r from-[#d9072a] to-[#99051d] text-white shadow-lg shadow-[#d9072a]/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Customers</span>}
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
                  onClick={() => setActiveTab('checkin')}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    activeTab === 'checkin'
                      ? 'bg-gradient-to-r from-[#d9072a] to-[#99051d] text-white shadow-lg shadow-[#d9072a]/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <QrCode className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && (
                    <div className="flex items-center justify-between w-full">
                      <span>Check-in</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('promotions')}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    activeTab === 'promotions'
                      ? 'bg-gradient-to-r from-[#d9072a] to-[#99051d] text-white shadow-lg shadow-[#d9072a]/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Shield className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Promotions</span>}
                </button>

                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-gradient-to-r from-[#d9072a] to-[#99051d] text-white shadow-lg shadow-[#d9072a]/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Analytics</span>}
                </button>

                <button
                  onClick={() => setActiveTab('payouts')}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    activeTab === 'payouts'
                      ? 'bg-gradient-to-r from-[#d9072a] to-[#99051d] text-white shadow-lg shadow-[#d9072a]/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <CreditCard className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && (
                    <div className="flex items-center justify-between w-full">
                      <span>Payouts</span>
                      <span className={`w-2 h-2 rounded-full ${myOrganizer?.stripe_account_status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    </div>
                  )}
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom Sidebar Footer */}
        <div className="px-4 py-6 border-t border-[#1b1933] space-y-1">
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-[#d9072a] to-[#99051d] text-white shadow-lg shadow-[#d9072a]/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Account Settings</span>}
          </button>
          <a
            href="mailto:support@comedyseat.com"
            className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Help & Support</span>}
          </a>
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
              placeholder="Search..."
              value={searchQuery}
              className="w-full bg-[#17152b] border border-[#2b2848] text-sm text-slate-200 placeholder:text-slate-500 rounded-full pl-11 pr-4 py-2.5 focus:outline-none focus:border-[#d9072a] transition shadow-inner"
              onChange={(e) => setSearchQuery(e.target.value)}
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

            {/* Live Data / Demo Toggle pill */}
            <button
              onClick={() => setUseLiveDbStats(!useLiveDbStats)}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#17152b] border border-[#2b2848] text-slate-300 hover:border-[#d9072a] transition"
              title="Toggle between Demo and Live Database Metrics"
            >
              <span className={`w-2 h-2 rounded-full ${useLiveDbStats ? 'bg-emerald-400' : 'bg-[#d9072a]'}`} />
              <span>{useLiveDbStats ? 'Live DB Mode' : 'Design Mode'}</span>
            </button>

            {/* Dark/Light mode pill switch */}
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

            {/* User Profile – real logged-in user data, clickable menu */}
            <DashboardProfileMenu accentColor="red" onOpenSettings={() => setActiveTab('settings')} />
          </div>
        </header>

        {/* ===================== TAB 1: OVERVIEW (EXACT SCREENSHOT) ===================== */}
        {activeTab === 'overview' && (
          <div className="p-8 space-y-6 max-w-[1400px]">
            {/* ROW 1: Greeting + Your Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Greeting & Quick Join Card (2 cols) */}
              <div className="lg:col-span-2 rounded-[28px] bg-[#16142a] border border-[#262343] p-7 flex flex-col justify-between relative overflow-hidden shadow-xl">
                {/* Ambient glow */}
                <div className="absolute -top-24 -left-24 w-60 h-60 bg-[#7c3aed]/15 rounded-full blur-3xl pointer-events-none" />

                {/* Top Row: Quick join + Schedule */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-medium">Quick join</span>
                    <div className="flex items-center -space-x-2">
                      {teamAvatars.map((person, idx) => (
                        <div
                          key={idx}
                          className="w-8 h-8 rounded-full border-2 border-[#16142a] overflow-hidden relative group cursor-pointer"
                          title={person.name}
                        >
                          <img src={person.img} alt={person.name} className="w-full h-full object-cover" />
                          <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#16142a]" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowScheduleModal(true)}
                      className="px-4 py-1.5 rounded-full bg-[#201d39] hover:bg-[#282548] border border-[#2f2b52] text-xs font-semibold text-slate-200 flex items-center gap-2 transition"
                    >
                      <span>Schedule</span>
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#a855f7] flex items-center justify-center text-white shadow-md shadow-[#7c3aed]/40">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  </div>
                </div>

                {/* Middle: Headline Greeting */}
                <div className="space-y-1 mb-7 relative z-10">
                  <div className="text-xs text-slate-400 font-medium">
                    You have {allEvents.length || 5} active events and 12 upcoming this month.
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Good Morning! {user.full_name?.split(' ')[0] || 'Robert'}
                  </h1>
                </div>

                {/* Bottom Row: 3 Pill Badges */}
                <div className="flex flex-wrap items-center gap-3 relative z-10">
                  <div className="px-4 py-2 rounded-full bg-[#1e1b36] border border-[#2b274d] text-xs text-slate-300 font-medium flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span>10hrs time saved</span>
                  </div>
                  <div className="px-4 py-2 rounded-full bg-[#1e1b36] border border-[#2b274d] text-xs text-slate-300 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>30 projects compl...</span>
                  </div>
                  <div className="px-4 py-2 rounded-full bg-[#1e1b36] border border-[#2b274d] text-xs text-slate-300 font-medium flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span>8 in-progress</span>
                  </div>
                </div>
              </div>

              {/* Right Card: "Your Activity" (1 col) */}
              <div className="rounded-[28px] bg-[#16142a] border border-[#262343] p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-bold text-white">Your Activity</h2>
                  <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Weekly trend</span>
                </div>

                {/* Glowing dual-curve chart */}
                <div className="relative w-full h-36 my-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 320 120">
                    <defs>
                      <linearGradient id="purpleGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="50%" stopColor="#c084fc" />
                        <stop offset="100%" stopColor="#818cf8" />
                      </linearGradient>
                      <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#a855f7" floodOpacity="0.5" />
                      </filter>
                    </defs>

                    {/* Horizontal grid lines */}
                    <line x1="20" y1="20" x2="310" y2="20" stroke="#23203c" strokeDasharray="3 3" />
                    <line x1="20" y1="60" x2="310" y2="60" stroke="#23203c" strokeDasharray="3 3" />
                    <line x1="20" y1="100" x2="310" y2="100" stroke="#23203c" strokeDasharray="3 3" />

                    {/* Dotted orange/coral spline wave */}
                    <path
                      d="M 25 75 Q 70 85 110 65 T 180 80 T 240 70 T 305 75"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />

                    {/* Solid glowing purple wave curve */}
                    <path
                      d="M 25 55 Q 70 75 110 50 Q 150 15 180 18 Q 220 70 250 50 Q 280 40 305 60"
                      fill="none"
                      stroke="url(#purpleGlow)"
                      strokeWidth="3.5"
                      filter="url(#glowEffect)"
                    />

                    {/* Active point highlight dot on Wednesday peak */}
                    <circle cx="180" cy="18" r="5" fill="#a855f7" stroke="#ffffff" strokeWidth="2.5" />
                  </svg>
                </div>

                {/* Day labels + Wednesday highlighted pillar */}
                <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400 items-center">
                  <span className="hover:text-white cursor-pointer">Mon</span>
                  <span className="hover:text-white cursor-pointer">Tue</span>
                  <div className="bg-[#7c3aed]/30 border border-[#7c3aed]/50 text-white font-extrabold rounded-lg py-1 shadow-md">
                    Wed
                  </div>
                  <span className="hover:text-white cursor-pointer">Thu</span>
                  <span className="hover:text-white cursor-pointer">Fri</span>
                  <span className="hover:text-white cursor-pointer">Sat</span>
                  <span className="hover:text-white cursor-pointer">Sun</span>
                </div>
              </div>
            </div>

            {/* ROW 2: 4 KPI METRIC CARDS WITH GLOWING SPARKLINES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Total Revenue */}
              <div className="rounded-[24px] bg-[#16142a] border border-[#262343] p-5 flex flex-col justify-between hover:border-[#38bdf8]/40 transition shadow-lg relative overflow-hidden group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400">Total Revenue</span>
                    <div className="w-8 h-8 rounded-full bg-[#1d1a36] border border-[#2f2b52] flex items-center justify-center text-sky-400">
                      <CreditCard className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <div className="text-2xl font-extrabold text-white tracking-tight">
                      {useLiveDbStats ? formatCurrency(totalSales, 'usd') : '$89,245'}
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/25">
                      +12.5%
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">vs last 30 days</div>
                </div>

                {/* Electric Blue Wave Sparkline */}
                <div className="mt-4 pt-2">
                  <svg className="w-full h-10 overflow-visible" viewBox="0 0 160 40">
                    <defs>
                      <linearGradient id="blueSpark" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 30 Q 30 10 60 25 T 110 15 T 160 22 L 160 40 L 0 40 Z"
                      fill="url(#blueSpark)"
                    />
                    <path
                      d="M 0 30 Q 30 10 60 25 T 110 15 T 160 22"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 2: Tickets Sold */}
              <div className="rounded-[24px] bg-[#16142a] border border-[#262343] p-5 flex flex-col justify-between hover:border-[#10b981]/40 transition shadow-lg relative overflow-hidden group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400">Tickets Sold</span>
                    <div className="w-8 h-8 rounded-full bg-[#1d1a36] border border-[#2f2b52] flex items-center justify-center text-emerald-400">
                      <Ticket className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <div className="text-2xl font-extrabold text-white tracking-tight">
                      {useLiveDbStats ? totalTicketsSold.toLocaleString() : '2,847'}
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                      +8.2%
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">234 sold today</div>
                </div>

                {/* Emerald Green Wave Sparkline */}
                <div className="mt-4 pt-2">
                  <svg className="w-full h-10 overflow-visible" viewBox="0 0 160 40">
                    <defs>
                      <linearGradient id="greenSpark" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 25 Q 40 35 80 15 T 130 28 T 160 18 L 160 40 L 0 40 Z"
                      fill="url(#greenSpark)"
                    />
                    <path
                      d="M 0 25 Q 40 35 80 15 T 130 28 T 160 18"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 3: Active Events */}
              <div className="rounded-[24px] bg-[#16142a] border border-[#262343] p-5 flex flex-col justify-between hover:border-[#a855f7]/40 transition shadow-lg relative overflow-hidden group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400">Active Events</span>
                    <div className="w-8 h-8 rounded-full bg-[#1d1a36] border border-[#2f2b52] flex items-center justify-center text-purple-400">
                      <CalendarIcon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <div className="text-2xl font-extrabold text-white tracking-tight">
                      {useLiveDbStats ? allEvents.length : '23'}
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/25">
                      5 this week
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">12 upcoming</div>
                </div>

                {/* Purple Wave Sparkline */}
                <div className="mt-4 pt-2">
                  <svg className="w-full h-10 overflow-visible" viewBox="0 0 160 40">
                    <defs>
                      <linearGradient id="purpleSpark" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 28 Q 35 15 75 30 T 120 18 T 160 24 L 160 40 L 0 40 Z"
                      fill="url(#purpleSpark)"
                    />
                    <path
                      d="M 0 28 Q 35 15 75 30 T 120 18 T 160 24"
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 4: Total Customers */}
              <div className="rounded-[24px] bg-[#16142a] border border-[#262343] p-5 flex flex-col justify-between hover:border-[#f97316]/40 transition shadow-lg relative overflow-hidden group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400">Total Customers</span>
                    <div className="w-8 h-8 rounded-full bg-[#1d1a36] border border-[#2f2b52] flex items-center justify-center text-orange-400">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <div className="text-2xl font-extrabold text-white tracking-tight">
                      {useLiveDbStats ? totalCustomers : '8,734'}
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/25">
                      +15.3%
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">456 new this month</div>
                </div>

                {/* Radiant Orange Wave Sparkline */}
                <div className="mt-4 pt-2">
                  <svg className="w-full h-10 overflow-visible" viewBox="0 0 160 40">
                    <defs>
                      <linearGradient id="orangeSpark" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 32 Q 45 12 85 24 T 135 15 T 160 26 L 160 40 L 0 40 Z"
                      fill="url(#orangeSpark)"
                    />
                    <path
                      d="M 0 32 Q 45 12 85 24 T 135 15 T 160 26"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* ROW 3: SALES ANALYTICS (STREAMGRAPH RIBBONS) + TOP EVENTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Large Card: "Sales Analytics" (2 cols) */}
              <div className="lg:col-span-2 rounded-[28px] bg-[#16142a] border border-[#262343] p-7 flex flex-col justify-between shadow-xl relative overflow-hidden">
                {/* Header with Title and Dropdown */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">Sales Analytics</h2>
                    <p className="text-xs text-slate-400">Revenue and ticket sales over time</p>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setTimeDropdownOpen(!timeDropdownOpen)}
                      className="px-3 py-1.5 rounded-full bg-[#201d39] border border-[#2f2b52] text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-2 transition"
                    >
                      <span>{timeRange}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {timeDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-[#1c1a36] border border-[#332f58] p-1.5 shadow-2xl z-30 space-y-1">
                        {['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'All Time'].map((r) => (
                          <button
                            key={r}
                            onClick={() => {
                              setTimeRange(r);
                              setTimeDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                              timeRange === r ? 'bg-[#7c3aed] text-white' : 'text-slate-300 hover:bg-white/5'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* THE 3D PERSPECTIVE STACKED RIBBON FLOW STREAMGRAPH */}
                <div className="w-full h-64 relative flex items-center justify-center py-4">
                  <svg className="w-full h-full" viewBox="0 0 600 240" preserveAspectRatio="none">
                    <defs>
                      {/* Flowing Ribbon Gradients connecting columns */}
                      <linearGradient id="flowPurple" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.85" />
                        <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#9333ea" stopOpacity="0.9" />
                      </linearGradient>

                      <linearGradient id="flowGreen" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
                        <stop offset="50%" stopColor="#059669" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
                      </linearGradient>

                      <linearGradient id="flowOrange" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ea580c" stopOpacity="0.85" />
                        <stop offset="50%" stopColor="#c2410c" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0.9" />
                      </linearGradient>

                      {/* Bar fill gradients */}
                      <linearGradient id="barPurple" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#7c3aed" />
                      </linearGradient>
                      <linearGradient id="barGreen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                      <linearGradient id="barOrange" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fb923c" />
                        <stop offset="100%" stopColor="#ea580c" />
                      </linearGradient>
                    </defs>

                    {/* CONNECTING FLOWING RIBBONS (Dec 18 -> Dec 19) */}
                    {/* Purple ribbon */}
                    <path
                      d="M 90 90 C 180 90, 210 135, 290 135 L 290 152 C 210 152, 180 110, 90 110 Z"
                      fill="url(#flowPurple)"
                      opacity="0.8"
                    />
                    {/* Green ribbon */}
                    <path
                      d="M 90 116 C 180 116, 210 157, 290 157 L 290 173 C 210 173, 180 134, 90 134 Z"
                      fill="url(#flowGreen)"
                      opacity="0.8"
                    />
                    {/* Orange ribbon */}
                    <path
                      d="M 90 140 C 180 140, 210 178, 290 178 L 290 200 C 210 200, 180 162, 90 162 Z"
                      fill="url(#flowOrange)"
                      opacity="0.85"
                    />

                    {/* CONNECTING FLOWING RIBBONS (Dec 19 -> Dec 20) */}
                    {/* Purple ribbon */}
                    <path
                      d="M 310 135 C 390 135, 420 50, 510 50 L 510 72 C 420 72, 390 152, 310 152 Z"
                      fill="url(#flowPurple)"
                      opacity="0.85"
                    />
                    {/* Green ribbon */}
                    <path
                      d="M 310 157 C 390 157, 420 78, 510 78 L 510 115 C 420 115, 390 173, 310 173 Z"
                      fill="url(#flowGreen)"
                      opacity="0.85"
                    />
                    {/* Orange ribbon */}
                    <path
                      d="M 310 178 C 390 178, 420 120, 510 120 L 510 170 C 420 170, 390 200, 310 200 Z"
                      fill="url(#flowOrange)"
                      opacity="0.85"
                    />

                    {/* COLUMN 1: Dec 18 Stacked Bars */}
                    <g>
                      <rect x="25" y="85" width="65" height="20" rx="8" fill="url(#barPurple)" />
                      <rect x="25" y="111" width="65" height="20" rx="8" fill="url(#barGreen)" />
                      <rect x="25" y="137" width="65" height="24" rx="8" fill="url(#barOrange)" />
                    </g>

                    {/* COLUMN 2: Dec 19 Stacked Bars */}
                    <g>
                      <rect x="260" y="132" width="65" height="18" rx="8" fill="url(#barPurple)" />
                      <rect x="260" y="154" width="65" height="18" rx="8" fill="url(#barGreen)" />
                      <rect x="260" y="176" width="65" height="18" rx="8" fill="url(#barOrange)" />
                    </g>

                    {/* COLUMN 3: Dec 20 Stacked Bars */}
                    <g>
                      <rect x="500" y="45" width="65" height="24" rx="8" fill="url(#barPurple)" />
                      <rect x="500" y="74" width="65" height="35" rx="8" fill="url(#barGreen)" />
                      <rect x="500" y="114" width="65" height="50" rx="8" fill="url(#barOrange)" />
                    </g>

                    {/* Value annotations matching screenshot */}
                    <text x="57" y="70" fill="#94a3b8" fontSize="13" fontWeight="bold" textAnchor="middle">
                      $3.6k
                    </text>
                    <text x="292" y="118" fill="#94a3b8" fontSize="13" fontWeight="bold" textAnchor="middle">
                      $3.4k
                    </text>
                    <text x="532" y="32" fill="#94a3b8" fontSize="13" fontWeight="bold" textAnchor="middle">
                      $4.2k
                    </text>

                    {/* X-axis date labels */}
                    <text x="57" y="215" fill="#64748b" fontSize="12" fontWeight="600" textAnchor="middle">
                      Dec 18
                    </text>
                    <text x="292" y="215" fill="#64748b" fontSize="12" fontWeight="600" textAnchor="middle">
                      Dec 19
                    </text>
                    <text x="532" y="215" fill="#64748b" fontSize="12" fontWeight="600" textAnchor="middle">
                      Dec 20
                    </text>
                  </svg>
                </div>
              </div>

              {/* Right Card: "Top Events" (1 col) */}
              <div className="rounded-[28px] bg-[#16142a] border border-[#262343] p-7 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-white tracking-tight">Top Events</h2>
                    <button
                      onClick={() => setActiveTab('events')}
                      className="text-xs text-[#a855f7] hover:underline font-semibold"
                    >
                      View all
                    </button>
                  </div>

                  <div className="space-y-4">
                    {topEventsData.map((evt) => (
                      <div
                        key={evt.id}
                        className="p-3 rounded-2xl bg-[#1d1a36]/70 border border-[#2c284e] flex items-center justify-between gap-3 hover:border-[#7c3aed]/40 transition group cursor-pointer"
                        onClick={() => setActiveTab('events')}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Number badge */}
                          <div className="w-10 h-10 rounded-xl bg-[#282245] border border-[#3e3468] text-purple-300 font-extrabold flex items-center justify-center shrink-0 shadow-md">
                            {evt.id}
                          </div>

                          <div className="truncate">
                            <div className="font-bold text-sm text-white truncate group-hover:text-[#a855f7] transition">
                              {evt.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {evt.sold}
                            </div>
                          </div>
                        </div>

                        {/* Revenue pill */}
                        <div className="px-3 py-1 rounded-full bg-[#272346] border border-[#393261] text-xs font-bold text-slate-200 shrink-0">
                          {evt.revenue}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#23203c] mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Want to schedule a comedy show?</span>
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    <span>+ Schedule Show</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: EVENTS ===================== */}
        {activeTab === 'events' && (
          <div className="p-8 space-y-6 max-w-[1400px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Comedy Shows & Events</h1>
                <p className="text-xs text-slate-400">Manage your published comedy shows, ticket inventories, and venues.</p>
              </div>
              <Button
                onClick={() => setShowScheduleModal(true)}
                className="bg-gradient-to-r from-[#d9072a] to-[#99051d] hover:from-[#c00624] hover:to-[#820418] text-white shadow-lg shadow-[#d9072a]/30 rounded-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule New Show
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((evt) => (
                <div key={evt.id} className="rounded-[24px] bg-[#16142a] border border-[#262343] p-6 space-y-4 hover:border-purple-500/40 transition shadow-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {evt.category}
                      </span>
                      <h3 className="text-base font-bold text-white mt-2 leading-snug">{evt.title}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-purple-400" />
                        {formatDate(evt.start_date)} • {evt.venue_city}
                      </p>
                    </div>
                    <Badge variant={evt.status === 'published' ? 'success' : 'secondary'} className="capitalize text-[10px]">
                      {evt.status}
                    </Badge>
                  </div>

                  {/* Ticket tiers breakdown */}
                  <div className="pt-3 border-t border-white/5 space-y-2">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ticket Passes & Seating:</div>
                    <div className="space-y-1.5">
                      {evt.ticket_types?.map((t) => (
                        <div key={t.id} className="p-2.5 rounded-xl bg-[#1d1a36] border border-white/5 flex items-center justify-between text-xs">
                          <span className="text-white font-medium">{t.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400 font-mono text-[11px]">{t.available_inventory} / {t.total_inventory} avail</span>
                            <span className="font-bold text-emerald-400 font-mono">{formatCurrency(t.price, t.currency)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <Link href={`/events/${evt.slug}`}>
                      <Button variant="outline" size="sm" className="rounded-xl border-[#2f2b52] hover:bg-white/5 text-xs">
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                        View Live Listing
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== TAB 3: ORDERS ===================== */}
        {activeTab === 'orders' && (
          <div className="p-8 space-y-6 max-w-[1400px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Box Office Orders & Attendees</h1>
                <p className="text-xs text-slate-400">All direct confirmed ticket reservations and buyer records.</p>
              </div>
              <Button
                variant="outline"
                onClick={handleExportCSV}
                className="rounded-full border-[#2f2b52] hover:bg-white/5 text-xs"
              >
                <Download className="w-3.5 h-3.5 mr-2" />
                Export Attendee CSV
              </Button>
            </div>

            <div className="rounded-[24px] bg-[#16142a] border border-[#262343] overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#121124] text-slate-400 font-semibold border-b border-[#262343]">
                    <tr>
                      <th className="p-4">Order #</th>
                      <th className="p-4">Comedy Show</th>
                      <th className="p-4">Buyer</th>
                      <th className="p-4">Tickets</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Direct Merchant Acct</th>
                      <th className="p-4 text-right">Amount</th>
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
                        <td className="p-4 font-semibold">{ord.tickets?.length || 1} pass(es)</td>
                        <td className="p-4">
                          <Badge variant={ord.payment_status === 'paid' ? 'success' : 'destructive'} className="text-[10px]">
                            {ord.payment_status}
                          </Badge>
                        </td>
                        <td className="p-4 font-mono text-[10px] text-emerald-400">
                          {ord.payment_gateway_account_id}
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
          </div>
        )}

        {/* ===================== TAB 4: CHECK-IN SCANNER ===================== */}
        {activeTab === 'checkin' && (
          <div className="p-8 space-y-6 max-w-2xl mx-auto">
            <div className="rounded-[28px] bg-[#16142a] border border-[#262343] p-8 shadow-2xl text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-purple-900/30 border border-purple-500/40 flex items-center justify-center text-purple-300 mx-auto shadow-lg shadow-purple-900/30">
                <QrCode className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white tracking-tight">Box Office Door Scanner</h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Scan attendee QR codes or enter digital ticket pass codes to validate admission and prevent duplicate entries in real-time.
                </p>
              </div>

              <form onSubmit={handleValidateTicket} className="space-y-4 text-left">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Ticket Code (e.g. TKT-SONN-B8P8-SM62)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter or scan ticket code..."
                      value={scanCode}
                      onChange={(e) => setScanCode(e.target.value)}
                      className="font-mono text-base uppercase bg-[#121124] border-[#2f2b52] rounded-xl text-white"
                    />
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-[#d9072a] to-[#99051d] hover:from-[#c00624] hover:to-[#820418] text-white rounded-xl shrink-0 shadow-lg shadow-[#d9072a]/25"
                    >
                      Admit Attendee
                    </Button>
                  </div>
                </div>

                {/* Quick test buttons */}
                <div className="pt-2 flex flex-wrap gap-2 items-center">
                  <span className="text-[11px] text-slate-400">Quick Test Codes:</span>
                  <button
                    type="button"
                    onClick={() => setScanCode('TKT-SONN-B8P8-SM62')}
                    className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-[#211d3d] text-purple-300 border border-purple-500/30 hover:bg-purple-900/40"
                  >
                    TKT-SONN-B8P8-SM62
                  </button>
                  <button
                    type="button"
                    onClick={() => setScanCode('TKT-NEON-8A2F-9011')}
                    className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-[#211d3d] text-purple-300 border border-purple-500/30 hover:bg-purple-900/40"
                  >
                    TKT-NEON-8A2F-9011
                  </button>
                </div>
              </form>

              {/* Scan result display */}
              {scanResult && (
                <div className={`p-4 rounded-2xl border text-left space-y-2 ${
                  scanResult.valid
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {scanResult.valid ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-rose-400" />}
                    <span>{scanResult.message}</span>
                  </div>
                  {scanResult.ticket && (
                    <div className="text-xs text-slate-300 space-y-1 pt-2 border-t border-white/10 font-mono">
                      <div>Attendee: <strong className="text-white">{scanResult.ticket.attendee_name}</strong></div>
                      <div>Pass Code: {scanResult.ticket.ticket_code}</div>
                      <div>Status: <span className="uppercase text-emerald-400">{scanResult.ticket.status}</span></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB 5: PAYOUTS & STRIPE CONNECT ===================== */}
        {activeTab === 'payouts' && (
          <div className="p-8 space-y-6 max-w-4xl mx-auto">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Direct Merchant Gateway & Payouts</h1>
              <p className="text-xs text-slate-400">Direct-to-organizer payment routing via Stripe Connect.</p>
            </div>

            <div className="rounded-[28px] bg-[#16142a] border border-[#262343] p-8 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    myOrganizer?.stripe_account_status === 'active' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    <CreditCard className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white">Stripe Connect Custom/Standard Gateway</span>
                      <Badge variant={myOrganizer?.stripe_account_status === 'active' ? 'success' : 'destructive'} className="uppercase text-[10px]">
                        {(myOrganizer?.stripe_account_status ?? 'not_connected').replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                      {myOrganizer?.stripe_account_status === 'active' ? (
                        <>Connected merchant account <span className="font-mono text-emerald-400 font-semibold">{myOrganizer?.stripe_account_id}</span>. Direct payments for tickets bypass the marketplace and settle straight into your club&apos;s verified bank account.</>
                      ) : (
                        <>No active Stripe merchant account attached. Buyers checking out for your events will be blocked until your gateway is linked.</>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {myOrganizer?.stripe_account_status === 'active' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => myOrganizer && disconnectStripeAccount(myOrganizer.id)}
                      className="text-rose-400 border-rose-500/30 hover:bg-rose-950/40 rounded-full"
                    >
                      Simulate Disconnect (Test Blocked Checkout)
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => myOrganizer && connectStripeAccount(myOrganizer.id)}
                      className="bg-gradient-to-r from-[#d9072a] to-[#99051d] hover:from-[#c00624] hover:to-[#820418] text-white rounded-full shadow-lg shadow-[#d9072a]/25"
                    >
                      Connect Stripe Account
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 6: CALENDARS ===================== */}
        {activeTab === 'calendars' && (
          <div className="p-8 space-y-6 max-w-[1400px]">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Comedy Schedule & Showtimes</h1>
                <p className="text-xs text-slate-400">Monthly comedy calendar, headliner slots, and show dates.</p>
              </div>
              <Button
                onClick={() => setShowScheduleModal(true)}
                className="bg-gradient-to-r from-[#d9072a] to-[#99051d] hover:from-[#c00624] hover:to-[#820418] text-white rounded-full shadow-lg shadow-[#d9072a]/25"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Show Date
              </Button>
            </div>

            <div className="rounded-[28px] bg-[#16142a] border border-[#262343] p-6 shadow-xl">
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 border-b border-white/5 pb-3">
                <span>SUN</span>
                <span>MON</span>
                <span>TUE</span>
                <span className="text-purple-400">WED</span>
                <span>THU</span>
                <span>FRI</span>
                <span>SAT</span>
              </div>
              <div className="grid grid-cols-7 gap-2 pt-4">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                  const hasShow = day === 18 || day === 19 || day === 20 || day === 25;
                  return (
                    <div
                      key={day}
                      className={`min-h-[90px] rounded-2xl p-2.5 flex flex-col justify-between border transition ${
                        hasShow
                          ? 'bg-[#211d3d] border-[#7c3aed]/50 text-white'
                          : 'bg-[#121124] border-white/5 text-slate-400 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{day}</span>
                        {hasShow && <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />}
                      </div>
                      {hasShow && (
                        <div className="text-[10px] font-semibold text-purple-300 truncate bg-purple-900/40 px-2 py-1 rounded-lg">
                          {day === 18 ? 'LouddMouth Live' : day === 19 ? 'Comedy Cellar' : 'Late Night Roast'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 7: TICKETS & TIER INVENTORY ===================== */}
        {activeTab === 'tickets' && (
          <div className="p-8 space-y-6 max-w-[1400px]">
            <h1 className="text-2xl font-bold text-white tracking-tight">Ticket Inventory & Seating Passes</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allEvents.flatMap(e => e.ticket_types || []).map((tier) => (
                <div key={tier.id} className="rounded-[24px] bg-[#16142a] border border-[#262343] p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-base">{tier.name}</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">{formatCurrency(tier.price, tier.currency)}</span>
                  </div>
                  <div className="w-full bg-[#121124] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#7c3aed] to-[#10b981] h-full"
                      style={{ width: `${Math.round(((tier.total_inventory - tier.available_inventory) / tier.total_inventory) * 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>{tier.available_inventory} available</span>
                    <span>{tier.total_inventory} total seats</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== TAB 8: CUSTOMERS ===================== */}
        {activeTab === 'customers' && (
          <div className="p-8 space-y-6 max-w-[1400px]">
            <h1 className="text-2xl font-bold text-white tracking-tight">Comedy Fans & Verified Buyers</h1>
            <div className="rounded-[24px] bg-[#16142a] border border-[#262343] overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#121124] text-slate-400 font-semibold border-b border-[#262343]">
                  <tr>
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Verified Passes</th>
                    <th className="p-4">Account Type</th>
                    <th className="p-4 text-right">Lifetime Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#23203c] text-slate-300">
                  {allOrders.map((ord, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition">
                      <td className="p-4 font-bold text-white">{ord.customer_name}</td>
                      <td className="p-4 text-slate-400 font-mono">{ord.customer_email}</td>
                      <td className="p-4">{ord.tickets?.length || 1} pass(es)</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 text-[10px] font-semibold border border-purple-500/20">
                          Auto-Provisioned Fan
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-emerald-400">
                        {formatCurrency(ord.total_amount, ord.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== TAB 9: ANALYTICS ===================== */}
        {activeTab === 'analytics' && (
          <div className="p-8 space-y-6 max-w-[1400px]">
            <h1 className="text-2xl font-bold text-white tracking-tight">Extended Marketplace Analytics</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-[28px] bg-[#16142a] border border-[#262343] p-6 space-y-4">
                <h3 className="font-bold text-white text-base">Seat Conversion Ratio</h3>
                <p className="text-xs text-slate-400">Conversion from page views to confirmed ticket purchases.</p>
                <div className="text-3xl font-extrabold text-emerald-400 font-mono">68.4%</div>
                <div className="text-xs text-slate-400">+4.2% higher than industry average</div>
              </div>

              <div className="rounded-[28px] bg-[#16142a] border border-[#262343] p-6 space-y-4">
                <h3 className="font-bold text-white text-base">Average Order Value (AOV)</h3>
                <p className="text-xs text-slate-400">Average basket value per confirmed comedy ticket checkout.</p>
                <div className="text-3xl font-extrabold text-purple-300 font-mono">$72.50</div>
                <div className="text-xs text-slate-400">Including VIP front-row tables</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ===================== SCHEDULE / CREATE SHOW MODAL ===================== */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-[28px] bg-[#16142a] border border-[#3b3562] p-7 shadow-2xl space-y-5 text-left relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#7c3aed] text-white flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Schedule Comedy Show</h3>
                  <p className="text-xs text-slate-400">Create ticket tiers and publish to the box office.</p>
                </div>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewEvent} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Show Title</label>
                <Input
                  required
                  placeholder="e.g. Sonny's LouddMouth Stand-Up Live"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-[#121124] border-[#2f2b52] rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#121124] border border-[#2f2b52] text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="Stand up Comedy">Stand up Comedy</option>
                    <option value="Improv Comedy">Improv Comedy</option>
                    <option value="Roast Battles">Roast Battles</option>
                    <option value="Headliner Showcase">Headliner Showcase</option>
                    <option value="Open Mic">Open Mic</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Venue City</label>
                  <Input
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="bg-[#121124] border-[#2f2b52] rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Venue Name</label>
                  <Input
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                    className="bg-[#121124] border-[#2f2b52] rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Ticket Price ($)</label>
                  <Input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="bg-[#121124] border-[#2f2b52] rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe your comedy lineup, headliners, and seating format..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#121124] border border-[#2f2b52] text-slate-200 rounded-xl p-3 text-xs focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowScheduleModal(false)}
                  className="rounded-xl border-[#2f2b52]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-[#d9072a] to-[#99051d] hover:from-[#c00624] hover:to-[#820418] text-white rounded-xl shadow-lg shadow-[#d9072a]/30"
                >
                  Publish & Schedule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== TAB: ACCOUNT SETTINGS ===================== */}
      {activeTab === 'settings' && (
        <div className="flex-1">
          <DashboardSettingsPanel />
        </div>
      )}
    </div>
  );
}
