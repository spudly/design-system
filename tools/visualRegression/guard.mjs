#!/usr/bin/env node
// Luminance guard for React Native storybook VR captures (issue #101).
//
// Issue #101: the CI capture pipeline intermittently screenshots a
// DIMMED emulator display — every story uniformly darkened to ~40%
// brightness (a doze-dimmed surface leaking into screencap despite
// the display pin in ci/capture-compare.sh). A compare run in that
// state just fails loudly, but the PR auto-commit flow
// (ci/capture-compare.sh, mode pr-autocommit) turns fresh captures
// INTO baselines — a dimmed set committed as baselines would poison
// every future compare. This guard is the gate that makes the
// automatic path safe: it inspects the fresh captures before any
// commit and refuses the whole set when the captures look dimmed or
// scrimmed. It is a MITIGATION for #101, not a fix — the root cause
// of the dimming is still open in #101.
//
// What it checks, per capture (luminance = Rec. 601 luma, sampled):
//   1. Dimming ratio vs the capture's OWN previous baseline: the
//      #101 signature is multiplicative (≈0.4x), so a capture whose
//      mean luminance falls outside [0.60, 1.67] of its baseline's
//      mean is rejected. Legit page changes move a full-page mean
//      by a few percent; they do not halve or double it.
//   2. Session median ratio outside [0.80, 1.25] is rejected: the
//      flake dims EVERYTHING at once, so the median catches a
//      milder uniform dim that stays inside the per-capture band.
//   3. A near-uniform frame (luminance stddev below
//      UNIFORM_STDDEV) is rejected: a real page screenshot always
//      has text/UI variance, so a flat frame means a blank surface
//      or a system scrim covered the app. (A literal ANR dialog is
//      not pixel-distinguishable without OCR; in practice an ANR
//      also breaks the driver's READY protocol, which fails the
//      capture before this guard ever runs.)
// There is deliberately NO absolute luminance floor: dark-theme
// pages are legitimately dark (background #171717), so only the
// ratio against the story's own baseline is a safe signal.
//
// Captures without a previous baseline (new stories) get the
// uniformity check only — there is nothing to ratio against.
//
// Usage:
//   node guard.mjs --captures <dir> [--baselines <dir>]
// Exit code: 0 = guard passed, 1 = guard tripped (or bad input).

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { decodePng } from "./png.mjs";

const TOOL_DIR = dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
function argValue(name, fallback) {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
}

const CAPTURES_DIR = argValue("--captures", "");
const BASELINES_DIR = argValue("--baselines", join(TOOL_DIR, "baselines"));
// Sample every Nth pixel for the stats; full-page luminance stats
// do not need every pixel and the full set is ~2.6M px per capture.
const STRIDE = Number(argValue("--stride", "4"));

// Thresholds — see the header comment for the reasoning.
const SINGLE_MIN_RATIO = 0.6;
const SINGLE_MAX_RATIO = 1.67;
const MEDIAN_MIN_RATIO = 0.8;
const MEDIAN_MAX_RATIO = 1.25;
const UNIFORM_STDDEV = 1; // on the 0..255 luminance scale

function listPngs(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) {
      for (const f of listPngs(p)) out.push(join(entry, f));
    } else if (entry.endsWith(".png")) {
      out.push(entry);
    }
  }
  return out.sort();
}

function luminanceStats(rgba) {
  let sum = 0;
  let sumSq = 0;
  let n = 0;
  // A zero-pixel frame has no luminance to average (the stats
  // would be NaN and every comparison below false): report it as
  // perfectly uniform so the near-uniform check trips on it — an
  // empty frame is a broken capture, never a baseline.
  for (let o = 0; o + 3 < rgba.length; o += 4 * STRIDE) {
    const lum = 0.299 * rgba[o] + 0.587 * rgba[o + 1] + 0.114 * rgba[o + 2];
    sum += lum;
    sumSq += lum * lum;
    n++;
  }
  if (n === 0) return { mean: 0, stddev: 0 };
  const mean = sum / n;
  const variance = Math.max(0, sumSq / n - mean * mean);
  return { mean, stddev: Math.sqrt(variance) };
}

function main() {
  if (!CAPTURES_DIR) {
    console.error("LUMINANCE GUARD FAIL (issue #101): --captures <dir> is required.");
    return 1;
  }
  const captures = listPngs(CAPTURES_DIR);
  if (captures.length === 0) {
    console.error(
      `LUMINANCE GUARD FAIL (issue #101): no captures found under ${CAPTURES_DIR} — ` +
        "refusing to pass an empty set.",
    );
    return 1;
  }

  const trips = [];
  const ratios = [];
  for (const rel of captures) {
    const img = decodePng(readFileSync(join(CAPTURES_DIR, rel)));
    const stats = luminanceStats(img.rgba);
    let note = `mean=${stats.mean.toFixed(1)} stddev=${stats.stddev.toFixed(1)}`;
    if (stats.stddev < UNIFORM_STDDEV) {
      trips.push(
        `${rel}: near-uniform frame (luminance stddev ${stats.stddev.toFixed(2)} < ` +
          `${UNIFORM_STDDEV}) — blank surface or system scrim over the app`,
      );
    }
    const baselinePath = join(BASELINES_DIR, rel);
    if (existsSync(baselinePath)) {
      const base = decodePng(readFileSync(baselinePath));
      if (base.width === img.width && base.height === img.height) {
        const baseStats = luminanceStats(base.rgba);
        if (baseStats.mean >= 1) {
          const ratio = stats.mean / baseStats.mean;
          ratios.push(ratio);
          note += ` baselineMean=${baseStats.mean.toFixed(1)} ratio=${ratio.toFixed(3)}`;
          if (ratio < SINGLE_MIN_RATIO || ratio > SINGLE_MAX_RATIO) {
            trips.push(
              `${rel}: luminance ratio ${ratio.toFixed(3)} vs its previous baseline is ` +
                `outside [${SINGLE_MIN_RATIO}, ${SINGLE_MAX_RATIO}] — the uniform-dimming ` +
                "signature of issue #101 (or a scrim brightening a dark page)",
            );
          }
        }
      }
    }
    console.log(`guard: ${rel} ${note}`);
  }

  if (ratios.length > 0) {
    const sorted = [...ratios].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    console.log(
      `guard: session median luminance ratio ${median.toFixed(3)} over ${ratios.length} capture(s) with baselines`,
    );
    if (median < MEDIAN_MIN_RATIO || median > MEDIAN_MAX_RATIO) {
      trips.push(
        `session median luminance ratio ${median.toFixed(3)} is outside ` +
          `[${MEDIAN_MIN_RATIO}, ${MEDIAN_MAX_RATIO}] — the whole capture session looks ` +
          "uniformly dimmed/brightened (issue #101)",
      );
    }
  }

  if (trips.length > 0) {
    for (const t of trips) console.error(`LUMINANCE GUARD FAIL (issue #101): ${t}`);
    console.error("LUMINANCE GUARD: refusing this capture set — nothing may be committed from it.");
    return 1;
  }
  console.log(`guard: PASS — ${captures.length} capture(s) show no dimming/scrim signature.`);
  return 0;
}

process.exit(main());
