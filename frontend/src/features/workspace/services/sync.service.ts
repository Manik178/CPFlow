import { getDB } from '../db/indexeddb';

export async function syncToPostgreSQL(userId: string) {
  if (typeof window === 'undefined') return;
  
  const db = await getDB();
  if (!db) return;

  const tx = db.transaction(['drafts', 'layouts'], 'readonly');
  
  const drafts = await tx.objectStore('drafts').getAll();
  const layouts = await tx.objectStore('layouts').getAll();

  if (drafts.length === 0 && layouts.length === 0) return;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  
  const res = await fetch(`${apiUrl}/api/workspace/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, drafts, layouts })
  });

  if (!res.ok) {
    throw new Error('Failed to sync to PostgreSQL');
  }
}
