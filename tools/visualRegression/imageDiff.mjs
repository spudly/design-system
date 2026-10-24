// Pixel comparison for the visual-regression harness. Split out of
// png.mjs so the codec stays under the file-length cap; behavior
// identical to the comparator the driver has always used.

import { encodePng } from "./png.mjs";

/**
 * Compare two decoded images. A pixel "differs" when any channel's
 * absolute delta exceeds `threshold` (0-255 scale). Returns the diff
 * count, the differing ratio, and a diff visualization (dimmed
 * baseline with differing pixels in red) as an encoded PNG buffer.
 */
export function diffImages(a, b, threshold = 16) {
  if (a.width !== b.width || a.height !== b.height) {
    throw new Error(`diffImages: size mismatch ${a.width}x${a.height} vs ${b.width}x${b.height}`);
  }
  const total = a.width * a.height;
  const vis = Buffer.alloc(total * 4);
  let diffCount = 0;
  for (let i = 0; i < total; i++) {
    const o = i * 4;
    const dr = Math.abs(a.rgba[o] - b.rgba[o]);
    const dg = Math.abs(a.rgba[o + 1] - b.rgba[o + 1]);
    const db = Math.abs(a.rgba[o + 2] - b.rgba[o + 2]);
    const da = Math.abs(a.rgba[o + 3] - b.rgba[o + 3]);
    if (Math.max(dr, dg, db, da) > threshold) {
      diffCount++;
      vis[o] = 0xff;
      vis[o + 1] = 0x00;
      vis[o + 2] = 0x00;
      vis[o + 3] = 0xff;
    } else {
      const gray = Math.round((a.rgba[o] + a.rgba[o + 1] + a.rgba[o + 2]) / 3);
      vis[o] = gray;
      vis[o + 1] = gray;
      vis[o + 2] = gray;
      vis[o + 3] = 0xff;
    }
  }
  return {
    diffCount,
    total,
    ratio: diffCount / total,
    diffPng: encodePng(a.width, a.height, vis),
  };
}
