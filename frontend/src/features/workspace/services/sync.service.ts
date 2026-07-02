import { getDB } from '../db/indexeddb';

let lastSyncedData: string | null = null;

export async function syncToPostgreSQL() {
  if (typeof window === 'undefined') return;
  
  const db = await getDB();
  if (!db) return;

  const tx = db.transaction(['drafts', 'layouts'], 'readonly');
  
  const drafts = await tx.objectStore('drafts').getAll();
  const layouts = await tx.objectStore('layouts').getAll();

  if (drafts.length === 0 && layouts.length === 0) return;

  // Prevent sending identical data every 30 seconds
  const currentDataStr = JSON.stringify({ drafts, layouts });
  if (lastSyncedData === currentDataStr) {
    return; // No changes since last sync
  }

  const apiUrl = "";
  
  const res = await fetch(`${apiUrl}/api/workspace/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: currentDataStr,
    keepalive: true
  });

  if (!res.ok) {
    throw new Error('Failed to sync to PostgreSQL');
  }

  // Cache the string on success so we don't resend it next time
  lastSyncedData = currentDataStr;
}
