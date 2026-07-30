const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.8;

// Downscale + re-encode before storage: the spec forbids keeping originals
// (a handful of full-res phone photos would blow past a realistic IndexedDB
// budget), and 1280px/0.8 JPEG keeps a ~5MB photo around 300KB.
export async function resizeImageFile(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
    );
    if (!blob) throw new Error('Image encoding failed');
    return blob;
  } finally {
    bitmap.close();
  }
}
