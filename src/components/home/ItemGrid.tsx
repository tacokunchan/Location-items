import { Link } from 'react-router-dom';
import type { Item } from '../../types';
import { sortForBrowsing } from '../../utils/sortItems';
import { PhotoThumb } from '../common/PhotoThumb';

type ItemGridProps = {
  items: Item[];
};

// The "search failed, now find it by eye" fallback (設計思想 D) — every
// item must be visible here, so no pagination or infinite scroll.
export function ItemGrid({ items }: ItemGridProps) {
  const sorted = sortForBrowsing(items);

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-neutral-300 py-12 text-center text-neutral-500 dark:border-neutral-700">
        <p className="text-base font-medium">まだ何も登録されていません</p>
        <p className="text-sm">右下の「＋ 登録」から、大事なモノを登録しましょう。</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {sorted.map((item) => (
        <Link
          key={item.id}
          to={`/items/${item.id}`}
          className="relative flex flex-col items-center gap-1"
        >
          <PhotoThumb photoId={item.photoId} alt={item.name} fallbackLabel={item.name} className="aspect-square w-full" />
          {item.status === 'out' && (
            <span className="absolute left-1 top-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
              持ち出し中
            </span>
          )}
          <span className="line-clamp-1 w-full text-center text-xs text-neutral-600 dark:text-neutral-300">
            {item.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
