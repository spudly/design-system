#!/usr/bin/env node
// Affected-stories scoping for the Android VR pipeline (issue #114).
//
// The VR job used to capture the full baseline set (57 page stories)
// on every PR, whatever the PR touched — a 20-30 minute emulator run
// gating even a one-component change. This module computes, from the
// PR's changed-file list, the stories whose renders can actually
// change, so a PR compare run captures only those. The mapping is:
//
//   changed file -> the story files whose transitive import closure
//   contains it (the component import graph over src/, built by
//   storyGraph.mjs), plus a changed story file affects itself.
//
// The bias is always toward MORE coverage: any changed file that
// feeds every render (design tokens, themes, the Tamagui config),
// anything in the capture harness itself (this tooling, the host
// app, the workflows), package manifests/lockfiles, a changed file
// that cannot be mapped (deleted src file, unparseable story file),
// or an explicit override forces the FULL set. A scoped decision is
// only emitted when every changed file was classified confidently.
//
// Consumed by ci/capture-compare.sh via run.mjs --scope-file; the
// decision JSON has the shape:
//   { mode: "full" | "scoped", reasons: [..],
//     standard: [storyIds], narrow: [storyIds] }
// The lists always carry the set the decision resolves to (the
// whole capture set for "full"); run.mjs only filters on "scoped".
// Importable (unit tests) and runnable as a CLI:
//   node scope.mjs --changed-files <list> --out <json> [--force-full]

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { buildImportGraph, collectStories, listSourceFiles } from "./storyGraph.mjs";

const TOOL_DIR = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = join(TOOL_DIR, "..", "..");

// Mirrors CAPTURE_SCOPE / NARROW_SCOPE in run.mjs (story-id
// prefixes; the driver still owns theme pairing). Keep in sync —
// the unit test cross-checks these against the committed baselines.
export const STANDARD_PREFIXES = ["pages-eciperay", "pages-memorize"];
export const NARROW_PREFIXES = ["pages-eciperay-recipespage"];

// Changed paths that feed every render or the harness itself: any
// one of them forces the full capture set (issue #114's fallback
// list — never silently reduce coverage).
const FALLBACK_PREFIXES = [
  "src/tokens/",
  "src/themes/",
  "tools/visualRegression/",
  "apps/storybook/",
  ".github/workflows/",
  ".storybook/",
];
const FALLBACK_EXACT = new Set([
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "src/tamagui.config.ts",
]);
const FALLBACK_PATTERNS = [
  /^babel\.config\.[jt]s$/,
  /^metro\.config\.[jt]s$/,
  /^tsconfig\..+\.json$/,
  /^vite\.config\.[jt]s$/,
];

export function isFallbackPath(file) {
  return (
    FALLBACK_EXACT.has(file) ||
    FALLBACK_PREFIXES.some((p) => file.startsWith(p)) ||
    FALLBACK_PATTERNS.some((re) => re.test(file))
  );
}

function inSet(ids, prefixes) {
  return ids.filter((id) => prefixes.some((p) => id.startsWith(p))).sort();
}

export function computeScope({ repoRoot, changedFiles, forceFull = false }) {
  const files = listSourceFiles(repoRoot);
  const { stories, unparseable } = collectStories(repoRoot, files);
  const allIds = stories.flatMap((s) => s.ids);
  const full = {
    mode: "full",
    reasons: [],
    standard: inSet(allIds, STANDARD_PREFIXES),
    narrow: inSet(allIds, NARROW_PREFIXES),
  };
  const asFull = (reason) => ({ ...full, reasons: [reason] });

  if (forceFull) return asFull("full run forced by override (label or dispatch input)");
  if (unparseable.length > 0) {
    return asFull(`story file(s) with no parseable CSF title: ${unparseable.join(", ")}`);
  }

  const fallbackFiles = [];
  const srcChanged = [];
  for (const raw of new Set(changedFiles)) {
    if (isFallbackPath(raw)) fallbackFiles.push(raw);
    else if (raw.startsWith("src/")) {
      // A src file missing from the tree (deleted by the PR) cannot
      // be mapped through the post-change graph — full run.
      if (existsSync(join(repoRoot, raw))) srcChanged.push(raw);
      else fallbackFiles.push(`${raw} (not in tree)`);
    }
    // Anything else (docs, tests, changesets, ...) cannot reach a
    // story render and is confidently non-affecting.
  }
  if (fallbackFiles.length > 0) {
    return asFull(`shared/harness input changed: ${fallbackFiles.join(", ")}`);
  }

  const affectedIds = affectedStoryIds(repoRoot, files, stories, srcChanged);
  return {
    mode: "scoped",
    reasons: [
      `${srcChanged.length} changed src file(s) mapped through the import graph; ` +
        `${affectedIds.size} affected stor(ies) before capture-scope filtering`,
    ],
    standard: inSet([...affectedIds], STANDARD_PREFIXES),
    narrow: inSet([...affectedIds], NARROW_PREFIXES),
  };
}

// Reverse reachability over the import graph: for each changed
// file, every story file that (transitively) imports it is
// affected, and a changed story file affects itself (it is its
// own BFS start node).
function affectedStoryIds(repoRoot, files, stories, srcChanged) {
  const edges = buildImportGraph(repoRoot, files);
  const importers = new Map();
  for (const [from, targets] of edges) {
    for (const target of targets) {
      if (!importers.has(target)) importers.set(target, new Set());
      importers.get(target).add(from);
    }
  }
  const idsByFile = new Map(stories.map((s) => [s.file, s.ids]));
  const affectedIds = new Set();
  for (const changed of srcChanged) {
    const seen = new Set([changed]);
    const queue = [changed];
    while (queue.length > 0) {
      const current = queue.pop();
      for (const id of idsByFile.get(current) ?? []) affectedIds.add(id);
      for (const importer of importers.get(current) ?? []) {
        if (!seen.has(importer)) {
          seen.add(importer);
          queue.push(importer);
        }
      }
    }
  }
  return affectedIds;
}

// --- CLI ---------------------------------------------------------------

function main(argv) {
  const value = (name, fallback) => {
    const i = argv.indexOf(name);
    return i === -1 ? fallback : argv[i + 1];
  };
  const repoRoot = value("--repo-root", DEFAULT_ROOT);
  const changedPath = value("--changed-files", "");
  const changedFiles = changedPath
    ? readFileSync(changedPath, "utf8")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
    : [];
  const decision = computeScope({
    repoRoot,
    changedFiles,
    forceFull: argv.includes("--force-full"),
  });
  const json = JSON.stringify(decision, null, 2);
  const out = value("--out", "");
  if (out) writeFileSync(out, `${json}\n`);
  console.log(
    `VR scope (#114): ${decision.mode} — standard ${decision.standard.length}, ` +
      `narrow ${decision.narrow.length}. ${decision.reasons.join("; ")}`,
  );
  if (!out) console.log(json);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2));
}
