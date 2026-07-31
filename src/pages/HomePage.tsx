import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../hooks/AppDataContext';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { searchItems } from '../search/search';
import { logSearch } from '../db/searchLogsRepo';
import { SearchBox } from '../components/home/SearchBox';
import { StaleOutWarning } from '../components/home/StaleOutWarning';
import { BackupBanner } from '../components/home/BackupBanner';
import { ItemGrid } from '../components/home/ItemGrid';
import { SearchResults } from '../components/home/SearchResults';
import { EmptySearchState } from '../components/home/EmptySearchState';
import { Fab } from '../components/home/Fab';
import { SettingsIcon, ListIcon, HelpCircleIcon } from '../components/common/Icon';

export function HomePage() {
  const { items, locations, lastExportAt, refresh } = useAppData();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 150);

  const trimmedQuery = debouncedQuery.trim();
  const results = useMemo(
    () => (trimmedQuery ? searchItems(items, locations, trimmedQuery) : []),
    [items, locations, trimmedQuery],
  );

  // Every miss becomes a candidate for "モノを登録すべき優先リスト" (設計思想 E).
  useEffect(() => {
    if (!trimmedQuery) return;
    if (results.length === 0) {
      logSearch(trimmedQuery, 0).then(refresh);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimmedQuery]);

  const isSearching = trimmedQuery.length > 0;

  return (
    <div className="p-4 pb-28">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">モノの場所</h1>
        <div className="flex items-center gap-1">
          <Link to="/quiz" aria-label="思い出しクイズ" className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-500">
            <HelpCircleIcon className="h-5 w-5" />
          </Link>
          <Link to="/wanted" aria-label="探しものログ" className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-500">
            <ListIcon className="h-5 w-5" />
          </Link>
          <Link to="/settings" aria-label="設定" className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-500">
            <SettingsIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>

      <div className="mb-4">
        <SearchBox value={query} onChange={setQuery} />
      </div>

      {!isSearching && (
        <div className="mb-4 flex flex-col gap-2">
          <StaleOutWarning items={items} onChanged={refresh} />
          <BackupBanner lastExportAt={lastExportAt} />
        </div>
      )}

      {isSearching ? (
        results.length > 0 ? (
          <SearchResults results={results} />
        ) : (
          <EmptySearchState query={trimmedQuery} onBrowsePhotos={() => setQuery('')} />
        )
      ) : (
        <ItemGrid items={items} />
      )}

      <Fab />
    </div>
  );
}
