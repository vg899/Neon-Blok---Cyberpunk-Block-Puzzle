import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono tracking-wider uppercase border transition-colors ${
        isOnline
          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
          : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
      }`}
      title={isOnline ? 'Network Connected - Cloud Sync Active' : 'Offline Mode Active - Uninterrupted Local Play'}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isOnline ? 'bg-emerald-400 shadow-[0_0_6px_#00ff88]' : 'bg-amber-400 animate-pulse shadow-[0_0_6px_#f59e0b]'
        }`}
      />
      <span>{isOnline ? 'Online' : 'Offline Mode'}</span>
    </div>
  );
};
