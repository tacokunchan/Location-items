import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Item, Location, Photo, SearchLog, MetaKey } from '../types';

interface AppDB extends DBSchema {
  items: {
    key: string;
    value: Item;
    indexes: { status: string };
  };
  locations: {
    key: string;
    value: Location;
  };
  photos: {
    key: string;
    value: Photo;
  };
  searchLogs: {
    key: string;
    value: SearchLog;
    indexes: { query: string };
  };
  meta: {
    key: MetaKey;
    value: { key: MetaKey; value: number };
  };
}

const DB_NAME = 'location-items-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<AppDB>> | null = null;

// Single shared connection: IndexedDB opens are cheap to reuse, expensive to
// re-negotiate (versionchange races) if every repo call opened its own.
export function getDb(): Promise<IDBPDatabase<AppDB>> {
  if (!dbPromise) {
    dbPromise = openDB<AppDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const items = db.createObjectStore('items', { keyPath: 'id' });
        items.createIndex('status', 'status');

        db.createObjectStore('locations', { keyPath: 'id' });
        db.createObjectStore('photos', { keyPath: 'id' });

        const searchLogs = db.createObjectStore('searchLogs', { keyPath: 'id' });
        searchLogs.createIndex('query', 'query');

        db.createObjectStore('meta', { keyPath: 'key' });
      },
    });
  }
  return dbPromise;
}

export type { AppDB };
