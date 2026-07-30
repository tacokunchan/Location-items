import type { SearchLog } from '../types';

export type WantedGroup = {
  query: string;
  count: number;
  lastSearchedAt: number;
};

// Groups unresolved zero-hit searches by exact query text: the more times
// someone searched for the same missing thing, the higher its registration
// priority (設計思想 E).
export function groupUnresolvedMisses(logs: SearchLog[]): WantedGroup[] {
  const groups = new Map<string, WantedGroup>();
  for (const log of logs) {
    if (log.resolved || log.hitCount !== 0) continue;
    const existing = groups.get(log.query);
    if (existing) {
      existing.count += 1;
      existing.lastSearchedAt = Math.max(existing.lastSearchedAt, log.searchedAt);
    } else {
      groups.set(log.query, { query: log.query, count: 1, lastSearchedAt: log.searchedAt });
    }
  }
  return [...groups.values()].sort(
    (a, b) => b.count - a.count || b.lastSearchedAt - a.lastSearchedAt,
  );
}
