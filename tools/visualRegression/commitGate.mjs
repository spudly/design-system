#!/usr/bin/env node
// Pixel-diff commit gate for Android VR baselines (issue #296).
//
// The capture pipeline turns fresh captures into committed
// baselines in two places: the PR auto-commit flow
// (ci/capture-compare.sh stages baselines/ + captures into the set
// the commit job pushes) and update mode (deviceMode.mjs writes
// each capture over its baseline). Both used to copy bytes
// unconditionally, so any capture whose PNG bytes differed landed
// as baseline churn — including pure render/re-encode noise. On PR
// #295 the bot commit rewrote 50 baselines; measured below, most
// of that churn was sub-perceptual noise, which made the commit
// effectively unreviewable.
//
// This gate is the single place that decides whether a fresh
// capture may replace its baseline: pixel-diff the capture against
// the baseline with the driver's comparator (imageDiff.mjs, color
// threshold 16 — the same pixel counting the strict compare uses)
// and stage/write it only when the differing-pixel ratio exceeds
// COMMIT_GATE_MAX_RATIO. A capture whose dimensions differ from
// its baseline always stages: the rendered page height moved,
// which is a real layout change, and skipping it would leave the
// strict compare failing on size forever. Measured on the #295
// bot commit (e98808e, predecessor vs rewritten bytes for all 50
// files, with this comparator):
//
//   skipped (24 files): a systematic-noise band at <=0.47% — whole
//     page families share one diff count across state variants
//     (9,750 px for all three SignInPage states, 7,023 for all six
//     RecipeDetailPage states; ForgotPasswordPage filled/loading
//     3,652 px = 0.141%) — plus one page #295 did not rework
//     (MyVersesPage) at 0.747%
//   staged (26 files): 25 with changed dimensions (page heights
//     moved with the #295 link rework) plus the smallest genuine
//     same-size change at 1.025% (MealsHub plans-tab, a page #295
//     reworked)
//
// The gate at 1% sits between the highest observed noise (0.747%,
// on a page the change did not touch) and the smallest genuine
// same-size change in that ground-truth commit (1.025%).
// It is deliberately NOT the strict compare's tolerance (0.1%):
// the compare defines what counts as a diff worth investigating;
// the gate defines what counts as a change worth committing. A
// sub-gate genuine change stays visible as a strict-compare
// failure on main and can be committed deliberately by re-running
// with a lower gate (--commit-max-ratio on run.mjs,
// --max-ratio here, or the DSVR_COMMIT_MAX_RATIO env var).
//
// CLI (used by ci/capture-compare.sh to build the staged set):
//   node commitGate.mjs --baselines <dir> --captures <dir>[,<dir>...]
//                       --out <stagedDir> [--summary <jsonPath>]
//                       [--threshold 16] [--max-ratio <ratio>]
//   node commitGate.mjs --print-gate   (prints the effective ratio)
// Exit code: 0 = staged set built, 1 = bad input / undecodable PNG.

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { listPngs } from "./compare.mjs";
import { diffImages } from "./imageDiff.mjs";
import { decodePng } from "./png.mjs";

// The named setting (issue #296 acceptance: a named, documented
// setting in the VR tooling, not a magic number in the workflow).
// See the header comment for the measured justification.
export const COMMIT_GATE_MAX_RATIO = 0.01;

// Classify one capture against its baseline. Returns
// { action, ratio, diffCount, total } where action is:
//   "new"     — no baseline exists yet (bootstrap, issue #128);
//   "changed" — the capture must replace the baseline (ratio over
//               the gate, or a size change, which is a full diff);
//   "skipped" — noise: the baseline bytes stay.
export function commitGateVerdict(baselinePath, capturePath, colorThreshold, gateRatio) {
  if (!existsSync(baselinePath))
    return { action: "new", ratio: null, diffCount: null, total: null };
  const base = decodePng(readFileSync(baselinePath));
  const capture = decodePng(readFileSync(capturePath));
  if (base.width !== capture.width || base.height !== capture.height) {
    const total = capture.width * capture.height;
    return { action: "changed", ratio: 1, diffCount: total, total };
  }
  const r = diffImages(base, capture, colorThreshold);
  return {
    action: r.ratio > gateRatio ? "changed" : "skipped",
    ratio: r.ratio,
    diffCount: r.diffCount,
    total: r.total,
  };
}

function copyTree(fromDir, toDir) {
  if (!existsSync(fromDir)) return;
  for (const entry of readdirSync(fromDir)) {
    const from = join(fromDir, entry);
    const to = join(toDir, entry);
    if (statSync(from).isDirectory()) copyTree(from, to);
    else {
      mkdirSync(dirname(to), { recursive: true });
      copyFileSync(from, to);
    }
  }
}

