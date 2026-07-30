import { useObjectUrl } from '../../hooks/useObjectUrl';
import { BoxIcon } from './Icon';

type PhotoThumbProps = {
  photoId: string | undefined;
  alt: string;
  fallbackLabel?: string;
  className?: string;
  rounded?: string;
};

// Falls back to an icon + label tile when there's no photo, per 6-1: items
// without a photo must still be scannable in the grid.
export function PhotoThumb({
  photoId,
  alt,
  fallbackLabel,
  className = '',
  rounded = 'rounded-xl',
}: PhotoThumbProps) {
  const url = useObjectUrl(photoId);

  if (!photoId || !url) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1 bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 ${rounded} ${className}`}
      >
        <BoxIcon className="h-6 w-6" />
        {fallbackLabel && (
          <span className="line-clamp-2 px-1 text-center text-xs leading-tight">
            {fallbackLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className={`object-cover ${rounded} ${className}`}
    />
  );
}
