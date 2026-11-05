#!/usr/bin/env node
// Verification re-capture scoping for the PR auto-commit flow
// (issue #432, phase 1).
//
// The pr-autocommit flow used to prove its regenerated baselines by
// re-capturing and re-comparing the ENTIRE capture scope — a second
// full capture pass (~9.5 min on the wide run measured in #432) even
// when the pixel-diff commit gate had staged few files, or none at
// all: with zero staged files the "regenerated" set is byte-identical
// to the committed baselines, so the re-capture proved a set the
// compare pass had already proven. This module computes, from the
// staged set the commit gate built, the scope the verification pass
// actually needs:
//
//   mode "skip"   — the gate staged 0 files; verification is skipped
//                   entirely (the compare pass is the proof).
//   mode "scoped" — re-capture only the staged baselines. A staged
//                   standard baseline also pulls in its narrow
//                   counterpart when one exists (and vice versa):
//                   the two surfaces render the same story, so a
//                   change proven on one is proven against the
//                   other's regenerated-or-committed baseline too.
//   mode "full"   — the staged set exceeds
//                   VERIFY_SCOPE_MAX_STAGED_RATIO of the capture
//                   scope: scoping would save little and risks
//                   missing cross-story fallout, so verification
//                   re-captures the caller's original scope, exactly
//                   as it did before #432.
//
// The decision JSON has the scope.mjs shape ({ mode, reasons,
// standard, narrow }) so run.mjs --scope-file consumes it unchanged,
// plus the staged/total counts for the caller's logging. "full"
// decisions are written with mode "full", which run.mjs treats as
// the untouched capture set. Importable (unit tests) and runnable
// as a CLI:
//   node verifyScope.mjs --baselines <dir> --staged <dir> --capture-total <n> --out <json>

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { NARROW_PREFIXES } from "./scope.mjs";

// The named setting for the full-verification fallback (issue
// #432's approved plan: "fall back to the full re-capture when the
// staged set exceeds ~25% of the capture scope"). Above this share,
// the staged changes are wide enough that a scoped proof is not
// trusted on its own.
export const VERIFY_SCOPE_MAX_STAGED_RATIO = 0.25;

function listPngs(dir, prefix = "") {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir).sort()) {
    const path = join(dir, entry);
    const rel = prefix ? `${prefix}/${entry}` : entry;
    if (statSync(path).isDirectory()) out.push(...listPngs(path, rel));
    else if (entry.endsWith(".png")) out.push(rel);
  }
  return out;
}

// Baselines live at <theme>/<storyId>.png, with the narrow variant
// beside the standard one as <theme>/<storyId>-narrow.png (see
// run.mjs baselineFileName; compare.mjs splits the two sets by the
// same suffix). A file counts as narrow only when the stripped id
// is in the narrow capture scope (scope.mjs NARROW_PREFIXES): a
// STANDARD story whose id merely ends in "-narrow" keeps its full
// id. (A narrow-scope story id ending in "-narrow" would collide
// with its own variant's filename — the driver's naming scheme
// itself cannot tell those apart, upstream of this module.)
// Returns { storyId, narrow } or null for a path that is not a
// baseline PNG in that layout.
export function parseBaselineRel(rel) {
  const file = rel.split("/").at(-1) ?? "";
  if (!file.endsWith(".png")) return null;
  const base = file.slice(0, -".png".length);
  if (base.endsWith("-narrow")) {
    const storyId = base.slice(0, -"-narrow".length);
    if (storyId && NARROW_PREFIXES.some((p) => storyId.startsWith(p))) {
      return { storyId, narrow: true };
    }
  }
  return base ? { storyId: base, narrow: false } : null;
}

// The staged set is a full copy of the committed baselines with
// gated captures overlaid (commitGate.mjs stageGatedBaselines), so
// the files that will actually change are exactly those whose
// staged bytes differ from the committed baseline, plus new
// baselines with no committed counterpart.
function changedFiles(baselinesDir, stagedDir, stagedFiles) {
  return stagedFiles.filter((rel) => {
    const committed = join(baselinesDir, rel);
    if (!existsSync(committed)) return true;
    return !readFileSync(committed).equals(readFileSync(join(stagedDir, rel)));
  });
}

