import { useState, useEffect } from 'react';
import { getDraft, getLayout, getTestCases } from '../db/indexeddb';
import type { TestCase } from '@/shared/types/workspace';
import { LANGUAGE_CONFIG } from '../constants/language';

interface RecoveryParams {
  platform?: string;
  problemId?: string;
  defaultLanguage: string;
  setLanguage: (lang: string) => void;
  setCode: (code: string) => void;
  setDrawerHeight: (height: number) => void;
  setActiveTab: (tab: string) => void;
  setTestCases: (tests: TestCase[]) => void;
  userId?: string | null;
}

export function useWorkspaceRecovery({
  platform,
  problemId,
  defaultLanguage,
  setLanguage,
  setCode,
  setDrawerHeight,
  setActiveTab,
  setTestCases,
  userId,
}: RecoveryParams) {
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    async function restore() {
      if (!platform || !problemId) {
        setIsRestoring(false);
        return;
      }

      try {
        setIsRestoring(true);

        let layout = await getLayout(platform, problemId);
        
        // Fetch remote state if user is logged in
        if (userId) {
          try {
            const API_URL = "";
            const res = await fetch(`/api/workspace/state/${platform}/${problemId}`);
            if (res.ok) {
              const remote = await res.json();
              if (remote.layout) {
                if (!layout || remote.layout.updatedAt > layout.updatedAt) {
                  layout = remote.layout;
                }
              }
              if (remote.draft) {
                const localDraft = await getDraft(platform, problemId, remote.draft.language);
                if (!localDraft || remote.draft.updatedAt > localDraft.updatedAt) {
                  // We should load the remote draft! But we don't save it directly here, we just use it
                  // Wait, actually we can just overwrite the local state in IndexedDB if remote is newer
                  // For simplicity, we just inject it into our variables so they get loaded.
                  await import('../db/indexeddb').then(m => {
                    if (remote.layout) {
                      m.saveLayout(platform, problemId, remote.layout.activeLanguage, remote.layout.drawerHeight, remote.layout.activeTab);
                    }
                    if (remote.draft) {
                      m.saveDraft(platform, problemId, remote.draft.language, remote.draft.code);
                    }
                  });
                }
              }
            }
          } catch (e) {
            console.error('Failed to fetch remote state', e);
          }
        }
        
        // Re-fetch layout in case we updated it from remote
        layout = await getLayout(platform, problemId);
        let languageToLoad = defaultLanguage;
        if (layout) {
          setDrawerHeight(layout.drawerHeight);
          setActiveTab(layout.activeTab);
          languageToLoad = layout.activeLanguage || defaultLanguage;
        }

        const draft = await getDraft(platform, problemId, languageToLoad);
        
        if (draft) {
          setLanguage(draft.language);
          setCode(draft.code);
        } else {
          setLanguage(languageToLoad);
          setCode(LANGUAGE_CONFIG[languageToLoad]?.template || '');
        }

        const testcasesData = await getTestCases(platform, problemId);
        if (testcasesData && testcasesData.testCases && testcasesData.testCases.length > 0) {
          setTestCases(testcasesData.testCases);
        }

      } catch (err) {
        console.error('[WorkspaceRecovery] Failed to restore from IndexedDB', err);
      } finally {
        setIsRestoring(false);
      }
    }

    restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, problemId, userId]); // Intentionally exclude setters

  return { isRestoring };
}
