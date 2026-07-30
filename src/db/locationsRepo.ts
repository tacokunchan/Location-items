import { v4 as uuid } from 'uuid';
import { getDb } from './schema';
import type { Location } from '../types';

export type NewLocationInput = {
  name: string;
  parentId?: string;
  photoId?: string;
};

export async function listLocations(): Promise<Location[]> {
  const db = await getDb();
  return db.getAll('locations');
}

export async function getLocation(id: string): Promise<Location | undefined> {
  const db = await getDb();
  return db.get('locations', id);
}

export async function createLocation(input: NewLocationInput): Promise<Location> {
  const db = await getDb();
  const location: Location = {
    id: uuid(),
    name: input.name,
    parentId: input.parentId,
    photoId: input.photoId,
    createdAt: Date.now(),
  };
  await db.put('locations', location);
  return location;
}

export async function updateLocation(id: string, patch: Partial<Location>): Promise<Location> {
  const db = await getDb();
  const existing = await db.get('locations', id);
  if (!existing) throw new Error(`Location not found: ${id}`);
  const updated: Location = { ...existing, ...patch, id };
  await db.put('locations', updated);
  return updated;
}

export async function deleteLocation(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('locations', id);
}

// Depth-first flattening for a select dropdown: roots first, each followed
// immediately by its descendants, with depth for indentation.
export function flattenLocationTree(
  locations: Location[],
): { location: Location; depth: number }[] {
  const byParent = new Map<string | undefined, Location[]>();
  for (const loc of locations) {
    const key = loc.parentId;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(loc);
  }
  for (const group of byParent.values()) group.sort((a, b) => a.createdAt - b.createdAt);

  const result: { location: Location; depth: number }[] = [];
  const visit = (parentId: string | undefined, depth: number) => {
    for (const loc of byParent.get(parentId) ?? []) {
      result.push({ location: loc, depth });
      visit(loc.id, depth + 1);
    }
  };
  visit(undefined, 0);
  return result;
}

// Builds "寝室 > クローゼット > 上段" from the root ancestor down to the leaf.
export function locationPath(locationId: string, locations: Location[]): Location[] {
  const byId = new Map(locations.map((l) => [l.id, l]));
  const path: Location[] = [];
  let current = byId.get(locationId);
  const visited = new Set<string>();
  while (current && !visited.has(current.id)) {
    path.unshift(current);
    visited.add(current.id);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return path;
}
