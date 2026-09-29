import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'ComedySeat | Pull Up A Seat To Comedy - Ticketing Marketplace',
  description: 'The premier comedy ticketing marketplace. Discover Stand Up Comedy, Improv, Open Mics, and live comedy specials with direct box office payments and instant QR admission passes.',
  icons: {
    icon: '/images/comedyseat-icon.png',
    apple: '/images/comedyseat-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body 
        className="min-h-screen flex flex-col bg-[#16151a] text-slate-100 antialiased selection:bg-[#d9072a]/30 selection:text-white"
        suppressHydrationWarning
      >
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col relative z-10">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
