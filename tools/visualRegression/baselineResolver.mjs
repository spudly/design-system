// Baseline resolver for the Android VR pipeline (issue #530,
// PR 3 of 3): committed baselines no longer live in one central
// tree — they are colocated with the story files they capture,
// in `__snapshots__/` directories under src/, named
// `<StoryFileBase>--<storyExport>--<theme>.png` (the narrow
// variant carries a `--narrow` segment before the theme:
// `<StoryFileBase>--<storyExport>--narrow--<theme>.png`). The
// prefix is the story file's exact base name, per Stephen's
// test-colocation convention (2026-11-07); the theme is a
// filename suffix, which his snapshot-naming ruling permits.
//
// This module is the single place that maps between the three
// names a baseline has: its storyId + theme (the capture side),
// its colocated path (the committed side), and its canonical
// tree name `<theme>/<storyId>.png` / `<theme>/<storyId>-narrow.png`
// (the pipeline's intermediate sets — fresh captures, the commit
// gate's staged set, artifacts; baselinesLayout.mjs converts
// between the committed layout and that tree).
//
// The storyId side comes from storyGraph.mjs's story index (CSF
// title + export names parsed from the story files), so a rename
// of a story file or export moves its baselines' resolved paths
// with it — the scope test pins the committed set against the
// index in both directions.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join } from "node:path";

import {
  collectStories,
  listSourceFiles,
  parseStoryFile,
  sanitizeStoryPart,
  storyNameFromExport,
} from "./storyGraph.mjs";

// The story file's exact base name ("RecipesPage" for
// src/pages/RecipesPage.stories.tsx) — the prefix of every
// baseline file that captures one of its stories.
export function storyFileBase(file) {
  return basename(file).replace(/\.stories\.(?:ts|tsx|js|jsx)$/, "");
}

// The story index the resolver works from: one entry per story
// with its id, its file, the file's base name, and its export
// slug (the part of the storyId after the title's). `byId` maps
// storyId -> entry; `byFileKey` maps "<base>|<exportSlug>" ->
// entry (the direction a colocated filename resolves in).
export function buildStoryIndex(repoRoot, files = listSourceFiles(repoRoot)) {
  const { stories, unparseable } = collectStories(repoRoot, files);
  const byId = new Map();
  const byFileKey = new Map();
  for (const story of stories) {
    const { storyExports } = parseStoryFile(readFileSync(join(repoRoot, story.file), "utf8"));
    const base = storyFileBase(story.file);
    for (const [i, name] of storyExports.entries()) {
      const entry = {
        storyId: story.ids[i],
        file: story.file,
        base,
        exportSlug: sanitizeStoryPart(storyNameFromExport(name)),
      };
      byId.set(entry.storyId, entry);
      byFileKey.set(`${base}|${entry.exportSlug}`, entry);
    }
  }
  return { byId, byFileKey, unparseable };
}

// The committed baseline's file name for one capture.
export function baselineFileNameFor(entry, theme, narrow = false) {
  return `${entry.base}--${entry.exportSlug}${narrow ? "--narrow" : ""}--${theme}.png`;
}

// Repo-relative colocated path of a story's committed baseline,
// or null when the storyId is not in the index.
export function baselineRelPath(index, storyId, theme, narrow = false) {
  const entry = index.byId.get(storyId);
  if (!entry) return null;
  return `${dirname(entry.file)}/__snapshots__/${baselineFileNameFor(entry, theme, narrow)}`;
}

// Parse a colocated baseline file name back into its parts, or
// null when the name cannot be one. Export slugs never contain
// "--" (sanitizeStoryPart collapses runs to a single dash), so
// the segments split cleanly: base, export slug, optional
// "narrow", theme.
export function parseBaselineFileName(name) {
  if (!name.endsWith(".png")) return null;
  const parts = name.slice(0, -".png".length).split("--");
  if (parts.length < 3) return null;
  const theme = parts.at(-1);
  const narrow = parts.at(-2) === "narrow";
  const exportSlug = parts.slice(1, narrow ? -2 : -1).join("--");
  if (!parts[0] || !exportSlug || !theme) return null;
  return { base: parts[0], exportSlug, narrow, theme };
}

// The canonical tree name of a baseline (`<theme>/<storyId>.png`,
// narrow: `<theme>/<storyId>-narrow.png`) — the layout the
// capture pipeline's intermediate sets use.
export function canonicalBaselineRel({ storyId, theme, narrow = false }) {
  return `${theme}/${storyId}${narrow ? "-narrow" : ""}.png`;
}

function walkSnapshotDirs(dir, out) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (!statSync(full).isDirectory()) continue;
    if (entry === "__snapshots__") out.push(full);
    else walkSnapshotDirs(full, out);
  }
  return out;
}

// Every committed baseline on disk, resolved through the story
// index: { storyId, theme, narrow, relPath } with relPath the
// repo-relative colocated path. A PNG under a `__snapshots__/`
// directory that the index cannot place (unknown story file or
// export, or an unparseable name) lands in `orphans` — the scope
// test fails on any orphan, so a baseline can never silently
// detach from its story.
export function listCommittedBaselines(repoRoot) {
  const index = buildStoryIndex(repoRoot);
  const baselines = [];
  const orphans = [];
  for (const dir of walkSnapshotDirs(join(repoRoot, "src"), [])) {
    for (const name of readdirSync(dir)) {
      if (!name.endsWith(".png")) continue;
      const relPath = `${dir.slice(repoRoot.length + 1)}/${name}`;
      const parsed = parseBaselineFileName(name);
      const entry = parsed ? index.byFileKey.get(`${parsed.base}|${parsed.exportSlug}`) : null;
      if (!parsed || !entry) orphans.push(relPath);
      else {
        baselines.push({
          storyId: entry.storyId,
          theme: parsed.theme,
          narrow: parsed.narrow,
          relPath,
        });
      }
    }
  }
  baselines.sort((a, b) => a.relPath.localeCompare(b.relPath));
  orphans.sort();
  return { index, baselines, orphans };
}
