import { describe, expect, it } from 'vitest';
import { pickQuizItem } from './quiz';
import type { Item } from '../types';

function makeItem(overrides: Partial<Item>): Item {
  const now = Date.now();
  return {
    id: 'id',
    name: 'item',
    aliases: [],
    locationId: 'loc',
    tags: [],
    status: 'stored',
    locationVerifiedAt: now,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('pickQuizItem', () => {
  it('returns undefined when there are no stored items', () => {
    const out = makeItem({ id: 'out', status: 'out' });
    expect(pickQuizItem([out])).toBeUndefined();
    expect(pickQuizItem([])).toBeUndefined();
  });

  it('never picks an item that is currently taken out', () => {
    const stored = makeItem({ id: 'stored' });
    const out = makeItem({ id: 'out', status: 'out' });
    for (let i = 0; i < 20; i++) {
      expect(pickQuizItem([stored, out], Math.random)?.id).toBe('stored');
    }
  });

  it('favors the item with the oldest locationVerifiedAt', () => {
    const stale = makeItem({ id: 'stale', locationVerifiedAt: 0 });
    const fresh = makeItem({ id: 'fresh', locationVerifiedAt: Date.now() });
    // Fixed "random" value near 0 should land on the highest-weighted (oldest) entry.
    expect(pickQuizItem([fresh, stale], () => 0)?.id).toBe('stale');
  });
});
