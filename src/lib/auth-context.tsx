'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, Organizer, UserRole } from '@/types/database';
import { db } from './data-store';

interface AuthContextType {
  user: Profile | null;
  organizer: Organizer | null;
  demoUsers: Profile[];
  isLoaded: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message: string; user?: Profile }>;
  register: (fullName: string, email: string, password?: string, role?: UserRole) => Promise<{ success: boolean; message: string; user?: Profile }>;
  logout: () => void;
  switchUser: (userId: string | null) => void;
  upgradeToOrganizer: (businessName?: string) => Promise<{ success: boolean; message: string }>;
  connectStripeAccount: (organizerId: string) => void;
  disconnectStripeAccount: (organizerId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'comedyseat_session_user_id';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [demoUsers, setDemoUsers] = useState<Profile[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const refreshState = () => {
    const active = db.getActiveUser();
    setUser(active);
    if (active) {
      const org = db.getOrganizerByUserId(active.id);
      setOrganizer(org || null);
    } else {
      setOrganizer(null);
    }
    setDemoUsers(db.getProfiles());
  };

  useEffect(() => {
    // Check localStorage session on mount
    try {
      const savedUserId = localStorage.getItem(STORAGE_KEY);
      if (savedUserId) {
        db.setActiveUser(savedUserId);
      }
    } catch {
      // Ignore localStorage errors in SSR or restricted environments
    }
    refreshState();
    setIsLoaded(true);
  }, []);

  const switchUser = (userId: string | null) => {
    db.setActiveUser(userId);
    try {
      if (userId) {
        localStorage.setItem(STORAGE_KEY, userId);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
    refreshState();
  };

  const login = async (email: string, _password?: string) => {
    const existing = db.getProfileByEmail(email.trim().toLowerCase());
    if (!existing) {
      return { 
        success: false, 
        message: 'No account found with this email. Please register or select a test account.' 
      };
    }

    switchUser(existing.id);
    return { 
      success: true, 
      message: `Welcome back, ${existing.full_name || 'User'}!`, 
      user: existing 
    };
  };

  const register = async (fullName: string, email: string, _password?: string, role: UserRole = 'customer') => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    if (!cleanName || !cleanEmail) {
      return { success: false, message: 'Full name and email are required.' };
    }

    const created = db.createUserProfile(cleanEmail, cleanName, role);
    switchUser(created.id);
    return {
      success: true,
      message: `Account created successfully! Welcome to ComedySeat, ${cleanName}.`,
      user: created,
    };
  };

  const logout = () => {
    switchUser(null);
  };

  const upgradeToOrganizer = async (businessName?: string) => {
    if (!user) {
      return { success: false, message: 'Authentication required. Please log in first.' };
    }
    try {
      db.updateProfileRole(user.id, 'organizer');
      refreshState();
      return { success: true, message: 'Account successfully upgraded to Comedy Organizer! You can now publish events and sell seats.' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const connectStripeAccount = (organizerId: string) => {
    if (!user) {
      throw new Error('Authentication required: Without logging in, you cannot edit payment settings.');
    }
    const fakeAcctId = `acct_org_${Date.now().toString().slice(-6)}`;
    db.updateOrganizerStripeAccount(organizerId, fakeAcctId, 'active', user.id);
    refreshState();
  };

  const disconnectStripeAccount = (organizerId: string) => {
    if (!user) {
      throw new Error('Authentication required: Without logging in, you cannot edit payment settings.');
    }
    db.updateOrganizerStripeAccount(organizerId, null, 'not_connected', user.id);
    refreshState();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organizer,
        demoUsers,
        isLoaded,
        login,
        register,
        logout,
        switchUser,
        upgradeToOrganizer,
        connectStripeAccount,
        disconnectStripeAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
