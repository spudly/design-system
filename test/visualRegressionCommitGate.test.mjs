// Tests for the pixel-diff commit gate of issue #296
// (tools/visualRegression/commitGate.mjs): the verdict for a single
// capture/baseline pair and the staged-set builder the PR
// auto-commit flow uses. The pipeline's failure mode before the
// gate: the bot commit on PR #295 rewrote 50 baselines — replayed
// through the gate, 24 are skipped as noise (a systematic band at
// <=0.47% plus one unreworked page at 0.747%) and 26 are staged
// (25 page-height changes, which always stage, plus the smallest
// genuine same-size change at 1.025%). The gate constant is pinned
// between the noise ceiling and the genuine floor by the invariant
// test below.

import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const { COMMIT_GATE_MAX_RATIO, commitGateVerdict, stageGatedBaselines, updateBaselineThroughGate } =
  await import(join(repoRoot, "tools/visualRegression/commitGate.mjs"));
const { encodePng } = await import(join(repoRoot, "tools/visualRegression/png.mjs"));

const W = 100;
const H = 100; // 10,000 px: 1% = 100 px

function solidPng(r, g, b) {
  const rgba = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    rgba[i * 4] = r;
    rgba[i * 4 + 1] = g;
    rgba[i * 4 + 2] = b;
    rgba[i * 4 + 3] = 255;
  }
  return encodePng(W, H, rgba);
}

// A capture that differs from the given base in exactly `count`
// pixels (red channel +100, far over the color threshold of 16).
function flippedPng(count) {
  const rgba = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    rgba[i * 4] = 40;
    rgba[i * 4 + 1] = 40;
    rgba[i * 4 + 2] = 40;
    rgba[i * 4 + 3] = 255;
  }
  for (let i = 0; i < count; i++) rgba[i * 4] = 140;
  return encodePng(W, H, rgba);
}

function writePair(dir, rel, baselineBuf, captureBuf) {
  const baselinePath = join(dir, "baselines", rel);
  const capturePath = join(dir, "captures", rel);
  if (baselineBuf) {
    mkdirSync(dirname(baselinePath), { recursive: true });
    writeFileSync(baselinePath, baselineBuf);
  }
  if (captureBuf) {
    mkdirSync(dirname(capturePath), { recursive: true });
    writeFileSync(capturePath, captureBuf);
  }
  return { baselinePath, capturePath };
}

test("gate constant sits between the measured #295 noise ceiling and genuine floor", () => {
  // e98808e ground truth (issue #296), measured with the repo
  // comparator: highest noise 0.747% (a page #295 did not rework),
  // smallest genuine same-size change 1.025%. The gate must skip
  // the first and stage the second.
  assert.ok(COMMIT_GATE_MAX_RATIO > 0.00747, `gate ${COMMIT_GATE_MAX_RATIO} must exceed 0.747%`);
  assert.ok(
    COMMIT_GATE_MAX_RATIO < 0.01025,
    `gate ${COMMIT_GATE_MAX_RATIO} must stay under 1.025%`,
  );
});

test("identical capture is skipped", () => {
  const dir = mkdtempSync(join(tmpdir(), "dsvr-gate-"));
  const base = solidPng(40, 40, 40);
  const { baselinePath, capturePath } = writePair(dir, "t/a.png", base, base);
  const v = commitGateVerdict(baselinePath, capturePath, 16, COMMIT_GATE_MAX_RATIO);
  assert.equal(v.action, "skipped");
  assert.equal(v.ratio, 0);
});

test("sub-gate noise is skipped (0.2% of pixels)", () => {
  const dir = mkdtempSync(join(tmpdir(), "dsvr-gate-"));
  const { baselinePath, capturePath } = writePair(
    dir,
    "t/a.png",
    solidPng(40, 40, 40),
    flippedPng(20), // 20/10000 = 0.2%
  );
  const v = commitGateVerdict(baselinePath, capturePath, 16, COMMIT_GATE_MAX_RATIO);
  assert.equal(v.action, "skipped");
  assert.ok(Math.abs(v.ratio - 0.002) < 1e-9);
});

