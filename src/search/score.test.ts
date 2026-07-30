import { describe, expect, it } from 'vitest';
import { bigrams, diceCoefficient, fieldScore } from './score';

describe('bigrams', () => {
  it('splits into overlapping 2-grams', () => {
    expect(bigrams('いんかん')).toEqual(['いん', 'んか', 'かん']);
  });

  it('handles short strings', () => {
    expect(bigrams('a')).toEqual(['a']);
    expect(bigrams('')).toEqual([]);
  });
});

describe('diceCoefficient', () => {
  it('is 1 for identical strings', () => {
    expect(diceCoefficient('いんかん', 'いんかん')).toBe(1);
  });

  it('is 0 for completely different strings', () => {
    expect(diceCoefficient('あいう', 'かきく')).toBe(0);
  });

  it('tolerates minor typos', () => {
    const score = diceCoefficient('えんちょうこーど', 'えんちょおこーど');
    expect(score).toBeGreaterThan(0.5);
  });
});

describe('fieldScore', () => {
  it('scores exact match highest', () => {
    expect(fieldScore('はんこ', 'はんこ')).toBe(1);
  });

  it('scores substring matches above fuzzy-only matches', () => {
    const substring = fieldScore('はんこ', 'てもとのはんこいれ');
    const fuzzy = fieldScore('はんこ', 'ほんこ');
    expect(substring).toBeGreaterThan(fuzzy);
  });

  it('returns 0 for empty input', () => {
    expect(fieldScore('', 'はんこ')).toBe(0);
    expect(fieldScore('はんこ', '')).toBe(0);
  });
});