// Update mode's write path (deviceMode.mjs): write the capture
// over its baseline only when the gate stages it, and count the
// outcome on the driver's summary (skipped vs updated). Takes the
// driver's CONFIG like comparePair does; logs the SKIP line in
// the driver's format (path relative to the baselines dir).
export function updateBaselineThroughGate(baselinePath, capturePath, config, summary) {
  const { threshold, commitMaxRatio } = config;
  const verdict = commitGateVerdict(baselinePath, capturePath, threshold, commitMaxRatio);
  if (verdict.action === "skipped") {
    summary.skipped++;
    const rel = relative(config.baselinesDir, baselinePath);
    console.log(
      `SKIP ${rel}: ${(verdict.ratio * 100).toFixed(3)}% pixels differ (<= ${(commitMaxRatio * 100).toFixed(2)}% commit gate) — baseline kept`,
    );
    return;
  }
  mkdirSync(dirname(baselinePath), { recursive: true });
  copyFileSync(capturePath, baselinePath);
  summary.updated++;
}

function stageOneCapture(opts) {
  const { baselinesDir, outDir, rel, capturePath, colorThreshold, gateRatio, log, summary } = opts;
  summary.captured++;
  const verdict = commitGateVerdict(
    join(baselinesDir, rel),
    capturePath,
    colorThreshold,
    gateRatio,
  );
  if (verdict.action === "skipped") {
    summary.skipped++;
    log(
      `commit-gate: SKIP ${rel} — ${(verdict.ratio * 100).toFixed(3)}% pixels differ (<= ${(gateRatio * 100).toFixed(2)}% gate); baseline kept`,
    );
    return;
  }
  const stagedPath = join(outDir, rel);
  mkdirSync(dirname(stagedPath), { recursive: true });
  copyFileSync(capturePath, stagedPath);
  summary.staged++;
  summary[verdict.action]++;
  const pct = `${(verdict.ratio * 100).toFixed(3)}% pixels differ (> ${(gateRatio * 100).toFixed(2)}% gate)`;
  log(
    `commit-gate: STAGE ${rel} — ${verdict.action === "new" ? "new baseline (no previous baseline)" : pct}`,
  );
}

// Build the staged baseline set: a copy of the committed baselines
// with each fresh capture overlaid ONLY where the gate stages it.
// Captures are processed in order; a later captures dir wins for a
// repeated path (the standard and narrow sets never overlap — the
// "-narrow" suffix keeps them apart). Every decision is logged via
// `log` and counted in the returned summary; `staged` counts the
// files whose bytes will differ from the committed baselines.
export function stageGatedBaselines(opts) {
  const { baselinesDir, capturesDirs, outDir, log } = opts;
  mkdirSync(outDir, { recursive: true });
  copyTree(baselinesDir, outDir);
  const summary = { captured: 0, staged: 0, new: 0, changed: 0, skipped: 0 };
  const seen = new Map();
  for (const capturesDir of capturesDirs) {
    if (!existsSync(capturesDir)) continue;
    for (const rel of listPngs(capturesDir)) seen.set(rel, join(capturesDir, rel));
  }
  for (const [rel, capturePath] of [...seen.entries()].sort()) {
    stageOneCapture({ ...opts, rel, capturePath, summary });
  }
  log(
    `commit-gate: ${summary.captured} capture(s) gated: ${summary.staged} staged (${summary.new} new, ${summary.changed} changed), ${summary.skipped} skipped as noise`,
  );
  return summary;
}

function effectiveGate(args) {
  const i = args.indexOf("--max-ratio");
  if (i !== -1) return Number(args[i + 1]);
  if (process.env.DSVR_COMMIT_MAX_RATIO) return Number(process.env.DSVR_COMMIT_MAX_RATIO);
  return COMMIT_GATE_MAX_RATIO;
}

function parseStageArgs(args) {
  const argValue = (name, fallback) => {
    const i = args.indexOf(name);
    return i === -1 ? fallback : args[i + 1];
  };
  const parsed = {
    baselinesDir: argValue("--baselines", ""),
    outDir: argValue("--out", ""),
    capturesDirs: argValue("--captures", "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    colorThreshold: Number(argValue("--threshold", "16")),
    summaryPath: argValue("--summary", ""),
  };
  return parsed.baselinesDir && parsed.outDir && parsed.capturesDirs.length > 0 ? parsed : null;
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes("--print-gate")) {
    console.log(String(effectiveGate(args)));
    return 0;
  }
  const parsed = parseStageArgs(args);
  if (!parsed) {
    console.error(
      "commit-gate FAIL (issue #296): --baselines <dir>, --captures <dir>[,<dir>...] and --out <dir> are required.",
    );
    return 1;
  }
  const gateRatio = effectiveGate(args);
  let summary;
  try {
    summary = stageGatedBaselines({ ...parsed, gateRatio, log: (line) => console.log(line) });
  } catch (error) {
    console.error(`commit-gate FAIL (issue #296): ${error.message}`);
    return 1;
  }
  if (parsed.summaryPath) writeFileSync(parsed.summaryPath, JSON.stringify(summary, null, 2));
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exit(main());
