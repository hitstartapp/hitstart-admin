'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function TableRefreshOverlay() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const start = () => setIsRefreshing(true);
    const stop = () => setIsRefreshing(false);
    window.addEventListener('app-refresh-start', start);
    window.addEventListener('app-refresh-stop', stop);
    return () => {
      window.removeEventListener('app-refresh-start', start);
      window.removeEventListener('app-refresh-stop', stop);
    };
  }, []);

  if (!isRefreshing) return null;

  return (
    <div className="absolute inset-0 bg-white z-40 flex items-center justify-center min-h-[300px]">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <Loader2 size={32} className="animate-spin text-blue-600" />
        <p className="text-sm font-medium">Loading table data...</p>
      </div>
    </div>
  );
}
