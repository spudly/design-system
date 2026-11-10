// Baseline comparison for the visual-regression driver (run.mjs):
// lists the committed baseline PNGs, compares one baseline/actual
// pair, and runs the compare-only (--from-dir) mode. Split out of
// run.mjs so the driver stays under the file-length cap; behavior
// identical — the driver passes its CONFIG in.

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { canonicalBaselineRel, listCommittedBaselines } from "./baselineResolver.mjs";
import { diffImages } from "./imageDiff.mjs";
import { decodePng } from "./png.mjs";

export function listPngs(dir) {
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

export function comparePair(config, baselinePath, actualPath, diffPath) {
  const base = decodePng(readFileSync(baselinePath));
  const actual = decodePng(readFileSync(actualPath));
  if (base.width !== actual.width || base.height !== actual.height) {
    // A size change is a diff, not a crash: report it as a 100%
    // mismatch in the usual failure format (the PR auto-commit
    // classifier keys on that format) and let the caller log the
    // dimensions. This is how a capture-geometry change — e.g.
    // #137's move from 2400px screencaps to full-height app-drawn
    // frames — flows into baseline regeneration instead of
    // aborting the run inside diffImages.
    return {
      ok: false,
      diffCount: actual.width * actual.height,
      total: actual.width * actual.height,
      ratio: 1,
      diffPng: null,
      sizeMismatch: true,
      baselineSize: `${base.width}x${base.height}`,
      actualSize: `${actual.width}x${actual.height}`,
    };
  }
  const result = diffImages(base, actual, config.threshold);
  if (result.ratio > config.maxRatio) {
    mkdirSync(dirname(diffPath), { recursive: true });
    writeFileSync(diffPath, result.diffPng);
    return { ok: false, ...result };
  }
  return { ok: true, ...result };
}

// The committed baselines as canonical tree entries
// ({ rel, absPath }): from the colocated layout when the
// baselines argument is a repo root (baselineResolver.mjs), or
// from a canonical tree dir (an intermediate set — a staged
// tree, a captures dir) otherwise.
export function committedBaselineEntries(config) {
  if (config.baselinesLayout === "repo") {
    const { baselines, orphans } = listCommittedBaselines(config.baselinesDir);
    if (orphans.length > 0) {
      throw new Error(`committed baseline(s) the story index cannot place: ${orphans.join(", ")}`);
    }
    return baselines.map((b) => ({
      rel: canonicalBaselineRel(b),
      absPath: join(config.baselinesDir, b.relPath),
    }));
  }
  return listPngs(config.baselinesDir).map((rel) => ({
    rel,
    absPath: join(config.baselinesDir, rel),
  }));
}

export function fromDirMode(config) {
  const actualDir = config.fromDir;
  // Standard and narrow baselines share one set (the "-narrow"
  // suffix tells them apart); an offline compare covers exactly
  // one set — comparing a standard capture dir against the narrow
  // baselines (or vice versa) would fail every pair on dimensions.
  const baselineFiles = committedBaselineEntries(config).filter(({ rel }) =>
    config.variant === "narrow" ? rel.endsWith("-narrow.png") : !rel.endsWith("-narrow.png"),
  );
  console.log(
    `compare-only: ${baselineFiles.length} ${config.variant || "standard"} baseline(s) vs ${actualDir}`,
  );
  if (baselineFiles.length === 0) {
    console.error("FAIL: no baselines found — nothing to compare against.");
    return 1;
  }
  let failed = 0;
  let compared = 0;
  for (const { rel, absPath } of baselineFiles) {
    const actualPath = join(actualDir, rel);
    if (!existsSync(actualPath)) {
      console.error(`FAIL ${rel}: no actual screenshot`);
      failed++;
      continue;
    }
    compared++;
    const r = comparePair(config, absPath, actualPath, join(config.outDir, "diff", rel));
    if (!r.ok) {
      console.error(
        `FAIL ${rel}: ${(r.ratio * 100).toFixed(3)}% pixels differ (${r.diffCount}/${r.total})`,
      );
      failed++;
    }
  }
  console.log(`compare-only done: ${compared} compared, ${failed} failed`);
  return failed > 0 ? 1 : 0;
}
