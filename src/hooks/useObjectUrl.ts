import { useEffect, useState } from 'react';
import { getPhoto } from '../db/photosRepo';

// Loads a photo blob and exposes it as an object URL, revoking it whenever
// the id changes or the component unmounts — the spec requires this exact
// lifecycle so blob URLs never leak.
export function useObjectUrl(photoId: string | undefined): string | undefined {
  const [url, setUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!photoId) {
      setUrl(undefined);
      return;
    }
    let cancelled = false;
    let createdUrl: string | undefined;

    getPhoto(photoId).then((photo) => {
      if (cancelled || !photo) return;
      createdUrl = URL.createObjectURL(photo.blob);
      setUrl(createdUrl);
    });

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
      setUrl(undefined);
    };
  }, [photoId]);

  return url;
}
