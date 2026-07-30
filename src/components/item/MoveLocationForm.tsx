import { useState } from 'react';
import type { Item } from '../../types';
import { moveItem } from '../../db/itemsRepo';
import { LocationPicker } from './LocationPicker';

type MoveLocationFormProps = {
  item: Item;
  onDone: () => void | Promise<void>;
  onCancel: () => void;
};

// "別の場所にしまった": corrects the recorded location without touching
// take-out status, and refreshes locationVerifiedAt since a human just
// confirmed exactly where it is now.
export function MoveLocationForm({ item, onDone, onCancel }: MoveLocationFormProps) {
  const [locationId, setLocationId] = useState(item.locationId);
  const [locationDetail, setLocationDetail] = useState(item.locationDetail ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await moveItem(item.id, locationId, locationDetail.trim() || undefined);
      await onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-neutral-300 p-4 dark:border-neutral-700">
      <p className="text-sm font-medium">新しい場所</p>
      <LocationPicker value={locationId} onChange={setLocationId} />
      <input
        type="text"
        value={locationDetail}
        onChange={(e) => setLocationDetail(e.target.value)}
        placeholder="場所の詳細（任意）"
        className="min-h-11 w-full rounded-lg border border-neutral-300 px-3 py-2 text-base dark:border-neutral-700 dark:bg-neutral-900"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={!locationId || saving}
          className="min-h-11 flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-white disabled:opacity-50"
        >
          この場所に更新
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-11 rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
