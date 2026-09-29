'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function DashboardIndex() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/dashboard');
      return;
    }

    if (user.role === 'super_admin') {
      router.push('/dashboard/admin');
    } else if (user.role === 'organizer') {
      router.push('/dashboard/organizer');
    } else {
      router.push('/dashboard/customer');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-[#0c0b16] flex items-center justify-center text-slate-300">
      <div className="flex items-center gap-3">
        <span className="w-5 h-5 border-2 border-[#d9072a] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold">Opening your ComedySeat dashboard...</span>
      </div>
    </div>
  );
}
