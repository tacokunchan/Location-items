import { useEffect, useRef, useState } from 'react';
import { resizeImageFile } from '../../image/resize';
import { CameraIcon, CloseIcon } from '../common/Icon';

type PhotoInputProps = {
  blob: Blob | undefined;
  onChange: (blob: Blob | undefined) => void;
};

// The caller always holds the current photo as a Blob — including the
// existing one, pre-loaded, when editing an item — so there's a single
// source of truth and no separate "removed vs. unchanged" state to track.
// Nothing is written to IndexedDB until the form is actually saved.
export function PhotoInput({ blob, onChange }: PhotoInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!blob) {
      setPreviewUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const resized = await resizeImageFile(file);
      onChange(resized);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700"
      >
        {previewUrl ? (
          <img src={previewUrl} alt="登録する写真" className="h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1 text-neutral-400">
            <CameraIcon className="h-6 w-6" />
            <span className="text-xs">{busy ? '処理中…' : '写真を追加'}</span>
          </span>
        )}
      </button>
      {previewUrl && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="flex min-h-11 items-center gap-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
        >
          <CloseIcon className="h-4 w-4" />
          写真を削除
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
