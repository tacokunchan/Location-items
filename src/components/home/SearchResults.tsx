import { Link } from 'react-router-dom';
import type { SearchResult } from '../../search/search';
import { locationPath } from '../../db/locationsRepo';
import { useAppData } from '../../hooks/AppDataContext';
import { PhotoThumb } from '../common/PhotoThumb';
import { FreshnessBadge } from '../common/FreshnessBadge';
import { ChevronRightIcon } from '../common/Icon';

export function SearchResults({ results }: { results: SearchResult[] }) {
  const { locations } = useAppData();

  return (
    <div className="flex flex-col gap-2">
      {results.map(({ item }) => {
        const path = locationPath(item.locationId, locations);
        return (
          <Link
            key={item.id}
            to={`/items/${item.id}`}
            className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800"
          >
            <PhotoThumb photoId={item.photoId} alt={item.name} fallbackLabel={item.name} className="h-16 w-16 shrink-0" />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate font-medium">{item.name}</p>
              <p className="flex flex-wrap items-center gap-1 truncate text-sm text-neutral-500">
                {path.map((loc, i) => (
                  <span key={loc.id} className="flex items-center gap-1">
                    {i > 0 && <ChevronRightIcon className="h-3 w-3" />}
                    {loc.name}
                  </span>
                ))}
              </p>
              <FreshnessBadge locationVerifiedAt={item.locationVerifiedAt} />
            </div>
            {item.status === 'out' && (
              <span className="shrink-0 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">
                持ち出し中
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
