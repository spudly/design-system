#!/usr/bin/env node
// Capture sharding for the Android VR pipeline (issue #432, phase 2).
//
// Phase 1 scoped the pr-autocommit verification re-capture to the
// staged baselines; the remaining wide-run cost is the FIRST capture
// pass itself (~9.3 min of the ~27 min capture step measured in
// #432, on top of ~9 min of emulator boot + APK build that a serial
// job pays once). This module splits one scope decision
// (scope.mjs's { mode, reasons, standard, narrow }) into N disjoint
// shard decisions so the workflow can run the compare pass on a
// matrix of parallel emulator jobs:
//
//   - standard and narrow lists are partitioned INDEPENDENTLY (the
//     two sets are captured under different display settings), each
//     sorted first so the split is a pure function of the decision:
//     the same scope file always yields the same shards, on any
//     machine, with no coordination between the shard jobs.
//   - assignment is round-robin over the sorted list (story i goes
//     to shard i % N), which spreads same-prefix story families —
//     whose render costs are similar — evenly across the shards
//     instead of handing one shard a whole expensive family.
//   - the shards are disjoint and their union is EXACTLY the input
//     lists, so a sharded run captures precisely the set a serial
//     run would — the property the phase-2 acceptance ("sharded
//     baselines identical to a serial run on the same head") rests
//     on. The unit tests pin disjointness + union for both lists.
//
// How many shards: planShardCount() is the workflow plan job's
// decision. At or below SHARD_SERIAL_MAX_CAPTURES total captures
// the fixed per-job overhead (emulator boot + APK build, ~9 min
// measured in #432) dwarfs the capture time a second shard could
// save, so the run stays serial (one shard — the pre-#432 shape,
// driven through the same pipeline). Above it, the run fans out to
// MAX_SHARDS, capped at the capture count so no shard job boots an
// emulator to capture nothing. Update mode never shards (the plan
// job forces one shard): update writes baselines in-tree through
// the commit gate, a manual dispatch whose correctness argument is
// the serial write path.
//
// Importable (unit tests) and runnable as a CLI:
//   node shardScope.mjs --scope <decision.json> --index <i> --count <n> --out <json>
//   node shardScope.mjs --scope <decision.json> --plan [--force-serial]
//     -> prints {"shards":[0..n-1],"shardCount":n,"total":t} for the
//        workflow plan job's $GITHUB_OUTPUT step.

import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

// The wide-run fan-out (issue #432's approved plan: "recommend 4
// shards"). Four emulator jobs put the measured 145-capture wide
// run's capture pass at ~36 captures per shard — a few minutes —
// while the per-shard boot/build overhead runs in parallel instead
// of stacking.
export const MAX_SHARDS = 4;

// At or below this many total captures (standard + narrow) a run
// stays on one shard. Named here, not in the workflow, so the
// threshold is reviewable with the rest of the VR tooling's named
// settings (cf. VERIFY_SCOPE_MAX_STAGED_RATIO, COMMIT_GATE_MAX_RATIO).
export const SHARD_SERIAL_MAX_CAPTURES = 20;

// Decide the shard count for one scope decision. forceSerial pins
// the run to one shard regardless of size (update mode — see the
// header comment). A zero-capture decision still gets one shard:
// the serial job is what logs the empty scope and passes.
export function planShardCount(decision, { forceSerial = false } = {}) {
  const total = decision.standard.length + decision.narrow.length;
  if (forceSerial || total <= SHARD_SERIAL_MAX_CAPTURES) return 1;
  return Math.min(MAX_SHARDS, total);
}

// Partition one sorted story list round-robin across `count`
// shards and return shard `index`'s slice. The input list is
// copied and sorted first: callers may hand in any order, and the
// split must depend only on the SET, never on incidental ordering.
export function shardSlice(list, index, count) {
  return [...list].sort().filter((_, i) => i % count === index);
}

// Split a scope decision into shard `index` of `count`. A one-shard
// split returns the decision unchanged (mode included — a "full"
// decision stays full, so run.mjs takes the untouched capture set
// exactly as a serial run would). A multi-shard split is always
// mode "scoped": run.mjs must restrict each emulator to its slice,
// even when the parent decision was "full".
export function splitScope(decision, index, count) {
  if (!Number.isInteger(count) || count < 1) {
    throw new TypeError(`shard count must be a positive integer, got ${JSON.stringify(count)}`);
  }
  if (!Number.isInteger(index) || index < 0 || index >= count) {
    throw new TypeError(
      `shard index must be an integer in [0, ${count}), got ${JSON.stringify(index)}`,
    );
  }
  if (!Array.isArray(decision.standard) || !Array.isArray(decision.narrow)) {
    throw new TypeError("scope decision is missing its standard/narrow story lists");
  }
  if (count === 1) return decision;
  return {
    mode: "scoped",
    reasons: [
      ...(decision.reasons ?? []),
      `shard ${index + 1} of ${count} (issue #432 phase 2): round-robin slice of the ${decision.mode} capture set`,
    ],
    standard: shardSlice(decision.standard, index, count),
    narrow: shardSlice(decision.narrow, index, count),
  };
}

// --- CLI ---------------------------------------------------------------

function value(argv, name, fallback) {
  const i = argv.indexOf(name);
  return i === -1 ? fallback : argv[i + 1];
}

function main(argv) {
  const scopePath = value(argv, "--scope", "");
  if (!scopePath) {
    console.error("shard-scope FAIL (issue #432): --scope <decision.json> is required.");
    return 1;
  }
  const decision = JSON.parse(readFileSync(scopePath, "utf8"));
  if (argv.includes("--plan")) {
    const shardCount = planShardCount(decision, { forceSerial: argv.includes("--force-serial") });
    const total = decision.standard.length + decision.narrow.length;
    console.log(
      JSON.stringify({
        shards: Array.from({ length: shardCount }, (_, i) => i),
        shardCount,
        total,
      }),
    );
    return 0;
  }
  const index = Number(value(argv, "--index", ""));
  const count = Number(value(argv, "--count", ""));
  const shard = splitScope(decision, index, count);
  const out = value(argv, "--out", "");
  if (out) writeFileSync(out, `${JSON.stringify(shard, null, 2)}\n`);
  console.log(
    `VR shard scope (#432): shard ${index + 1} of ${count} — standard ${shard.standard.length}, narrow ${shard.narrow.length}.`,
  );
  if (!out) console.log(JSON.stringify(shard, null, 2));
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(process.argv.slice(2)));
}
