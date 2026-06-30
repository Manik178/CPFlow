import { getDB } from '../db/indexeddb';

export async function syncToPostgreSQL() {
  if (typeof window === 'undefined') return;
  
  const db = await getDB();
  if (!db) return;

  const tx = db.transaction(['drafts', 'layouts'], 'readonly');
  
  const drafts = await tx.objectStore('drafts').getAll();
  const layouts = await tx.objectStore('layouts').getAll();

  if (drafts.length === 0 && layouts.length === 0) return;

  const apiUrl = "";
  
  const res = await fetch(`${apiUrl}/api/workspace/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ drafts, layouts }),
    keepalive: true
  });

  if (!res.ok) {
    throw new Error('Failed to sync to PostgreSQL');
  }
}
