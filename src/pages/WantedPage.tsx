import { useNavigate } from 'react-router-dom';
import { useAppData } from '../hooks/AppDataContext';
import { deleteLogsForQuery } from '../db/searchLogsRepo';
import { groupUnresolvedMisses } from '../utils/wantedList';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { PlusIcon, CloseIcon } from '../components/common/Icon';

// 探しものログ: builds the "should register next" priority list purely from
// searches that came up empty (設計思想 E) — this is what makes the app
// useful even from an empty database.
export function WantedPage() {
  const { searchLogs, refresh } = useAppData();
  const navigate = useNavigate();
  const groups = groupUnresolvedMisses(searchLogs);

  async function handleDismiss(query: string) {
    await deleteLogsForQuery(query);
    await refresh();
  }

  return (
    <div className="p-4">
      <ScreenHeader title="探しものログ" back />

      {groups.length === 0 ? (
        <p className="py-10 text-center text-neutral-500">
          まだ空振りした検索はありません。
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {groups.map((group) => (
            <div
              key={group.query}
              className="flex items-center gap-2 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800"
            >
              <p className="min-w-0 flex-1 text-sm">
                「<span className="font-medium">{group.query}</span>」を{group.count}回探しています
              </p>
              <button
                type="button"
                onClick={() => {
                  const params = new URLSearchParams({ name: group.query, logQuery: group.query });
                  navigate(`/items/new?${params.toString()}`);
                }}
                className="flex min-h-9 shrink-0 items-center gap-1 rounded-lg bg-indigo-600 px-3 text-sm font-medium text-white"
              >
                <PlusIcon className="h-4 w-4" />
                登録する
              </button>
              <button
                type="button"
                aria-label={`「${group.query}」のログを消す`}
                onClick={() => handleDismiss(group.query)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-400"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
