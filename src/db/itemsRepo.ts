import { v4 as uuid } from 'uuid';
import { getDb } from './schema';
import type { Item } from '../types';

export type NewItemInput = {
  name: string;
  aliases: string[];
  locationId: string;
  locationDetail?: string;
  photoId?: string;
  note?: string;
  tags: string[];
};

export async function listItems(): Promise<Item[]> {
  const db = await getDb();
  return db.getAll('items');
}

export async function getItem(id: string): Promise<Item | undefined> {
  const db = await getDb();
  return db.get('items', id);
}

export async function createItem(input: NewItemInput): Promise<Item> {
  const db = await getDb();
  const now = Date.now();
  const item: Item = {
    id: uuid(),
    name: input.name,
    aliases: input.aliases,
    locationId: input.locationId,
    locationDetail: input.locationDetail,
    photoId: input.photoId,
    note: input.note,
    tags: input.tags,
    status: 'stored',
    locationVerifiedAt: now,
    createdAt: now,
    updatedAt: now,
  };
  await db.put('items', item);
  return item;
}

export async function updateItem(id: string, patch: Partial<Item>): Promise<Item> {
  const db = await getDb();
  const existing = await db.get('items', id);
  if (!existing) throw new Error(`Item not found: ${id}`);
  const updated: Item = { ...existing, ...patch, id, updatedAt: Date.now() };
  await db.put('items', updated);
  return updated;
}

export async function deleteItem(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('items', id);
}

export async function markTakenOut(id: string): Promise<Item> {
  return updateItem(id, { status: 'out', takenOutAt: Date.now() });
}

export async function markReturned(id: string): Promise<Item> {
  const now = Date.now();
  return updateItem(id, { status: 'stored', takenOutAt: undefined, locationVerifiedAt: now });
}

// "Seen it here" without moving it: just refreshes the freshness clock.
export async function confirmLocation(id: string): Promise<Item> {
  return updateItem(id, { locationVerifiedAt: Date.now() });
}

export async function moveItem(
  id: string,
  locationId: string,
  locationDetail: string | undefined,
): Promise<Item> {
  return updateItem(id, { locationId, locationDetail, locationVerifiedAt: Date.now() });
}
