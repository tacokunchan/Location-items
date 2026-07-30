import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../hooks/AppDataContext';
import { exportData, importData, clearAllData, estimateStorageUsage, type BackupFile } from '../db/backup';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { DownloadIcon, UploadIcon, TrashIcon } from '../components/common/Icon';

function formatMB(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('ja-JP');
}

export function SettingsPage() {
  const { lastExportAt, refresh } = useAppData();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [storage, setStorage] = useState<{ usage: number; quota: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [deleteArmed, setDeleteArmed] = useState(false);

  useEffect(() => {
    estimateStorageUsage().then(setStorage);
  }, [lastExportAt]);

  async function handleExport() {
    setBusy(true);
    setMessage(null);
    try {
      const backup = await exportData();
      const json = JSON.stringify(backup);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `mono-no-basho-backup-${date}.json`;
      a.click();
      URL.revokeObjectURL(url);
      await refresh();
      setMessage('エクスポートしました。');
    } finally {
      setBusy(false);
    }
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const text = await file.text();
    let parsed: BackupFile;
    try {
      parsed = JSON.parse(text);
    } catch {
      setMessage('このファイルは読み込めませんでした（JSON として不正です）。');
      return;
    }
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.items)) {
      setMessage('このファイルはバックアップ形式ではないようです。');
      return;
    }

    const confirmed = confirm(
      '現在のデータをすべて置き換えて、このバックアップから復元します。よろしいですか？',
    );
    if (!confirmed) return;

    setBusy(true);
    setMessage(null);
    try {
      await importData(parsed);
      await refresh();
      setMessage('復元しました。');
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteAll() {
    setBusy(true);
    try {
      await clearAllData();
      await refresh();
      setDeleteArmed(false);
      navigate('/', { replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-4 pb-10">
      <ScreenHeader title="設定" back />

      <section className="mb-6 space-y-3">
        <h2 className="text-sm font-semibold text-neutral-500">バックアップ</h2>
        <p className="text-sm">
          最終エクスポート:{' '}
          {lastExportAt ? formatDateTime(lastExportAt) : 'まだエクスポートしていません'}
        </p>
        <button
          type="button"
          onClick={handleExport}
          disabled={busy}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-base font-semibold text-white disabled:opacity-50"
        >
          <DownloadIcon className="h-5 w-5" />
          JSON をエクスポート
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-neutral-300 text-base font-medium disabled:opacity-50 dark:border-neutral-700"
        >
          <UploadIcon className="h-5 w-5" />
          JSON からインポート（復元）
        </button>
        <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImportFile} className="hidden" />
        {message && <p className="text-sm text-neutral-500">{message}</p>}
      </section>

      {storage && (
        <section className="mb-6 space-y-1">
          <h2 className="text-sm font-semibold text-neutral-500">ストレージ使用量の目安</h2>
          <p className="text-sm">
            {formatMB(storage.usage)} / {formatMB(storage.quota)} 使用中
          </p>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-500">危険な操作</h2>
        {!deleteArmed ? (
          <button
            type="button"
            onClick={() => setDeleteArmed(true)}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-300 text-base font-medium text-red-600 dark:border-red-900 dark:text-red-400"
          >
            <TrashIcon className="h-5 w-5" />
            全データを削除
          </button>
        ) : (
          <div className="space-y-2 rounded-xl border border-red-300 p-4 dark:border-red-900">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              この操作は取り消せません。すべてのモノ・場所・写真・ログが削除されます。
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDeleteAll}
                disabled={busy}
                className="min-h-11 flex-1 rounded-lg bg-red-600 text-sm font-semibold text-white disabled:opacity-50"
              >
                本当に削除する
              </button>
              <button
                type="button"
                onClick={() => setDeleteArmed(false)}
                className="min-h-11 rounded-lg border border-neutral-300 px-4 text-sm dark:border-neutral-700"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
