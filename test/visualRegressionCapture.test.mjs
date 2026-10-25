/**
 * Unit tests for the #137 app-drawn capture helpers in
 * tools/visualRegression: the blank-tail crop (crop.mjs) and the
 * size-mismatch handling in comparePair (compare.mjs).
 *
 * The crop contract (proven on real frames by the #137 spikes):
 * trailing internally-uniform rows trim to the content end; a
 * frame that trims nothing while ending on a non-uniform row is
 * truncation-suspect; a frame ending on a uniform row is not.
 *
 * The comparePair contract: a baseline/capture size change (e.g.
 * the one-time move from 2400px screencap baselines to full-height
 * app-drawn frames) is a 100% diff in the standard failure shape,
 * never an exception — the PR auto-commit flow classifies failures
 * by that shape to decide it may regenerate baselines.
 */
import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const toolsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "tools", "visualRegression");
const { cropBlankTailPng } = await import(join(toolsDir, "crop.mjs"));
const { comparePair } = await import(join(toolsDir, "compare.mjs"));
const { encodePng, decodePng } = await import(join(toolsDir, "png.mjs"));

// A synthetic frame: textured "content" rows up to contentEnd,
// then uniform page background, then a 20px uniform system strip
// in a slightly different shade (the stacked-bands shape real
// frames end with — both bands must trim).
function makeFrame(height, contentEnd, strip = true) {
  const width = 60;
  const rgba = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      let c = [250, 246, 240];
      if (strip && y >= height - 20) c = [250, 250, 250];
      if (y < contentEnd) c = x % 17 === 0 || y % 13 === 0 ? [10, 20, 30] : [250, 246, 240];
      rgba[o] = c[0];
      rgba[o + 1] = c[1];
      rgba[o + 2] = c[2];
      rgba[o + 3] = 255;
    }
  }
  return encodePng(width, height, rgba);
}

test("crop trims the blank tail exactly to the content end", () => {
  const r = cropBlankTailPng(makeFrame(3000, 1200));
  assert.equal(r.rawHeight, 3000);
  assert.equal(r.height, 1200);
  assert.equal(r.removedRows, 1800);
  assert.equal(r.truncationSuspect, false);
  const decoded = decodePng(r.png);
  assert.equal(decoded.width, 60);
  assert.equal(decoded.height, 1200);
});

test("crop flags a frame whose content runs to the last row", () => {
  const r = cropBlankTailPng(makeFrame(1200, 1200, false));
  assert.equal(r.removedRows, 0);
  assert.equal(r.bottomRowUniform, false);
  assert.equal(r.truncationSuspect, true);
});

test("crop leaves a frame ending on a uniform row unsuspected", () => {
  const r = cropBlankTailPng(makeFrame(1200, 1199, false));
  assert.equal(r.removedRows, 1);
  assert.equal(r.bottomRowUniform, true);
  assert.equal(r.truncationSuspect, false);
});

test("comparePair reports a size change as a full diff, not an exception", () => {
  const dir = mkdtempSync(join(tmpdir(), "dsvr-compare-"));
  const baseline = join(dir, "baseline.png");
  const actual = join(dir, "actual.png");
  writeFileSync(baseline, makeFrame(240, 100));
  writeFileSync(actual, makeFrame(480, 300));
  const r = comparePair(
    { threshold: 16, maxRatio: 0.001 },
    baseline,
    actual,
    join(dir, "diff.png"),
  );
  assert.equal(r.ok, false);
  assert.equal(r.sizeMismatch, true);
  assert.equal(r.ratio, 1);
  assert.equal(r.baselineSize, "60x240");
  assert.equal(r.actualSize, "60x480");
});

test("comparePair passes identical same-size frames", () => {
  const dir = mkdtempSync(join(tmpdir(), "dsvr-compare-"));
  const baseline = join(dir, "baseline.png");
  const actual = join(dir, "actual.png");
  const frame = makeFrame(240, 100);
  writeFileSync(baseline, frame);
  writeFileSync(actual, frame);
  const r = comparePair(
    { threshold: 16, maxRatio: 0.001 },
    baseline,
    actual,
    join(dir, "diff.png"),
  );
  assert.equal(r.ok, true);
  assert.equal(r.ratio, 0);
});
