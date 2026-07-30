import { v4 as uuid } from 'uuid';
import { getDb } from './schema';
import type { Photo } from '../types';

export async function savePhoto(blob: Blob): Promise<string> {
  const db = await getDb();
  const id = uuid();
  const photo: Photo = { id, blob, createdAt: Date.now() };
  await db.put('photos', photo);
  return id;
}

export async function getPhoto(id: string): Promise<Photo | undefined> {
  const db = await getDb();
  return db.get('photos', id);
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('photos', id);
}

export async function listPhotos(): Promise<Photo[]> {
  const db = await getDb();
  return db.getAll('photos');
}
