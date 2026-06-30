import { useEffect, useState, useRef } from 'react';
import { syncToPostgreSQL } from '../services/sync.service';

export type SyncState = 'Saved Locally' | 'Saving...' | 'Synced' | 'Offline' | 'Sync Failed';

export function useWorkspaceSync(userId: string | undefined) {
  const [syncState, setSyncState] = useState<SyncState>('Saved Locally');
  const syncIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!userId || typeof window === 'undefined') return;

    const doSync = async () => {
      if (!navigator.onLine) {
        setSyncState('Offline');
        return;
      }
      
      try {
        setSyncState('Saving...');
        await syncToPostgreSQL();
        setSyncState('Synced');
      } catch (err) {
        console.error('[Sync] failed:', err);
        setSyncState('Sync Failed');
      }
    };

    // Initial sync
    doSync();

    // Periodic sync every 30 seconds
    syncIntervalRef.current = setInterval(doSync, 30000);

    // Sync on window beforeunload
    const handleBeforeUnload = () => {
      doSync();
    };
    
    const handleOnline = () => {
      doSync();
    }
    const handleOffline = () => {
      setSyncState('Offline');
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [userId]);

  return { syncState };
}
