import { Link } from 'react-router-dom';
import type { Item } from '../../types';
import { markReturned } from '../../db/itemsRepo';
import { daysSince } from '../../utils/freshness';
import { WarningIcon } from '../common/Icon';

const STALE_OUT_DAYS = 3;

type StaleOutWarningProps = {
  items: Item[];
  onChanged: () => void | Promise<void>;
};

// "一度でも裏切ったら終わり" (設計思想 B): an item left "out" and forgotten
// is exactly the situation that makes the whole database untrustworthy, so
// it gets a persistent, hard-to-miss card until resolved.
export function StaleOutWarning({ items, onChanged }: StaleOutWarningProps) {
  const staleItems = items.filter(
    (item) => item.status === 'out' && item.takenOutAt !== undefined && daysSince(item.takenOutAt) >= STALE_OUT_DAYS,
  );

  if (staleItems.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {staleItems.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 rounded-xl bg-amber-100 px-4 py-3 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200"
        >
          <WarningIcon className="h-5 w-5 shrink-0" />
          <Link to={`/items/${item.id}`} className="min-w-0 flex-1 text-sm">
            <span className="font-medium">{item.name}</span>
            、まだ出したままです（{daysSince(item.takenOutAt!)}日経過）
          </Link>
          <button
            type="button"
            onClick={async () => {
              await markReturned(item.id);
              await onChanged();
            }}
            className="min-h-9 shrink-0 rounded-lg bg-white px-3 text-sm font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200"
          >
            戻した
          </button>
        </div>
      ))}
    </div>
  );
}
