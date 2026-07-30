export type FreshnessLevel = 'fresh' | 'aging' | 'stale';

export type Freshness = {
  level: FreshnessLevel;
  label: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const THREE_MONTHS_DAYS = 90;
const ONE_YEAR_DAYS = 365;

// The app must never claim certainty about where something is — only how
// long it's been since a human last confirmed it. That honesty is the whole
// point of this screen (see design principle B).
export function freshnessOf(locationVerifiedAt: number, now: number = Date.now()): Freshness {
  const days = Math.max(0, Math.floor((now - locationVerifiedAt) / DAY_MS));

  if (days <= THREE_MONTHS_DAYS) {
    return { level: 'fresh', label: '最近確認済み' };
  }
  if (days < ONE_YEAR_DAYS) {
    const months = Math.max(1, Math.round(days / 30));
    return { level: 'aging', label: `${months}ヶ月前の情報です` };
  }
  return {
    level: 'stale',
    label: '1年以上前の情報です。場所が変わっている可能性があります',
  };
}

export function daysSince(timestamp: number, now: number = Date.now()): number {
  return Math.floor((now - timestamp) / DAY_MS);
}
