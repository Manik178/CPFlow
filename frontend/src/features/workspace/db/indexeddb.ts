import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { TestCase } from '@/shared/types/workspace';

export interface WorkspaceDraft {
  id: string; // Composite key: ${platform}-${problemId}-${language}
  platform: string;
  problemId: string;
  language: string;
  code: string;
  updatedAt: number;
}

export interface WorkspaceLayout {
  id: string; // Composite key: ${platform}-${problemId}
  platform: string;
  problemId: string;
  activeLanguage: string;
  drawerHeight: number;
  activeTab: string;
  updatedAt: number;
}

export interface WorkspaceTestCases {
  id: string; // Composite key: ${platform}-${problemId}
  platform: string;
  problemId: string;
  testCases: TestCase[];
  updatedAt: number;
}

export interface WorkspaceMetadata {
  id: string; // Composite key: ${platform}-${problemId}
  platform: string;
  problemId: string;
  title: string;
  lastOpened: number;
}

interface CPFlowDB extends DBSchema {
  drafts: {
    key: string;
    value: WorkspaceDraft;
    indexes: { 'by-problem': string };
  };
  layouts: {
    key: string;
    value: WorkspaceLayout;
  };
  testcases: {
    key: string;
    value: WorkspaceTestCases;
  };
  metadata: {
    key: string;
    value: WorkspaceMetadata;
    indexes: { 'by-last-opened': number };
  };
}

let dbPromise: Promise<IDBPDatabase<CPFlowDB>> | null = null;

export async function getDB() {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB<CPFlowDB>('cpflow-workspace-db', 1, {
      upgrade(db) {
        const draftStore = db.createObjectStore('drafts', { keyPath: 'id' });
        draftStore.createIndex('by-problem', 'problemId');
        
        db.createObjectStore('layouts', { keyPath: 'id' });
        db.createObjectStore('testcases', { keyPath: 'id' });
        
        const metadataStore = db.createObjectStore('metadata', { keyPath: 'id' });
        metadataStore.createIndex('by-last-opened', 'lastOpened');
      },
    });
  }
  return dbPromise;
}

// Helper methods

export async function saveDraft(platform: string, problemId: string, language: string, code: string) {
  const db = await getDB();
  if (!db) return;
  await db.put('drafts', {
    id: `${platform}-${problemId}-${language}`,
    platform,
    problemId,
    language,
    code,
    updatedAt: Date.now(),
  });
}

export async function getDraft(platform: string, problemId: string, language: string) {
  const db = await getDB();
  if (!db) return null;
  return db.get('drafts', `${platform}-${problemId}-${language}`);
}

export async function saveLayout(platform: string, problemId: string, activeLanguage: string, drawerHeight: number, activeTab: string) {
  const db = await getDB();
  if (!db) return;
  await db.put('layouts', {
    id: `${platform}-${problemId}`,
    platform,
    problemId,
    activeLanguage,
    drawerHeight,
    activeTab,
    updatedAt: Date.now(),
  });
}

export async function getLayout(platform: string, problemId: string) {
  const db = await getDB();
  if (!db) return null;
  return db.get('layouts', `${platform}-${problemId}`);
}

export async function saveTestCases(platform: string, problemId: string, testCases: TestCase[]) {
  const db = await getDB();
  if (!db) return;
  await db.put('testcases', {
    id: `${platform}-${problemId}`,
    platform,
    problemId,
    testCases,
    updatedAt: Date.now(),
  });
}

export async function getTestCases(platform: string, problemId: string) {
  const db = await getDB();
  if (!db) return null;
  return db.get('testcases', `${platform}-${problemId}`);
}

export async function saveMetadata(platform: string, problemId: string, title: string) {
  const db = await getDB();
  if (!db) return;
  await db.put('metadata', {
    id: `${platform}-${problemId}`,
    platform,
    problemId,
    title,
    lastOpened: Date.now(),
  });
}

export async function getRecentWorkspaces(limit = 10) {
  const db = await getDB();
  if (!db) return [];
  // Use a cursor to fetch the most recent
  const tx = db.transaction('metadata', 'readonly');
  const index = tx.store.index('by-last-opened');
  const cursor = await index.openCursor(null, 'prev');
  const results: WorkspaceMetadata[] = [];
  let current = cursor;
  while (current && results.length < limit) {
    results.push(current.value);
    current = await current.continue();
  }
  return results;
}
