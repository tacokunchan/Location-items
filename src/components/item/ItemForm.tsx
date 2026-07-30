import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppData } from '../../hooks/AppDataContext';
import { createItem, updateItem } from '../../db/itemsRepo';
import { savePhoto, getPhoto, deletePhoto } from '../../db/photosRepo';
import { resolveLogsForQuery } from '../../db/searchLogsRepo';
import type { Item } from '../../types';
import { LocationPicker } from './LocationPicker';
import { PhotoInput } from './PhotoInput';
import { ChipsInput } from '../common/ChipsInput';

type ItemFormProps = {
  existingItem?: Item;
};

// One screen for both create and edit: the required fields (name, location)
// are always visible; everything else starts collapsed for new items so
// registration cost stays low (設計思想 C), but stays expanded when editing
// an item that may already have that detail filled in.
export function ItemForm({ existingItem }: ItemFormProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refresh } = useAppData();

  const prefillName = searchParams.get('name') ?? '';
  const sourceLogQuery = searchParams.get('logQuery') ?? '';

  const [name, setName] = useState(existingItem?.name ?? prefillName);
  const [locationId, setLocationId] = useState(existingItem?.locationId ?? '');
  const [locationDetail, setLocationDetail] = useState(existingItem?.locationDetail ?? '');
  const [aliases, setAliases] = useState<string[]>(existingItem?.aliases ?? []);
  const [tags, setTags] = useState<string[]>(existingItem?.tags ?? []);
  const [note, setNote] = useState(existingItem?.note ?? '');
  const [photoBlob, setPhotoBlob] = useState<Blob | undefined>(undefined);
  const [expanded, setExpanded] = useState(Boolean(existingItem));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingItem?.photoId) {
      getPhoto(existingItem.photoId).then((photo) => {
        if (photo) setPhotoBlob(photo.blob);
      });
    }
  }, [existingItem?.photoId]);

  const canSave = name.trim().length > 0 && locationId.length > 0 && !saving;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);
    try {
      let photoId = existingItem?.photoId;
      if (photoBlob) {
        photoId = await savePhoto(photoBlob);
        if (existingItem?.photoId && existingItem.photoId !== photoId) {
          await deletePhoto(existingItem.photoId);
        }
      } else if (existingItem?.photoId) {
        await deletePhoto(existingItem.photoId);
        photoId = undefined;
      }

      const payload = {
        name: name.trim(),
        aliases,
        locationId,
        locationDetail: locationDetail.trim() || undefined,
        photoId,
        note: note.trim() || undefined,
        tags,
      };

      const saved = existingItem
        ? await updateItem(existingItem.id, payload)
        : await createItem(payload);

      if (sourceLogQuery) await resolveLogsForQuery(sourceLogQuery);
      await refresh();
      navigate(`/items/${saved.id}`, { replace: true });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-28">
      <div className="space-y-1.5">
        <label htmlFor="item-name" className="text-sm font-medium">
          名前 <span className="text-red-500">*</span>
        </label>
        <input
          id="item-name"
          autoFocus={!existingItem}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: パスポート"
          className="min-h-11 w-full rounded-lg border border-neutral-300 px-3 py-2 text-base dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          場所 <span className="text-red-500">*</span>
        </label>
        <LocationPicker value={locationId} onChange={setLocationId} />
      </div>

      {!expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="min-h-11 self-start text-sm font-medium text-indigo-600 dark:text-indigo-400"
        >
          詳しく入力する（写真・別名・タグなど）
        </button>
      )}

      {expanded && (
        <>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">写真</label>
            <PhotoInput blob={photoBlob} onChange={setPhotoBlob} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="item-location-detail" className="text-sm font-medium">
              場所の詳細
            </label>
            <input
              id="item-location-detail"
              type="text"
              value={locationDetail}
              onChange={(e) => setLocationDetail(e.target.value)}
              placeholder="例: 一番上の段の奥、青いファイル内"
              className="min-h-11 w-full rounded-lg border border-neutral-300 px-3 py-2 text-base dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">別名</label>
            <ChipsInput values={aliases} onChange={setAliases} placeholder="例: はんこ（Enterで追加）" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">タグ</label>
            <ChipsInput values={tags} onChange={setTags} placeholder="例: 重要書類（Enterで追加）" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="item-note" className="text-sm font-medium">
              メモ
            </label>
            <textarea
              id="item-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-base dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
        </>
      )}

      <div className="fixed inset-x-0 bottom-0 border-t border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mx-auto max-w-lg">
          <button
            type="submit"
            disabled={!canSave}
            className="min-h-12 w-full rounded-xl bg-indigo-600 text-base font-semibold text-white disabled:opacity-40"
          >
            {saving ? '保存中…' : '保存する'}
          </button>
        </div>
      </div>
    </form>
  );
}
