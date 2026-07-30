import { v4 as uuid } from 'uuid';
import { getDb } from './schema';
import type { SearchLog } from '../types';

export async function listSearchLogs(): Promise<SearchLog[]> {
  const db = await getDb();
  return db.getAll('searchLogs');
}

export async function logSearch(query: string, hitCount: number): Promise<void> {
  const db = await getDb();
  const log: SearchLog = {
    id: uuid(),
    query,
    hitCount,
    resolved: false,
    searchedAt: Date.now(),
  };
  await db.put('searchLogs', log);
}

// Marks every unresolved miss log for this exact query as resolved, since the
// user just registered the item that would have satisfied all of them.
export async function resolveLogsForQuery(query: string): Promise<void> {
  const db = await getDb();
  const all = await db.getAll('searchLogs');
  const tx = db.transaction('searchLogs', 'readwrite');
  await Promise.all(
    all
      .filter((log) => log.query === query && !log.resolved)
      .map((log) => tx.store.put({ ...log, resolved: true })),
  );
  await tx.done;
}

export async function deleteSearchLog(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('searchLogs', id);
}

// Lets the user dismiss a whole "wanted" group at once (e.g. a one-off typo
// that isn't worth registering an item for).
export async function deleteLogsForQuery(query: string): Promise<void> {
  const db = await getDb();
  const all = await db.getAll('searchLogs');
  const tx = db.transaction('searchLogs', 'readwrite');
  await Promise.all(
    all.filter((log) => log.query === query).map((log) => tx.store.delete(log.id)),
  );
  await tx.done;
}
