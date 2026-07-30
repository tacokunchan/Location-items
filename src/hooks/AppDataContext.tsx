import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { listItems } from '../db/itemsRepo';
import { listLocations } from '../db/locationsRepo';
import { listSearchLogs } from '../db/searchLogsRepo';
import { getMeta } from '../db/metaRepo';
import type { Item, Location, SearchLog } from '../types';

type AppData = {
  items: Item[];
  locations: Location[];
  searchLogs: SearchLog[];
  lastExportAt: number | undefined;
  loading: boolean;
  refresh: () => Promise<void>;
};

const AppDataContext = createContext<AppData | null>(null);

// A single load-everything-into-memory context matches the "a few dozen
// items" design goal (see 設計思想 A) — no pagination, no per-query
// IndexedDB round-trips. Any mutation just calls refresh() afterward.
export function AppDataProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchLogs, setSearchLogs] = useState<SearchLog[]>([]);
  const [lastExportAt, setLastExportAt] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [nextItems, nextLocations, nextLogs, nextLastExportAt] = await Promise.all([
      listItems(),
      listLocations(),
      listSearchLogs(),
      getMeta('lastExportAt'),
    ]);
    setItems(nextItems);
    setLocations(nextLocations);
    setSearchLogs(nextLogs);
    setLastExportAt(nextLastExportAt);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ items, locations, searchLogs, lastExportAt, loading, refresh }),
    [items, locations, searchLogs, lastExportAt, loading, refresh],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppData {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
