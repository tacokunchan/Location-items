import { describe, expect, it } from 'vitest';
import { searchItems } from './search';
import type { Item, Location } from '../types';

function makeItem(overrides: Partial<Item>): Item {
  const now = Date.now();
  return {
    id: 'item-1',
    name: '印鑑',
    aliases: [],
    locationId: 'loc-1',
    tags: [],
    status: 'stored',
    locationVerifiedAt: now,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

const locations: Location[] = [{ id: 'loc-1', name: '寝室クローゼット', createdAt: Date.now() }];

describe('searchItems', () => {
  const inkan = makeItem({ aliases: ['はんこ', 'いんかん'] });

  it.each(['はんこ', 'インカン', 'いんかん', '印鑑'])(
    'finds the item registered as "印鑑" when searching "%s"',
    (query) => {
      const results = searchItems([inkan], locations, query);
      expect(results.map((r) => r.item.id)).toContain('item-1');
    },
  );

  it('returns no results for an empty query', () => {
    expect(searchItems([inkan], locations, '')).toEqual([]);
  });

  it('returns no results when nothing matches', () => {
    expect(searchItems([inkan], locations, '延長コード')).toEqual([]);
  });

  it('matches on location name and locationDetail', () => {
    const item = makeItem({ name: 'パスポート', locationDetail: '青いファイルの中' });
    expect(searchItems([item], locations, '青いファイル').length).toBe(1);
    expect(searchItems([item], locations, 'クローゼット').length).toBe(1);
  });

  it('ranks exact name matches above fuzzy tag matches', () => {
    const exact = makeItem({ id: 'exact', name: '延長コード' });
    const fuzzy = makeItem({ id: 'fuzzy', name: '別のもの', tags: ['えんちょうこーど'] });
    const results = searchItems([fuzzy, exact], locations, '延長コード');
    expect(results[0].item.id).toBe('exact');
  });
});
