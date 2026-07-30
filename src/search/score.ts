// Bigram (character 2-gram) similarity, a la Dice's coefficient. Cheap,
// dependency-free, and tolerant of typos/word-order differences without
// needing a real morphological analyzer for a 30-item personal database.
export function bigrams(value: string): string[] {
  if (value.length < 2) return value.length === 1 ? [value] : [];
  const grams: string[] = [];
  for (let i = 0; i < value.length - 1; i++) grams.push(value.slice(i, i + 2));
  return grams;
}

export function diceCoefficient(a: string, b: string): number {
  if (a === b) return 1;
  const bigramsA = bigrams(a);
  const bigramsB = bigrams(b);
  if (bigramsA.length === 0 || bigramsB.length === 0) return 0;

  const remaining = new Map<string, number>();
  for (const gram of bigramsA) remaining.set(gram, (remaining.get(gram) ?? 0) + 1);

  let intersection = 0;
  for (const gram of bigramsB) {
    const count = remaining.get(gram) ?? 0;
    if (count > 0) {
      intersection += 1;
      remaining.set(gram, count - 1);
    }
  }
  return (2 * intersection) / (bigramsA.length + bigramsB.length);
}

// Substring hits are a much stronger signal than fuzzy overlap, so they're
// scored above the fuzzy ceiling rather than blended with it.
export function fieldScore(normalizedQuery: string, normalizedTarget: string): number {
  if (!normalizedQuery || !normalizedTarget) return 0;
  if (normalizedTarget === normalizedQuery) return 1;
  if (normalizedTarget.includes(normalizedQuery)) return 0.9;
  return diceCoefficient(normalizedQuery, normalizedTarget) * 0.85;
}
