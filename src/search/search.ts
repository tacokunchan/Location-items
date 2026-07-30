import type { Item, Location } from '../types';
import { normalize } from './normalize';
import { fieldScore } from './score';

export type SearchResult = {
  item: Item;
  score: number;
};

// Below this, a fuzzy overlap is more likely coincidence than intent.
const MATCH_THRESHOLD = 0.3;

type Field = { value: string | undefined; weight: number };

// Every field a person might remember the item by, weighted by how
// deliberately it identifies the item (exact name > alias > tag > free text).
function fieldsOf(item: Item, locationName: string | undefined): Field[] {
  return [
    { value: item.name, weight: 1 },
    ...item.aliases.map((alias) => ({ value: alias, weight: 0.95 })),
    ...item.tags.map((tag) => ({ value: tag, weight: 0.7 })),
    { value: item.locationDetail, weight: 0.6 },
    { value: locationName, weight: 0.6 },
    { value: item.note, weight: 0.5 },
  ];
}

export function searchItems(
  items: Item[],
  locations: Location[],
  rawQuery: string,
): SearchResult[] {
  const query = normalize(rawQuery);
  if (!query) return [];

  const locationNameById = new Map(locations.map((l) => [l.id, l.name]));

  const results: SearchResult[] = [];
  for (const item of items) {
    let best = 0;
    for (const field of fieldsOf(item, locationNameById.get(item.locationId))) {
      if (!field.value) continue;
      const score = fieldScore(query, normalize(field.value)) * field.weight;
      if (score > best) best = score;
    }
    if (best >= MATCH_THRESHOLD) results.push({ item, score: best });
  }

  return results.sort((a, b) => b.score - a.score);
}
