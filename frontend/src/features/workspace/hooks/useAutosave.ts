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
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Prevent autosaving default values while IndexedDB is still restoring
    if (isRestoring || !platform || !problemId) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
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
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [platform, problemId, title, language, code, drawerHeight, activeTab, testCases, delay, isRestoring]);
}
