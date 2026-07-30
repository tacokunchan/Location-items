import { getDb } from './schema';
import { setMeta } from './metaRepo';
import type { Item, Location, Photo, SearchLog } from '../types';

const EXPORT_FORMAT_VERSION = 1;

type ExportedPhoto = {
  id: string;
  createdAt: number;
  dataUrl: string;
};

export type BackupFile = {
  formatVersion: number;
  exportedAt: number;
  items: Item[];
  locations: Location[];
  searchLogs: SearchLog[];
  photos: ExportedPhoto[];
};

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

// Photos are re-encoded as base64 data URLs so the whole app survives as one
// portable JSON file; IndexedDB alone is not durable enough per the spec.
export async function exportData(): Promise<BackupFile> {
  const db = await getDb();
  const [items, locations, searchLogs, photos] = await Promise.all([
    db.getAll('items'),
    db.getAll('locations'),
    db.getAll('searchLogs'),
    db.getAll('photos'),
  ]);

  const exportedPhotos: ExportedPhoto[] = await Promise.all(
    photos.map(async (photo: Photo) => ({
      id: photo.id,
      createdAt: photo.createdAt,
      dataUrl: await blobToDataUrl(photo.blob),
    })),
  );

  const exportedAt = Date.now();
  await setMeta('lastExportAt', exportedAt);

  return {
    formatVersion: EXPORT_FORMAT_VERSION,
    exportedAt,
    items,
    locations,
    searchLogs,
    photos: exportedPhotos,
  };
}

export async function importData(file: BackupFile): Promise<void> {
  const db = await getDb();

  const photoBlobs = await Promise.all(
    file.photos.map(async (p) => ({
      id: p.id,
      createdAt: p.createdAt,
      blob: await dataUrlToBlob(p.dataUrl),
    })),
  );

  const tx = db.transaction(['items', 'locations', 'photos', 'searchLogs'], 'readwrite');
  await Promise.all([
    tx.objectStore('items').clear(),
    tx.objectStore('locations').clear(),
    tx.objectStore('photos').clear(),
    tx.objectStore('searchLogs').clear(),
  ]);
  await Promise.all([
    ...file.items.map((item) => tx.objectStore('items').put(item)),
    ...file.locations.map((loc) => tx.objectStore('locations').put(loc)),
    ...file.searchLogs.map((log) => tx.objectStore('searchLogs').put(log)),
    ...photoBlobs.map((photo) => tx.objectStore('photos').put(photo)),
  ]);
  await tx.done;
}

export async function clearAllData(): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(['items', 'locations', 'photos', 'searchLogs', 'meta'], 'readwrite');
  await Promise.all([
    tx.objectStore('items').clear(),
    tx.objectStore('locations').clear(),
    tx.objectStore('photos').clear(),
    tx.objectStore('searchLogs').clear(),
    tx.objectStore('meta').clear(),
  ]);
  await tx.done;
}

export async function estimateStorageUsage(): Promise<{ usage: number; quota: number } | null> {
  if (!navigator.storage?.estimate) return null;
  const { usage, quota } = await navigator.storage.estimate();
  return { usage: usage ?? 0, quota: quota ?? 0 };
}
