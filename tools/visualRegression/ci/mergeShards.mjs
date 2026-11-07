#!/usr/bin/env node
// Union of the sharded Android VR capture artifacts (issue #432,
// phase 2).
//
// The workflow's visual-regression matrix jobs each capture one
// shard's slice of the scope (ci/capture-compare.sh mode pr-shard)
// and upload an artifact named dsvr-shard-<index> holding:
//   dsvr-out/          the standard set's output (actual/ + summary.json)
//   dsvr-out-narrow/   the narrow variant's output (same shape)
//   dsvr-shard-result.json
//                      the shard's classification of its compare
//                      pass: { verdict: "clean" | "regen" | "other",
//                      missing, diffs } — the same verdict vocabulary
//                      capture-compare.sh's pr-autocommit flow uses.
//
// This module merges a directory of those artifacts (downloaded by
// actions/download-artifact into one subdirectory per artifact)
// into the single capture layout the serial flow worked on —
// /tmp/dsvr-out and /tmp/dsvr-out-narrow — plus a merged verdict
// for the run. The merge is deliberately strict, because the union
// is where the phase-2 guarantee (a sharded run produces exactly
// what a serial run on the same head would) is enforced:
//
//   - every expected shard 0..expected-1 must be present, with a
//     readable result file — a missing shard means part of the
//     capture set was never captured, and proceeding would stage
//     baselines from an incomplete set;
//   - a shard whose verdict is "other" (a non-pixel-diff failure)
//     fails the merge, exactly as it stops the serial flow;
//   - the same capture path produced by two shards fails the
//     merge: shards are disjoint by construction (shardScope.mjs),
//     so a collision means the sharding itself is broken and no
//     staged set from it can be trusted.
//
// Merged summaries sum the per-shard counters and concatenate the
// failure lists, per set. The merged verdict is "regen" when any
// shard needs regeneration (pixel diffs or missing baselines),
// otherwise "clean".
//
// Importable (unit tests) and runnable as a CLI:
//   node mergeShards.mjs --shards-dir <dir> --expected <n>
//     --out <dir> --out-narrow <dir> --result <json>

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

// Recursively list the files under a directory as slash-separated
// paths relative to it (empty array when the directory is absent —
// a shard that captured nothing for a set has no actual/ dir).
export function listFiles(dir, prefix = "") {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir).sort()) {
    const path = join(dir, entry);
    const rel = prefix ? `${prefix}/${entry}` : entry;
    if (statSync(path).isDirectory()) out.push(...listFiles(path, rel));
    else out.push(rel);
  }
  return out;
}

function readJson(path, what) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    throw new Error(`merge-shards: ${what} at ${path} is missing or not readable JSON`);
  }
}

// Copy one shard set's captures (actual/**) into the merged set,
// refusing any path another shard already produced.
function unionCaptures(shardDirs, setName, outDir, seen) {
  for (const shardDir of shardDirs) {
    const actualDir = join(shardDir, setName, "actual");
    for (const rel of listFiles(actualDir)) {
      if (seen.has(rel)) {
        throw new Error(
          `merge-shards: capture ${setName}/${rel} was produced by more than one shard — ` +
            "shards must be disjoint (shardScope.mjs); refusing to merge an untrustworthy union",
        );
      }
      seen.add(rel);
      const to = join(outDir, "actual", rel);
      mkdirSync(dirname(to), { recursive: true });
      copyFileSync(join(actualDir, rel), to);
    }
  }
}

// Merge the per-shard summary.json files of one set: counters sum,
// failure lists concatenate. A shard that captured zero stories in
// the set still wrote a summary (deviceMode.mjs always writes
// one), so a missing summary is a broken artifact, not an empty
// set — fail loudly instead of treating it as zero.
function unionSummary(shardDirs, setName, outDir) {
  const merged = { captured: 0, compared: 0, updated: 0, skipped: 0, noBaseline: 0, failed: [] };
  for (const shardDir of shardDirs) {
    const s = readJson(join(shardDir, setName, "summary.json"), `shard ${setName} summary`);
    for (const k of ["captured", "compared", "updated", "skipped", "noBaseline"]) {
      merged[k] += Number.isInteger(s[k]) ? s[k] : 0;
    }
    if (Array.isArray(s.failed)) merged.failed.push(...s.failed);
  }
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "summary.json"), `${JSON.stringify(merged, null, 2)}\n`);
  return merged;
}

