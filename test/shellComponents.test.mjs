/**
 * Contract tests for the shipped shell/heading components of
 * the #119 dedupe set: ScreenShell (the fixed-shell frame) and
 * SectionHeading (the canonical section heading). Each owns its
 * treatment outright — the pins hold the treatments and the
 * package-root exports.
 *
 * The recipedetail tranche's version of this file also pinned
 * Toolbar and StatusMessage; neither ships here — Toolbar stays
 * with its tranche, and StatusMessage retired into CenteredText
 * (test/centeredText.test.mjs) in the dedupe.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

function code(file) {
  return readFileSync(join(here, "..", "src", "components", file), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

test("the shell components are exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  for (const name of ["ScreenShell", "SectionHeading"]) {
    assert.equal(typeof dist[name], "function", `${name} must be exported from @spudly/ui`);
  }
});

test("ScreenShell owns the fixed-shell frame", () => {
  const shell = code("ScreenShell.tsx");
  assert.match(shell, /styled\(YStack, \{\s+name: "ScreenShell",/);
  assert.match(shell, /flex: 1,\s+backgroundColor: "\$surface",/);
  assert.match(shell, /Omit<StyledScreenShellProps, "flex" \| "backgroundColor">/);
});

test("SectionHeading is the subheading treatment with no baked-in padding", () => {
  const heading = code("SectionHeading.tsx");
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
  const heading = code("SectionHeading.tsx");
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
