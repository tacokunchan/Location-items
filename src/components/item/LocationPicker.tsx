import { useState } from 'react';
import { useAppData } from '../../hooks/AppDataContext';
import { createLocation, flattenLocationTree } from '../../db/locationsRepo';
import { PlusIcon } from '../common/Icon';

type LocationPickerProps = {
  value: string;
  onChange: (locationId: string) => void;
};

// Inline "add a new location" so registering an item never has to detour
// through a separate screen (spec 6-4: don't interrupt the registration flow).
export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const { locations, refresh } = useAppData();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newParentId, setNewParentId] = useState('');
  const [saving, setSaving] = useState(false);

  const flat = flattenLocationTree(locations);

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    setSaving(true);
    try {
      const created = await createLocation({
        name,
        parentId: newParentId || undefined,
      });
      await refresh();
      onChange(created.id);
      setCreating(false);
      setNewName('');
      setNewParentId('');
    } finally {
      setSaving(false);
    }
  }

  if (creating) {
    return (
      <div className="space-y-2 rounded-xl border border-neutral-300 p-3 dark:border-neutral-700">
        <input
          autoFocus
          type="text"
          placeholder="場所の名前（例: 寝室クローゼット 上段）"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full min-h-11 rounded-lg border border-neutral-300 px-3 py-2 text-base dark:border-neutral-700 dark:bg-neutral-900"
        />
        {flat.length > 0 && (
          <select
            value={newParentId}
            onChange={(e) => setNewParentId(e.target.value)}
            className="w-full min-h-11 rounded-lg border border-neutral-300 px-3 py-2 text-base dark:border-neutral-700 dark:bg-neutral-900"
          >
            <option value="">（親なし・独立した場所）</option>
            {flat.map(({ location, depth }) => (
              <option key={location.id} value={location.id}>
                {'　'.repeat(depth)}
                {location.name}
              </option>
            ))}
          </select>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCreate}
            disabled={!newName.trim() || saving}
            className="min-h-11 flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-white disabled:opacity-50"
          >
            この場所を追加
          </button>
          <button
            type="button"
            onClick={() => setCreating(false)}
            className="min-h-11 rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700"
          >
            キャンセル
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-11 w-full flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-base dark:border-neutral-700 dark:bg-neutral-900"
      >
        <option value="" disabled>
          場所を選択
        </option>
        {flat.map(({ location, depth }) => (
          <option key={location.id} value={location.id}>
            {'　'.repeat(depth)}
            {location.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => setCreating(true)}
        aria-label="新しい場所を追加"
        className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-neutral-300 dark:border-neutral-700"
      >
        <PlusIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
