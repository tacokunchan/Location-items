import { useNavigate } from 'react-router-dom';
import { PlusIcon, ListIcon } from '../common/Icon';

type EmptySearchStateProps = {
  query: string;
  onBrowsePhotos: () => void;
};

// The three-pronged fallback from 設計思想 D: fuzzy search already ran and
// missed, so offer to register the thing right now, or fall back to
// browsing the photo grid by eye.
export function EmptySearchState({ query, onBrowsePhotos }: EmptySearchStateProps) {
  const navigate = useNavigate();
  const params = new URLSearchParams({ name: query, logQuery: query });

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-neutral-300 py-10 text-center dark:border-neutral-700">
      <p className="text-base font-medium">「{query}」は見つかりませんでした</p>
      <div className="flex w-full max-w-xs flex-col gap-2 px-4">
        <button
          type="button"
          onClick={() => navigate(`/items/new?${params.toString()}`)}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 text-base font-semibold text-white"
        >
          <PlusIcon className="h-5 w-5" />
          このモノを今すぐ登録する
        </button>
        <button
          type="button"
          onClick={onBrowsePhotos}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-neutral-300 text-sm font-medium dark:border-neutral-700"
        >
          <ListIcon className="h-4 w-4" />
          写真一覧から探す
        </button>
      </div>
    </div>
  );
}
