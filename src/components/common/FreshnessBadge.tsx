import { freshnessOf } from '../../utils/freshness';

const STYLES: Record<string, string> = {
  fresh: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  aging: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  stale: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

export function FreshnessBadge({ locationVerifiedAt }: { locationVerifiedAt: number }) {
  const freshness = freshnessOf(locationVerifiedAt);
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[freshness.level]}`}
    >
      {freshness.label}
    </span>
  );
}
