#!/usr/bin/env node
// Baseline layout bridge (issue #530, PR 3 of 3). Committed
// baselines live colocated beside their story files
// (src/**/__snapshots__/, resolved by baselineResolver.mjs),
// while the capture pipeline's intermediate sets — fresh
// captures, the commit gate's staged set, the workflow
// artifacts — keep the canonical tree layout
// (<theme>/<storyId>.png). This module converts between them:
// materialize (committed baselines -> a canonical tree: the
// compare / commit-gate / guard / verify inputs), publish (a
// canonical tree -> the colocated paths, mirroring — a committed
// baseline absent from the tree is deleted; the write-back the
// workflow's commit jobs run), and resolveBaselinesDir (accept
// either layout for a --baselines argument, hand back a tree).
// Runnable as a CLI (ci/capture-compare.sh, the commit jobs):
//   node baselinesLayout.mjs materialize --out <treeDir>
//   node baselinesLayout.mjs publish --from <treeDir>
// [--repo-root <dir> overrides the repo root (default: this
// file's repo).]

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { baselineRelPath, buildStoryIndex, listCommittedBaselines } from "./baselineResolver.mjs";

const TOOL_DIR = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_REPO_ROOT = join(TOOL_DIR, "..", "..");

// A --baselines argument names either a repo root (the committed
// colocated layout) or a canonical tree dir (an intermediate
// set). The repo root is the one with src/ and this tooling in
// it; anything else is treated as a tree.
export function baselinesLayoutOf(dir) {
  return existsSync(join(dir, "src")) && existsSync(join(dir, "tools", "visualRegression"))
    ? "repo"
    : "tree";
}

function orphanError(orphans) {
  return new Error(`committed baseline(s) the story index cannot place: ${orphans.join(", ")}`);
}

// Copy the committed (colocated) baselines into a canonical
// tree at outDir. Returns the baseline count. Throws on orphans:
// staging or comparing against a set that silently dropped a
// baseline would understate the committed set.
export function materializeBaselines(repoRoot, outDir) {
  const { baselines, orphans } = listCommittedBaselines(repoRoot);
  if (orphans.length > 0) throw orphanError(orphans);
  for (const b of baselines) {
    const dest = join(outDir, b.theme, `${b.storyId}${b.narrow ? "-narrow" : ""}.png`);
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(join(repoRoot, b.relPath), dest);
  }
  return baselines.length;
}

function listTreePngs(dir, prefix = "") {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir).sort()) {
    const rel = prefix ? `${prefix}/${entry}` : entry;
    if (statSync(join(dir, entry)).isDirectory()) out.push(...listTreePngs(join(dir, entry), rel));
    else if (entry.endsWith(".png")) out.push(rel);
  }
  return out;
}

// Parse a canonical tree path (<theme>/<storyId>[-narrow].png).
function parseTreeRel(rel) {
  const slash = rel.indexOf("/");
  if (slash === -1) return null;
  const theme = rel.slice(0, slash);
  let base = rel.slice(slash + 1);
  if (!base.endsWith(".png")) return null;
  base = base.slice(0, -".png".length);
  const narrow = base.endsWith("-narrow");
  const storyId = narrow ? base.slice(0, -"-narrow".length) : base;
  return storyId ? { theme, storyId, narrow } : null;
}

// Write a canonical tree back to the colocated committed paths,
// mirroring: a committed baseline whose canonical name is not in
// the tree is deleted (a retired story's baseline leaves with
// its staged set, exactly as the old rsync --delete behaved).
// Returns { published, deleted }.
export function publishBaselines(repoRoot, treeDir) {
  const { index, baselines, orphans } = listCommittedBaselines(repoRoot);
  if (orphans.length > 0) throw orphanError(orphans);
  const kept = new Set();
  let published = 0;
  for (const rel of listTreePngs(treeDir)) {
    const parsed = parseTreeRel(rel);
    const relPath = parsed
      ? baselineRelPath(index, parsed.storyId, parsed.theme, parsed.narrow)
      : null;
    if (!relPath) {
      throw new Error(
        `staged baseline ${rel} does not resolve to a story in the index — refusing to publish`,
      );
    }
    const dest = join(repoRoot, relPath);
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(join(treeDir, rel), dest);
    kept.add(rel);
    published++;
  }
  let deleted = 0;
  for (const b of baselines) {
    const canonical = `${b.theme}/${b.storyId}${b.narrow ? "-narrow" : ""}.png`;
    if (!kept.has(canonical)) {
      rmSync(join(repoRoot, b.relPath));
      deleted++;
    }
  }
  return { published, deleted };
}

// Hand back a canonical tree dir for a --baselines argument of
// either layout (see baselinesLayoutOf): a tree passes through;
// a repo root materializes into a fresh temp dir.
export function resolveBaselinesDir(dir) {
  if (baselinesLayoutOf(dir) === "tree") return dir;
  const out = mkdtempSync(join(tmpdir(), "dsvr-baselines-tree-"));
  materializeBaselines(dir, out);
  return out;
}

// The driver's per-story baseline path (deviceMode.mjs): in
// tree layout the canonical join; in repo layout the resolved
// colocated path — or null when the story is not in the index
// (the caller falls back to the canonical join, which simply
// does not exist, i.e. "no baseline yet"). The index is built
// once per baselines root.
const indexByRoot = new Map();
export function resolveBaselinePath(config, storyId, theme) {
  const narrow = config.variant === "narrow";
  if (config.baselinesLayout !== "repo") {
    return join(config.baselinesDir, theme, `${storyId}${narrow ? "-narrow" : ""}.png`);
  }
  if (!indexByRoot.has(config.baselinesDir)) {
    indexByRoot.set(config.baselinesDir, buildStoryIndex(config.baselinesDir));
  }
  const rel = baselineRelPath(indexByRoot.get(config.baselinesDir), storyId, theme, narrow);
  return rel ? join(config.baselinesDir, rel) : null;
}

// --- CLI ---------------------------------------------------------------

function main(argv) {
  const value = (name, fallback) => {
    const i = argv.indexOf(name);
    return i === -1 ? fallback : argv[i + 1];
  };
  const repoRoot = value("--repo-root", DEFAULT_REPO_ROOT);
  const [command] = argv;
  try {
    if (command === "materialize") {
      const out = value("--out", "");
      if (!out) throw new Error("materialize requires --out <treeDir>");
      const n = materializeBaselines(repoRoot, out);
      console.log(`materialized ${n} committed baseline(s) into ${out}`);
      return 0;
    }
    if (command === "publish") {
      const from = value("--from", "");
      if (!from) throw new Error("publish requires --from <treeDir>");
      const { published, deleted } = publishBaselines(repoRoot, from);
      console.log(`published ${published} baseline(s) from ${from}; deleted ${deleted} stale`);
      return 0;
    }
    throw new Error("usage: baselinesLayout.mjs materialize --out <dir> | publish --from <dir>");
  } catch (error) {
    console.error(`baselines-layout FAIL (issue #530): ${error.message}`);
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(process.argv.slice(2)));
}