// A shard verdict gates the whole merge: "other" (a non-diff
// compare failure) stops regeneration in the serial flow, so it
// stops the sharded one too; anything unrecognized is a broken
// artifact, never a pass.
function checkShardVerdict(result, i) {
  if (result.verdict === "other") {
    throw new Error(
      `merge-shards: shard ${i} reported a non-diff compare failure (verdict "other") — ` +
        "the serial flow regenerates nothing in that state, and neither does the sharded one",
    );
  }
  if (result.verdict !== "clean" && result.verdict !== "regen") {
    throw new Error(
      `merge-shards: shard ${i} result has unknown verdict ${JSON.stringify(result.verdict)}`,
    );
  }
}

// Validate and aggregate the per-shard result files: every
// expected shard must be present with a clean/regen verdict.
// Returns { verdict, missing, diffs, shardDirs }.
function readShardResults(shardsDir, expected) {
  const shardDirs = [];
  let verdict = "clean";
  let missing = 0;
  let diffs = 0;
  for (let i = 0; i < expected; i++) {
    const shardDir = join(shardsDir, `dsvr-shard-${i}`);
    if (!existsSync(shardDir)) {
      throw new Error(
        `merge-shards: artifact for shard ${i} of ${expected} is missing (${shardDir}) — ` +
          "the capture set is incomplete; refusing to stage baselines from it",
      );
    }
    const result = readJson(join(shardDir, "dsvr-shard-result.json"), `shard ${i} result file`);
    checkShardVerdict(result, i);
    if (result.verdict === "regen") verdict = "regen";
    missing += Number.isInteger(result.missing) ? result.missing : 0;
    diffs += Number.isInteger(result.diffs) ? result.diffs : 0;
    shardDirs.push(shardDir);
  }
  return { verdict, missing, diffs, shardDirs };
}

// Merge the downloaded shard artifacts. Returns the merged result
// { verdict, missing, diffs, shards }. Throws on any condition
// that makes the union untrustworthy (see the header comment).
export function mergeShards({ shardsDir, expected, outDir, outNarrowDir }) {
  if (!Number.isInteger(expected) || expected < 1) {
    throw new TypeError(`merge-shards: --expected must be a positive integer, got ${expected}`);
  }
  const { verdict, missing, diffs, shardDirs } = readShardResults(shardsDir, expected);
  unionCaptures(shardDirs, "dsvr-out", outDir, new Set());
  unionCaptures(shardDirs, "dsvr-out-narrow", outNarrowDir, new Set());
  unionSummary(shardDirs, "dsvr-out", outDir);
  unionSummary(shardDirs, "dsvr-out-narrow", outNarrowDir);
  return { verdict, missing, diffs, shards: expected };
}

// --- CLI ---------------------------------------------------------------

function value(argv, name, fallback) {
  const i = argv.indexOf(name);
  return i === -1 ? fallback : argv[i + 1];
}

function main(argv) {
  const shardsDir = value(argv, "--shards-dir", "");
  const expected = Number(value(argv, "--expected", ""));
  const outDir = value(argv, "--out", "");
  const outNarrowDir = value(argv, "--out-narrow", "");
  const resultPath = value(argv, "--result", "");
  if (!shardsDir || !outDir || !outNarrowDir) {
    console.error(
      "merge-shards FAIL (issue #432): --shards-dir <dir>, --expected <n>, --out <dir> and --out-narrow <dir> are required.",
    );
    return 1;
  }
  let result;
  try {
    result = mergeShards({ shardsDir, expected, outDir, outNarrowDir });
  } catch (error) {
    console.error(`::error::${error.message}`);
    return 1;
  }
  if (resultPath) writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);
  console.log(
    `merge-shards (#432): union of ${result.shards} shard(s) — verdict ${result.verdict} ` +
      `(${result.diffs} pixel-diff failure(s), ${result.missing} stor(ies) with no baseline).`,
  );
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(process.argv.slice(2)));
}
