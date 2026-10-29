#!/usr/bin/env node
// Coverage-listing generation for the Android VR pipeline
// (issue #284).
//
// The table between the VR-COVERAGE markers in
// docs/android-visual-regression.md records, per story group, how
// many stories the derived capture set contains and how many
// committed baselines exist for them. It used to be maintained by
// hand: the baseline auto-commit jobs refreshed the PNGs but not
// the listing, so the scope test went red on the follow-up run
// until a human refreshed the table (seen on PR #271).
//
// This module is the single source of that table. It derives every
// number from the same inputs the scope test verifies — the full
// capture set from scope.mjs and the baseline files on disk — and
// renders the markdown. The workflow's commit jobs run it after
// syncing regenerated baselines and stage the docs file in the
// same bot commit; the scope test imports the generator and stays
// a pure verification that the committed table matches.
//
// Runnable as a CLI (updates the docs file in place, exits 0
// whether or not it changed):
//   node tools/visualRegression/coverageListing.mjs
// Importable (unit tests):
//   buildCoverageRows / renderCoverageTable /
//   generateCoverageDocs / readBaselineFiles

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { computeScope } from "./scope.mjs";

export const DOCS_PATH = "docs/android-visual-regression.md";
export const BEGIN_MARKER = "<!-- VR-COVERAGE-BEGIN -->";
export const END_MARKER = "<!-- VR-COVERAGE-END -->";

const TOOL_DIR = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = join(TOOL_DIR, "..", "..");

export const themeOfStory = (id) =>
  id.startsWith("pages-memorize") ? "light_quietDawn" : "light_warmHarvest";
export const groupOfStory = (id) => id.split("--")[0];

export function readBaselineFiles(baselineRoot) {
  const files = new Map();
  for (const theme of readdirSync(baselineRoot)) {
    const dir = join(baselineRoot, theme);
    if (!statSync(dir).isDirectory()) continue;
    files.set(theme, new Set(readdirSync(dir).filter((f) => f.endsWith(".png"))));
  }
  return files;
}

function derivedGroupsOf(scope) {
  const groups = new Map();
  for (const id of scope.standard) {
    const key = groupOfStory(id);
    if (!groups.has(key)) groups.set(key, { theme: themeOfStory(id), standard: [], narrow: [] });
    groups.get(key).standard.push(id);
  }
  for (const id of scope.narrow) groups.get(groupOfStory(id)).narrow.push(id);
  return groups;
}

const countBaselines = (ids, files, suffix) =>
  ids.filter((id) => files?.has(`${id}${suffix}`)).length;

// One row per derived group, with a group's narrow-variant row
// immediately after it, then the totals the rows add up to.
export function buildCoverageRows(scope, baselineFiles) {
  const rows = [];
  for (const [key, group] of derivedGroupsOf(scope)) {
    rows.push({
      group: key,
      theme: group.theme,
      stories: group.standard.length,
      baselines: countBaselines(group.standard, baselineFiles.get(group.theme), ".png"),
    });
    if (group.narrow.length > 0) {
      rows.push({
        group: `${key} — narrow variant`,
        theme: "light_warmHarvest",
        stories: group.narrow.length,
        baselines: countBaselines(
          group.narrow,
          baselineFiles.get("light_warmHarvest"),
          "-narrow.png",
        ),
      });
    }
  }
  return rows;
}

// Markdown table with the docs file's established formatting:
// columns padded to their widest cell, numeric columns
// right-aligned, the total row bolded.
export function renderCoverageTable(rows) {
  const total = {
    group: "**Total**",
    theme: "",
    stories: `**${rows.reduce((sum, r) => sum + r.stories, 0)}**`,
    baselines: `**${rows.reduce((sum, r) => sum + r.baselines, 0)}**`,
  };
  const body = rows.map((r) => ({
    group: r.group,
    theme: r.theme,
    stories: String(r.stories),
    baselines: String(r.baselines),
  }));
  const all = [
    { group: "Story group", theme: "Theme", stories: "Stories", baselines: "Baselines" },
    ...body,
    total,
  ];
  const width = (key) => Math.max(...all.map((r) => r[key].length));
  const widths = {
    group: width("group"),
    theme: width("theme"),
    stories: width("stories"),
    baselines: width("baselines"),
  };
  const row = (r) =>
    `| ${r.group.padEnd(widths.group)} | ${r.theme.padEnd(widths.theme)} | ${r.stories.padStart(widths.stories)} | ${r.baselines.padStart(widths.baselines)} |`;
  const separator = `| ${"-".repeat(widths.group)} | ${"-".repeat(widths.theme)} | ${"-".repeat(widths.stories - 1)}: | ${"-".repeat(widths.baselines - 1)}: |`;
  return [row(all[0]), separator, ...body.map(row), row(total)].join("\n") + "\n";
}

export function coverageTableForRepo(repoRoot) {
  const scope = computeScope({ repoRoot, changedFiles: [], forceFull: true });
  const baselineFiles = readBaselineFiles(join(repoRoot, "tools/visualRegression/baselines"));
  return renderCoverageTable(buildCoverageRows(scope, baselineFiles));
}

// The docs text with the marked block replaced by the generated
// table. Pure: callers decide whether to write it back.
export function generateCoverageDocs(repoRoot, docs) {
  const begin = docs.indexOf(BEGIN_MARKER);
  const end = docs.indexOf(END_MARKER);
  if (begin === -1 || end <= begin) throw new Error(`coverage markers missing in ${DOCS_PATH}`);
  const afterBegin = begin + BEGIN_MARKER.length;
  return `${docs.slice(0, afterBegin)}\n\n${coverageTableForRepo(repoRoot)}\n${docs.slice(end)}`;
}

function main() {
  const docsPath = join(DEFAULT_ROOT, DOCS_PATH);
  const before = readFileSync(docsPath, "utf8");
  const after = generateCoverageDocs(DEFAULT_ROOT, before);
  if (after === before) {
    console.log("VR coverage listing already up to date.");
  } else {
    writeFileSync(docsPath, after);
    console.log("VR coverage listing refreshed in docs/android-visual-regression.md.");
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
