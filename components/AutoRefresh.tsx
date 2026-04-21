"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type AutoRefreshProps = {
  intervalMs?: number;
  showIndicator?: boolean;
  className?: string;
};

export default function AutoRefresh({ intervalMs = 60_000, showIndicator = false, className = '' }: AutoRefreshProps) {
  const router = useRouter();
  const [lastRefreshAt, setLastRefreshAt] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      // Refreshes server components data without a full page reload.
      router.refresh();
      setLastRefreshAt(new Date());
    }, intervalMs);

    return () => clearInterval(interval);
  }, [router, intervalMs]);

  if (!showIndicator) {
    return null;
  }

  return (
    <div className={className}>
      <div className="px-4 sm:px-6 py-4 bg-white/50 backdrop-blur-md rounded-[1.5rem] border border-white/50 shadow-sm items-center gap-3 flex-1 lg:flex-none justify-center lg:justify-start">
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Derniere mise a jour</p>
          <p className="text-sm font-bold text-slate-700">
            {lastRefreshAt.toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
            <span className="text-slate-400 font-semibold"> · auto 1 min</span>
          </p>
        </div>
      </div>
    </div>
  );
}