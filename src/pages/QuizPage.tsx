import { useEffect, useState } from 'react';
import { useAppData } from '../hooks/AppDataContext';
import { pickQuizItem } from '../utils/quiz';
import { confirmLocation } from '../db/itemsRepo';
import { locationPath } from '../db/locationsRepo';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { PhotoThumb } from '../components/common/PhotoThumb';
import { FreshnessBadge } from '../components/common/FreshnessBadge';
import { MoveLocationForm } from '../components/item/MoveLocationForm';
import { ChevronRightIcon } from '../components/common/Icon';
import type { Item } from '../types';

type Phase = 'ask' | 'reveal';

// A lightweight game built entirely on data the app already has: pick an
// item, ask "do you remember where this is?", then reveal the recorded
// location and let the user confirm or correct it. Every round either
// refreshes locationVerifiedAt or catches a place that changed — the exact
// maintenance loop 設計思想 B depends on, just made worth doing on purpose.
export function QuizPage() {
  const { items, locations, loading, refresh } = useAppData();
  const [currentItem, setCurrentItem] = useState<Item | undefined>(undefined);
  const [initialized, setInitialized] = useState(false);
  const [phase, setPhase] = useState<Phase>('ask');
  const [knew, setKnew] = useState<boolean | null>(null);
  const [moving, setMoving] = useState(false);
  const [justConfirmed, setJustConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !initialized) {
      setCurrentItem(pickQuizItem(items));
      setInitialized(true);
    }
  }, [loading, initialized, items]);

  function nextQuestion() {
    setCurrentItem(pickQuizItem(items));
    setPhase('ask');
    setKnew(null);
    setMoving(false);
    setJustConfirmed(false);
  }

  async function handleStillThere() {
    if (!currentItem) return;
    setBusy(true);
    try {
      await confirmLocation(currentItem.id);
      await refresh();
      setJustConfirmed(true);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return null;

  if (!currentItem) {
    return (
      <div className="p-4">
        <ScreenHeader title="思い出しクイズ" back />
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-neutral-300 py-12 text-center dark:border-neutral-700">
          <p className="text-base font-medium">クイズに出せるモノがありません</p>
          <p className="px-6 text-sm text-neutral-500">
            まずは大事なモノをいくつか登録すると、思い出しクイズで遊べるようになります。
          </p>
        </div>
      </div>
    );
  }

  // Re-read from the live list so a just-applied confirm/move is reflected.
  const liveItem = items.find((i) => i.id === currentItem.id) ?? currentItem;
  const path = locationPath(liveItem.locationId, locations);
  const location = path[path.length - 1];

  return (
    <div className="p-4 pb-10">
      <ScreenHeader title="思い出しクイズ" back />

      <PhotoThumb
        photoId={liveItem.photoId}
        alt={liveItem.name}
        fallbackLabel={liveItem.name}
        className="mb-4 h-56 w-full"
      />
      <p className="mb-6 text-center text-xl font-semibold">{liveItem.name}</p>

      {phase === 'ask' && (
        <div className="space-y-3">
          <p className="text-center text-sm text-neutral-500">この場所を思い出せますか？</p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setKnew(true);
                setPhase('reveal');
              }}
              className="min-h-12 rounded-xl bg-indigo-600 text-base font-semibold text-white"
            >
              思い出せた
            </button>
            <button
              type="button"
              onClick={() => {
                setKnew(false);
                setPhase('reveal');
              }}
              className="min-h-11 rounded-xl border border-neutral-300 text-sm font-medium dark:border-neutral-700"
            >
              わからない
            </button>
          </div>
        </div>
      )}

      {phase === 'reveal' && (
        <div className="space-y-4">
          {knew !== null && (
            <p className="text-center text-sm text-neutral-500">
              {knew ? 'さすがです。答え合わせをしましょう。' : '正解はこちらです。次はきっと思い出せます。'}
            </p>
          )}

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1 text-sm text-neutral-600 dark:text-neutral-300">
              {path.map((loc, i) => (
                <span key={loc.id} className="flex items-center gap-1">
                  {i > 0 && <ChevronRightIcon className="h-3.5 w-3.5" />}
                  {loc.name}
                </span>
              ))}
            </div>
            {liveItem.locationDetail && <p className="text-base">{liveItem.locationDetail}</p>}
          </div>

          {location?.photoId && (
            <PhotoThumb photoId={location.photoId} alt={`${location.name}の写真`} className="h-40 w-full" />
          )}

          <FreshnessBadge locationVerifiedAt={liveItem.locationVerifiedAt} />

          {moving ? (
            <MoveLocationForm
              item={liveItem}
              onCancel={() => setMoving(false)}
              onDone={async () => {
                await refresh();
                setMoving(false);
                setJustConfirmed(true);
              }}
            />
          ) : justConfirmed ? (
            <div className="space-y-3 rounded-xl bg-emerald-50 p-4 text-center dark:bg-emerald-950/40">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                記録を更新しました。
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={nextQuestion}
                  className="min-h-11 flex-1 rounded-lg bg-indigo-600 text-sm font-semibold text-white"
                >
                  次の問題
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-center text-sm text-neutral-500">今もこの場所にありますか？</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleStillThere}
                  className="min-h-11 flex-1 rounded-xl bg-indigo-600 text-sm font-semibold text-white disabled:opacity-50"
                >
                  はい、ここにありました
                </button>
                <button
                  type="button"
                  onClick={() => setMoving(true)}
                  className="min-h-11 flex-1 rounded-xl border border-neutral-300 text-sm font-medium dark:border-neutral-700"
                >
                  いいえ、場所が変わった
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!justConfirmed && (
        <button
          type="button"
          onClick={nextQuestion}
          className="mt-8 block min-h-11 w-full text-center text-sm text-neutral-400"
        >
          この問題をスキップ
        </button>
      )}
    </div>
  );
}

