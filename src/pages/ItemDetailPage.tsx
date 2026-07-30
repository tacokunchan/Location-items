import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAppData } from '../hooks/AppDataContext';
import { locationPath } from '../db/locationsRepo';
import { markTakenOut, markReturned, confirmLocation, deleteItem } from '../db/itemsRepo';
import { deletePhoto } from '../db/photosRepo';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { PhotoThumb } from '../components/common/PhotoThumb';
import { FreshnessBadge } from '../components/common/FreshnessBadge';
import { MoveLocationForm } from '../components/item/MoveLocationForm';
import { ChevronRightIcon, ClockIcon } from '../components/common/Icon';
import { daysSince } from '../utils/freshness';

export function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items, locations, refresh } = useAppData();
  const [moving, setMoving] = useState(false);
  const [busy, setBusy] = useState(false);

  const item = items.find((i) => i.id === id);

  if (!item) {
    return (
      <div className="p-4">
        <ScreenHeader title="見つかりません" back />
        <p className="text-neutral-500">このアイテムは削除された可能性があります。</p>
      </div>
    );
  }

  const path = locationPath(item.locationId, locations);
  const location = path[path.length - 1];

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    try {
      await action();
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!item) return;
    if (!confirm(`「${item.name}」を削除します。よろしいですか？`)) return;
    await run(async () => {
      if (item.photoId) await deletePhoto(item.photoId);
      await deleteItem(item.id);
    });
    navigate('/', { replace: true });
  }

  return (
    <div className="p-4 pb-10">
      <ScreenHeader title={item.name} back action={<Link to={`/items/${item.id}/edit`} className="min-h-11 flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400">編集</Link>} />

      <PhotoThumb
        photoId={item.photoId}
        alt={item.name}
        fallbackLabel={item.name}
        className="mb-4 h-64 w-full"
      />

      {item.status === 'out' && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-100 px-4 py-3 text-sm text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
          <ClockIcon className="h-5 w-5 shrink-0" />
          <span>
            持ち出し中です
            {item.takenOutAt !== undefined && `（${daysSince(item.takenOutAt)}日経過）`}
          </span>
        </div>
      )}

      <div className="mb-4 space-y-1">
        <div className="flex flex-wrap items-center gap-1 text-sm text-neutral-600 dark:text-neutral-300">
          {path.map((loc, i) => (
            <span key={loc.id} className="flex items-center gap-1">
              {i > 0 && <ChevronRightIcon className="h-3.5 w-3.5" />}
              {loc.name}
            </span>
          ))}
        </div>
        {item.locationDetail && <p className="text-base">{item.locationDetail}</p>}
      </div>

      {location?.photoId && (
        <div className="mb-4">
          <p className="mb-1 text-sm font-medium text-neutral-500">場所の写真</p>
          <PhotoThumb photoId={location.photoId} alt={`${location.name}の写真`} className="h-48 w-full" />
        </div>
      )}

      <div className="mb-6">
        <FreshnessBadge locationVerifiedAt={item.locationVerifiedAt} />
      </div>

      <div className="mb-4 flex flex-col gap-2">
        {item.status === 'stored' ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => markTakenOut(item.id))}
            className="min-h-12 rounded-xl bg-indigo-600 text-base font-semibold text-white disabled:opacity-50"
          >
            取り出した
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => markReturned(item.id))}
            className="min-h-12 rounded-xl bg-indigo-600 text-base font-semibold text-white disabled:opacity-50"
          >
            戻した
          </button>
        )}

        {item.status === 'stored' && (
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => confirmLocation(item.id))}
            className="min-h-11 rounded-xl border border-neutral-300 text-sm font-medium dark:border-neutral-700"
          >
            ここにあった（確認のみ）
          </button>
        )}
      </div>

      {moving ? (
        <MoveLocationForm
          item={item}
          onCancel={() => setMoving(false)}
          onDone={async () => {
            await refresh();
            setMoving(false);
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setMoving(true)}
          className="block min-h-11 text-left text-sm font-medium text-indigo-600 dark:text-indigo-400"
        >
          別の場所にしまった
        </button>
      )}

      {item.tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-neutral-100 px-3 py-1 text-xs dark:bg-neutral-800">
              {tag}
            </span>
          ))}
        </div>
      )}

      {item.note && <p className="mt-4 whitespace-pre-wrap text-sm text-neutral-600 dark:text-neutral-300">{item.note}</p>}

      <button
        type="button"
        onClick={handleDelete}
        className="block mt-10 min-h-11 text-left text-sm text-red-600 dark:text-red-400"
      >
        このアイテムを削除
      </button>
    </div>
  );
}