// Map the changed baseline files to the two verification story
// lists: a staged file lands in its own set, and its counterpart
// on the other surface (when that baseline exists) joins the
// other set — the two surfaces render the same story.
function scopedLists(changed, stagedFiles) {
  const standard = new Set();
  const narrow = new Set();
  const stagedSet = new Set(stagedFiles);
  for (const rel of changed) {
    const parsed = parseBaselineRel(rel);
    if (!parsed) continue;
    const theme = rel.split("/").slice(0, -1).join("/");
    const counterpart = parsed.narrow
      ? `${theme}/${parsed.storyId}.png`
      : `${theme}/${parsed.storyId}-narrow.png`;
    (parsed.narrow ? narrow : standard).add(parsed.storyId);
    if (stagedSet.has(counterpart)) (parsed.narrow ? standard : narrow).add(parsed.storyId);
  }
  return { standard: [...standard].sort(), narrow: [...narrow].sort() };
}

export function computeVerifyScope({ baselinesDir, stagedDir, captureTotal }) {
  const stagedFiles = listPngs(stagedDir);
  const changed = changedFiles(baselinesDir, stagedDir, stagedFiles);
  // The ratio's denominator is the CAPTURE SCOPE of the run that
  // produced the staged set (the commit gate's gated-capture count,
  // passed in by the caller), NOT the staged tree's file count: the
  // staged tree is a full copy of every committed baseline, so in a
  // scoped run (#114) dividing by it would understate the staged
  // share of the scope that was actually captured. Absent a count,
  // fall back to the tree size (a full-scope run, where they agree).
  const total = captureTotal ?? stagedFiles.length;
  const base = { standard: [], narrow: [], stagedCount: changed.length, totalCount: total };
  const skipReason =
    "commit gate staged 0 files — the regenerated set is byte-identical to the committed baselines, already proven by the compare pass";
  if (changed.length === 0) return { ...base, mode: "skip", reasons: [skipReason] };
  if (total > 0 && changed.length / total > VERIFY_SCOPE_MAX_STAGED_RATIO) {
    const pct = (VERIFY_SCOPE_MAX_STAGED_RATIO * 100).toFixed(0);
    const reason = `commit gate staged ${changed.length} of ${total} captures in scope (> ${pct}% of the capture scope) — full verification re-capture`;
    return { ...base, mode: "full", reasons: [reason] };
  }
  return {
    ...base,
    ...scopedLists(changed, stagedFiles),
    mode: "scoped",
    reasons: [
      `commit gate staged ${changed.length} of ${total} captures in scope — verification re-captures only the staged baselines and their counterparts (issue #432)`,
    ],
  };
}

// --- CLI ---------------------------------------------------------------

function main(argv) {
  const value = (name, fallback) => {
    const i = argv.indexOf(name);
    return i === -1 ? fallback : argv[i + 1];
  };
  const baselinesDir = value("--baselines", "");
  const stagedDir = value("--staged", "");
  const out = value("--out", "");
  // An omitted flag reads as "" and Number("") is 0, which would
  // silently pass validation and bypass the ratio check — reject
  // the empty raw value before converting (same trap
  // parseCommitGateRatio guards against in commitGate.mjs).
  const captureTotalRaw = value("--capture-total", "");
  const captureTotal = captureTotalRaw.trim() === "" ? Number.NaN : Number(captureTotalRaw);
  if (!baselinesDir || !stagedDir || !Number.isInteger(captureTotal) || captureTotal < 0) {
    console.error(
      "verify-scope FAIL (issue #432): --baselines <dir>, --staged <dir>, and --capture-total <n> are required.",
    );
    return 1;
  }
  const decision = computeVerifyScope({ baselinesDir, stagedDir, captureTotal });
  if (out) writeFileSync(out, `${JSON.stringify(decision, null, 2)}\n`);
  console.log(
    `VR verify scope (#432): ${decision.mode} — staged ${decision.stagedCount} of ${decision.totalCount} captures in scope; ` +
      `standard ${decision.standard.length}, narrow ${decision.narrow.length}. ${decision.reasons.join("; ")}`,
  );
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(process.argv.slice(2)));
}
