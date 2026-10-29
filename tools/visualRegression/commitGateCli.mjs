#!/usr/bin/env node
// CLI surface for the pixel-diff commit gate (issue #296); the
// library lives in commitGate.mjs. Used by ci/capture-compare.sh
// to build the staged baseline set for the PR auto-commit flow:
//   node commitGateCli.mjs --baselines <dir> --captures <dir>[,<dir>...]
//                          --out <stagedDir> [--summary <jsonPath>]
//                          [--threshold 16] [--max-ratio <ratio>]
//   node commitGateCli.mjs --print-gate   (prints the effective ratio)
// Exit code: 0 = staged set built (or gate printed); 1 = bad
// input, an invalid ratio override, or an undecodable PNG.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { gateRatioFromArgs, parseCommitGateRatio, stageGatedBaselines } from "./commitGate.mjs";

function argValue(args, name, fallback) {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
}

function parseStageArgs(args) {
  const parsed = {
    baselinesDir: argValue(args, "--baselines", ""),
    outDir: argValue(args, "--out", ""),
    capturesDirs: argValue(args, "--captures", "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    colorThreshold: Number(argValue(args, "--threshold", "16")),
    strictMaxRatioRaw: argValue(args, "--strict-max-ratio", "0.001"),
    summaryPath: argValue(args, "--summary", ""),
  };
  return parsed.baselinesDir && parsed.outDir && parsed.capturesDirs.length > 0 ? parsed : null;
}

function runCli() {
  const args = process.argv.slice(2);
  if (args.includes("--print-gate")) {
    console.log(String(gateRatioFromArgs(args, "--max-ratio")));
    return 0;
  }
  const parsed = parseStageArgs(args);
  if (!parsed) {
    console.error(
      "commit-gate FAIL (issue #296): --baselines <dir>, --captures <dir>[,<dir>...] and --out <dir> are required.",
    );
    return 1;
  }
  const gateRatio = gateRatioFromArgs(args, "--max-ratio");
  const strictMaxRatio = parseCommitGateRatio(parsed.strictMaxRatioRaw, "--strict-max-ratio");
  const summary = stageGatedBaselines({
    ...parsed,
    gateRatio,
    strictMaxRatio,
    log: (line) => console.log(line),
  });
  if (parsed.summaryPath) writeFileSync(parsed.summaryPath, JSON.stringify(summary, null, 2));
  return 0;
}

function main() {
  try {
    return runCli();
  } catch (error) {
    console.error(`commit-gate FAIL (issue #296): ${error.message}`);
    return 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exit(main());
