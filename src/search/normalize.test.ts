import { describe, expect, it } from 'vitest';
import { normalize } from './normalize';

describe('normalize', () => {
  it('folds katakana to hiragana', () => {
    expect(normalize('インカン')).toBe(normalize('いんかん'));
  });

  it('folds full-width alphanumerics to half-width', () => {
    expect(normalize('ＡＢＣ１２３')).toBe('abc123');
  });

  it('lowercases and trims whitespace', () => {
    expect(normalize('  Passport  ')).toBe('passport');
    expect(normalize('延長 コード')).toBe('延長こーど');
  });

  it('is idempotent for already-normalized strings', () => {
    expect(normalize('いんかん')).toBe('いんかん');
  });
});