test("over-gate change is staged (20% of pixels)", () => {
  const dir = mkdtempSync(join(tmpdir(), "dsvr-gate-"));
  const { baselinePath, capturePath } = writePair(
    dir,
    "t/a.png",
    solidPng(40, 40, 40),
    flippedPng(2000),
  );
  const v = commitGateVerdict(baselinePath, capturePath, 16, COMMIT_GATE_MAX_RATIO);
  assert.equal(v.action, "changed");
  assert.ok(Math.abs(v.ratio - 0.2) < 1e-9);
});

test("missing baseline is staged as new", () => {
  const dir = mkdtempSync(join(tmpdir(), "dsvr-gate-"));
  const { baselinePath, capturePath } = writePair(dir, "t/a.png", null, solidPng(40, 40, 40));
  const v = commitGateVerdict(baselinePath, capturePath, 16, COMMIT_GATE_MAX_RATIO);
  assert.equal(v.action, "new");
});

// Staging fixture: one noise pair, one real change, one new
// baseline, one baseline with no capture this run.
function setupStagingFixture() {
  const dir = mkdtempSync(join(tmpdir(), "dsvr-gate-"));
  const fx = {
    baselinesDir: join(dir, "baselines"),
    capturesDir: join(dir, "captures"),
    outDir: join(dir, "staged"),
    base: solidPng(40, 40, 40),
    real: flippedPng(2000),
    fresh: solidPng(90, 90, 90),
  };
  const pairs = [
    ["t/noise.png", fx.base, flippedPng(20)],
    ["t/real.png", fx.base, fx.real],
    ["t/fresh.png", null, fx.fresh],
    ["t/untouched.png", fx.base, null],
  ];
  for (const [rel, b, c] of pairs) writePair(dir, rel, b, c);
  return fx;
}

test("staging keeps baseline bytes for noise, capture bytes for real changes", () => {
  const fx = setupStagingFixture();
  const logs = [];
  const summary = stageGatedBaselines({
    baselinesDir: fx.baselinesDir,
    capturesDirs: [fx.capturesDir],
    outDir: fx.outDir,
    colorThreshold: 16,
    gateRatio: COMMIT_GATE_MAX_RATIO,
    log: (line) => logs.push(line),
  });

  assert.deepEqual(summary, { captured: 3, staged: 2, new: 1, changed: 1, skipped: 1 });
  assert.match(logs.at(-1), /3 capture\(s\) gated: 2 staged/, "per-run summary line is logged");
  const stagedBytes = [
    ["t/noise.png", fx.base], // noise keeps baseline bytes
    ["t/real.png", fx.real], // real change takes capture bytes
    ["t/fresh.png", fx.fresh], // new baseline is staged
    ["t/untouched.png", fx.base], // uncaptured baseline carried over
  ];
  for (const [rel, expected] of stagedBytes) {
    assert.ok(readFileSync(join(fx.outDir, rel)).equals(expected), rel);
  }
});

test("update-mode write path: noise keeps the baseline, a real change rewrites it", () => {
  const dir = mkdtempSync(join(tmpdir(), "dsvr-gate-"));
  const base = solidPng(40, 40, 40);
  const config = {
    threshold: 16,
    commitMaxRatio: COMMIT_GATE_MAX_RATIO,
    baselinesDir: join(dir, "baselines"),
  };
  const summary = { updated: 0, skipped: 0 };
  const noisePair = writePair(dir, "t/n.png", base, flippedPng(20));
  updateBaselineThroughGate(noisePair.baselinePath, noisePair.capturePath, config, summary);
  assert.deepEqual(summary, { updated: 0, skipped: 1 });
  assert.ok(readFileSync(noisePair.baselinePath).equals(base), "baseline bytes untouched");
  const realPair = writePair(dir, "t/r.png", base, flippedPng(2000));
  updateBaselineThroughGate(realPair.baselinePath, realPair.capturePath, config, summary);
  assert.deepEqual(summary, { updated: 1, skipped: 1 });
  assert.ok(readFileSync(realPair.baselinePath).equals(flippedPng(2000)), "baseline rewritten");
});
