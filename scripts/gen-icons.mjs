// Generates flat-color PNG app icons (no external image deps available).
// Re-run with `node scripts/gen-icons.mjs` if the icon design needs to change.
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

const BG = [79, 70, 229]; // indigo-600
const FG = [255, 255, 255];

function crc32(buf) {
  let c;
  const table = crc32.table ?? (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// Draws a simple "box with a location pin" glyph so the icon reads at a glance.
function pixelAt(x, y, size) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.34;
  const dx = x - cx;
  const dy = y - cy - size * 0.04;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < r * 0.42) return FG; // inner dot of the pin
  // pin body: circle tapering to a point below
  if (dy < r * 0.55 && dist < r) return FG;
  if (dy >= r * 0.55) {
    const taper = r * (1 - (dy - r * 0.55) / (r * 0.9));
    if (taper > 0 && Math.abs(dx) < taper * 0.55) return FG;
  }
  return BG;
}

function makePng(size) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  let offset = 0;
  for (let y = 0; y < size; y++) {
    raw[offset++] = 0; // filter type: none
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixelAt(x, y, size);
      raw[offset++] = r;
      raw[offset++] = g;
      raw[offset++] = b;
      raw[offset++] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const idat = deflateSync(raw);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

writeFileSync(new URL('../public/pwa-192.png', import.meta.url), makePng(192));
writeFileSync(new URL('../public/pwa-512.png', import.meta.url), makePng(512));
writeFileSync(new URL('../public/apple-touch-icon.png', import.meta.url), makePng(180));
writeFileSync(new URL('../public/favicon.png', import.meta.url), makePng(48));
console.log('icons generated');
