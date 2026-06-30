import { useEffect, useRef } from 'react';
import { saveDraft, saveLayout, saveTestCases, saveMetadata } from '../db/indexeddb';
import type { TestCase } from '@/shared/types/workspace';

interface AutosaveParams {
  platform?: string;
  problemId?: string;
  title?: string;
  language: string;
  code: string;
  drawerHeight: number;
  activeTab: string;
  testCases: TestCase[];
  delay?: number;
  isRestoring: boolean;
}

export function useAutosave({
  platform,
  problemId,
  title,
  language,
  code,
  drawerHeight,
  activeTab,
  testCases,
  delay = 2000,
  isRestoring,
}: AutosaveParams) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Prevent autosaving default values while IndexedDB is still restoring
    if (isRestoring || !platform || !problemId) return;

    const performSave = async () => {
      try {
        await Promise.all([
          saveDraft(platform, problemId, language, code),
          saveLayout(platform, problemId, language, drawerHeight, activeTab),
          saveTestCases(platform, problemId, testCases),
          title ? saveMetadata(platform, problemId, title) : Promise.resolve(),
        ]);
        console.log('[Autosave] Saved to IndexedDB');
      } catch (err) {
        console.error('[Autosave] Failed to save to IndexedDB', err);
      }
    };

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(performSave, delay);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        performSave();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [platform, problemId, title, language, code, drawerHeight, activeTab, testCases, delay, isRestoring]);
}
