'use client';

import React from 'react';
import Link from 'next/link';

interface ComedySeatLogoProps {
  variant?: 'full' | 'icon' | 'compact' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  subtitle?: string;
  href?: string;
  className?: string;
  showTagline?: boolean;
}

export function ComedySeatLogo({
  variant = 'full',
  size = 'md',
  subtitle,
  href = '/',
  className = '',
  showTagline = false
}: ComedySeatLogoProps) {
  // Size mappings
  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-14 h-14 text-lg',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const content = (
    <div className={`flex items-center gap-3 select-none group transition-transform duration-200 ${className}`}>
      {/* Official Square Icon with Glow */}
      {(variant === 'icon' || variant === 'full' || variant === 'compact') && (
        <div 
          className={`${iconSizes[size]} rounded-2xl bg-black border border-[#d9072a]/40 flex items-center justify-center p-1.5 shadow-lg shadow-[#d9072a]/20 shrink-0 relative overflow-hidden group-hover:border-[#d9072a] transition-all`}
        >
          {/* Subtle glowing background pulse */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#d9072a]/20 to-transparent pointer-events-none" />
          
          <img
            src="/images/comedyseat-icon.png"
            alt="ComedySeat Icon"
            className="w-full h-full object-contain relative z-10 drop-shadow"
            onError={(e) => {
              // High-fidelity fallback if image cannot load
              (e.target as HTMLElement).style.display = 'none';
              const parent = (e.target as HTMLElement).parentElement;
              if (parent) {
                parent.innerHTML = `<span class="font-extrabold text-[#d9072a] tracking-tighter">CS</span>`;
              }
            }}
          />
        </div>
      )}

      {/* Brand Text & Typography */}
      {variant !== 'icon' && (
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className={`font-black tracking-tighter leading-none ${textSizes[size]}`}>
              <span className="text-[#d9072a] group-hover:text-[#ff3859] transition-colors">Comedy</span>
              <span className="text-white">Seat</span>
              <span className="text-[#d9072a] text-xs font-bold ml-0.5">.</span>
            </span>
            <span className="text-[9px] font-bold text-[#d9072a] border border-[#d9072a]/40 rounded-full px-1 py-0.2 scale-75 origin-left">
              TM
            </span>
          </div>

          {/* Subtitle / Tagline */}
          {(subtitle || showTagline) && (
            <span className="text-[9px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5">
              {subtitle || 'Pull Up A Seat To Comedy'}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
