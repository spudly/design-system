// SPIKE (issue #137): blank-tail crop prototype for tall captures.
//
// A tall-surface screencap (e.g. 1080x8000) renders the whole page
// at the top of the surface and leaves the rest filled with the
// page background. This module trims the trailing rows that are
// uniformly one color (a "blank" row: every pixel within TOL of
// the row's first pixel, per channel), stopping at the first row
// that carries any content. It deliberately treats ANY internally
// uniform row as blank regardless of its color: the real captures
// end with two stacked uniform bands (the page background, then a
// ~20px system strip in a slightly different gray), and both must
// trim for the crop to reach the content end.
//
// Truncation signal: a capture where NOTHING trimmed and the
// bottom row is not itself blank means content ran right up to
// the surface's last row — the page is taller than the surface.

import { decodePng, encodePng } from "./png.mjs";

const TOL = 2;

function rowIsBlank(rgba, width, y) {
  const base = y * width * 4;
  const r = rgba[base];
  const g = rgba[base + 1];
  const b = rgba[base + 2];
  const a = rgba[base + 3];
  for (let x = 1; x < width; x++) {
    const o = base + x * 4;
    if (
      Math.abs(rgba[o] - r) > TOL ||
      Math.abs(rgba[o + 1] - g) > TOL ||
      Math.abs(rgba[o + 2] - b) > TOL ||
      Math.abs(rgba[o + 3] - a) > TOL
    ) {
      return false;
    }
  }
  return true;
}

/** Index of the first content row from the bottom + 1 (the crop height). */
export function blankTailCropHeight(img) {
  let end = img.height;
  while (end > 0 && rowIsBlank(img.rgba, img.width, end - 1)) end--;
  return end;
}

export function cropBlankTailPng(buf) {
  const img = decodePng(buf);
  const height = blankTailCropHeight(img);
  const removedRows = img.height - height;
  const bottomRowUniform = rowIsBlank(img.rgba, img.width, img.height - 1);
  const png =
    removedRows > 0
      ? encodePng(img.width, height, Buffer.from(img.rgba.subarray(0, height * img.width * 4)))
      : buf;
  return {
    png,
    rawWidth: img.width,
    rawHeight: img.height,
    width: img.width,
    height,
    removedRows,
    bottomRowUniform,
    truncationSuspect: removedRows === 0 && !bottomRowUniform,
  };
}
