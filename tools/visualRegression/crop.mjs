// Blank-tail crop for app-drawn captures (design-system #137).
//
// An app-drawn frame is the React root drawn at (root height +
// content overflow): below the page's last element it still
// carries the root's below-viewport region — rows of uniform
// window background. This module trims the trailing rows that are
// uniformly one color (a "blank" row: every pixel within TOL of
// the row's first pixel, per channel), stopping at the first row
// that carries any content, so a baseline ends at the page's real
// last row. It deliberately treats ANY internally uniform row as
// blank regardless of its color: real frames end with stacked
// uniform bands (page background, then a slightly different
// system strip), and both must trim for the crop to reach the
// content end.
//
// Truncation signal: a capture where NOTHING trimmed and the
// bottom row is not itself blank means content ran right up to
// the frame's last row — for a scroll-mode app-drawn frame, whose
// below-viewport tail should always trim, that is suspect, and
// the driver fails the capture loudly (the drawn==measured guard
// in appCapture.mjs is the primary completeness check; this is
// the safety net behind it).

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
