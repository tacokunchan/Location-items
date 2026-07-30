import { Link } from 'react-router-dom';
import { DownloadIcon } from '../common/Icon';

const BACKUP_DUE_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

type BackupBannerProps = {
  lastExportAt: number | undefined;
};

// IndexedDB can be cleared by the browser/OS at any time (spec: データ喪失対策
// is mandatory), so a stale or missing export is surfaced proactively rather
// than discovered the day it's actually needed.
export function BackupBanner({ lastExportAt }: BackupBannerProps) {
  const daysSinceExport = lastExportAt ? Math.floor((Date.now() - lastExportAt) / DAY_MS) : null;
  const due = daysSinceExport === null || daysSinceExport >= BACKUP_DUE_DAYS;

  if (!due) return null;

  return (
    <Link
      to="/settings"
      className="flex items-center gap-3 rounded-xl bg-indigo-50 px-4 py-3 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200"
    >
      <DownloadIcon className="h-5 w-5 shrink-0" />
      <span className="flex-1 text-sm">
        {daysSinceExport === null
          ? 'まだバックアップを取っていません。'
          : `バックアップから${daysSinceExport}日経過しています。`}
        設定からエクスポートしてください。
      </span>
    </Link>
  );
}
