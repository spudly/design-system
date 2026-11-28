/**
 * Contract tests for the shipped shell/heading components of
 * the #119 dedupe set: SectionHeading (the canonical section
 * heading). Each owns its treatment outright — the pins hold the
 * treatments and the package-root exports. (ScreenShell, the
 * set's fixed-shell frame, was retired by #741: its frame is
 * inlined into RecipeDetailPage and ScrollShell, and its pins
 * moved with it.)
 *
 * Toolbar — the recipedetail tranche's pinned bar — joins the
 * set in the #119 extraction round and is pinned here;
 * StatusMessage retired into CenteredText
 * (src/widgets/content/CenteredText.test.ts) in the dedupe.
 */
import "../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { loadInternalDist } from "../../test/internalDist.js";

const here = dirname(fileURLToPath(import.meta.url));

function code(file: string) {
  return readFileSync(join(here, "../..", "src", "widgets", file), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

test("the shell components are exported from the built internal components barrel", async () => {
  const dist: Record<string, any> = await loadInternalDist();
  for (const name of ["SectionHeading", "Toolbar"]) {
    assert.equal(
      typeof dist[name],
      "function",
      `${name} must be exported from the internal components barrel`,
    );
  }
});

test("Toolbar owns the pinned bar's inset, gap, wrap, and hairline divider", () => {
  const toolbar = code("actions/Toolbar.tsx");
  // #746 (Option B): no styled root — the bar renders a Row
  // carrying the frame in props, and ToolbarProps omits the
  // bar-owned subset keys from RowProps.
  assert.match(toolbar, /<Row\s+wrap\s+middle\s+gap="s"\s+px="l"\s+py="m"/);
  assert.match(
    toolbar,
    /borderBottomWidth=\{1\}\s+borderBottomColor=\{tokens\.colors\.gray\.gray2\}/,
  );
  for (const owned of [
    "wrap",
    "middle",
    "gap",
    "borderBottomWidth",
    "borderBottomColor",
    "px",
    "py",
  ]) {
    assert.match(
      toolbar,
      new RegExp(String.raw`"${owned}"`),
      `ToolbarProps must omit the bar-owned ${owned}`,
    );
  }
  assert.match(toolbar, /export type ToolbarProps = Omit<\s+RowProps,/);
});

test("SectionHeading is the subheading treatment with no baked-in padding", () => {
  const heading = code("content/SectionHeading.tsx");
  assert.match(
    heading,
    /<Text\s+variant="subheading"\s+accessibilityRole="header"\s+aria-level=\{2\}\s*>/,
  );
  assert.doesNotMatch(
    heading,
    /padding/,
    "the heading carries no inset or offset — the parent owns separation (Stephen's dedupe ruling)",
  );
});

test("SectionHeading carries the header role at level 2 (#317)", () => {
  const heading = code("content/SectionHeading.tsx");
  assert.match(
    heading,
    /accessibilityRole="header"/,
    "SectionHeading must carry the RN header role explicitly (#317)",
  );
  assert.match(
    heading,
    /aria-level=\{2\}/,
    "SectionHeading must carry heading level 2 explicitly — under the page title's level 1 (#263 regime, #317)",
  );
});
