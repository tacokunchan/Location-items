import { getDb } from './schema';
import type { MetaKey } from '../types';

export async function getMeta(key: MetaKey): Promise<number | undefined> {
  const db = await getDb();
  const row = await db.get('meta', key);
  return row?.value;
}

export async function setMeta(key: MetaKey, value: number): Promise<void> {
  const db = await getDb();
  await db.put('meta', { key, value });
}
