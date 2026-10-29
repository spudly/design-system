/**
 * Contract test for RecipeOverviewPanel
 * (spudly/design-system#119), a recipe's overview header block —
 * hero image, title, status badge, description, stat band, tag
 * row — shared by the two recipe surfaces, which each carried it
 * inline before it moved here. Its invariants: the hero renders
 * only with an image (through Thumbnail's hero frame), the
 * status badge map is DS-owned with the "idea" fallback, the
 * stat band composes StatBand/StatCard with conditional Prep and
 * Cook stats, and tags render through Badge's color form (#207).
 *
 * Source scan plus a dist export check, like the other component
 * contract tests. The dist import needs the harness's
 * react-native-svg stub registered first, so this file imports
 * registerSvgStub.mjs before anything else.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const componentsDir = join(here, "..", "src", "components");
const panelSource = readFileSync(join(componentsDir, "RecipeOverviewPanel.tsx"), "utf8");

const panelCode = panelSource
  .replaceAll(/\/\*[\s\S]*?\*\//g, "")
  .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("RecipeOverviewPanel is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(
    typeof dist.RecipeOverviewPanel,
    "function",
    "RecipeOverviewPanel must be exported from @spudly/ui",
  );
});

test("RecipeOverviewPanel's types are type-only exports from the built components barrel", () => {
  const types = readFileSync(join(here, "..", "dist", "components", "index.d.ts"), "utf8");
  assert.match(types, /RecipeOverviewPanelProps/);
  assert.match(types, /RecipeOverviewPanelTag/);
});

test("the panel composes the shared building blocks with its conditional content", () => {
  assert.match(panelCode, /\{imageUrl \? \(/, "the hero renders only with an imageUrl");
  assert.match(panelCode, /<Thumbnail src=\{imageUrl\} \/>/, "the hero is Thumbnail's hero frame");
  assert.match(panelCode, /\{description \? \(/, "the description renders only when present");
  assert.match(panelCode, /<StatBand>/, "the stat band is the shared StatBand");
  assert.match(panelCode, /<StatCard label="Servings" value=\{servingsLabel\} \/>/);
  assert.match(panelCode, /\{prepTimeLabel \? <StatCard label="Prep"/);
  assert.match(panelCode, /\{cookTimeLabel \? <StatCard label="Cook"/);
  assert.match(panelCode, /\{tags\.length > 0 \? \(/, "the tag row renders only with tags");
  assert.match(panelCode, /<Badge key=\{tag\.id\} color=\{tag\.color\}>/, "tags render as Badge");
  assert.ok(!panelCode.includes("{tag.color}22"), "no inline tag tint");
});

test("the status badge map is DS-owned with the idea fallback", () => {
  for (const [status, label] of [
    ["idea", "Idea"],
    ["evolving", "Evolving"],
    ["perfected", "Perfected"],
    ["abandoned", "Abandoned"],
  ]) {
    assert.ok(
      panelCode.includes(`${status}: { label: "${label}"`),
      `STATUS_BADGES must map ${status} to ${label}`,
    );
  }
  assert.match(panelCode, /STATUS_BADGES\[status\] \?\? STATUS_BADGES\.idea/);
  assert.ok(!panelCode.includes("lineHeight"), "the panel must not set lineHeight");
});
