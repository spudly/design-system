/**
 * Contract test for LoadingGate (spudly/design-system#119), the
 * full-screen loading state a detail page shows while its content
 * loads: a surface-filled shell with a centered spinner.
 *
 * MealPlanDetailPage's loading branch rendered this gate inline
 * (a YStack with five styling props around a Spinner) — styling a
 * page may not apply itself under #119 — so the gate is a
 * component here and the page renders it. RecipeDetailPage and
 * PublicRecipePage render the identical gate inline today and
 * adopt this component as their de-styling tranches land.
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
const loadingGateSource = readFileSync(join(componentsDir, "LoadingGate.tsx"), "utf8");

const loadingGateCode = loadingGateSource
  .replaceAll(/\/\*[\s\S]*?\*\//g, "")
  .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("LoadingGate is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(typeof dist.LoadingGate, "function", "LoadingGate must be exported from @spudly/ui");
});

test("LoadingGateProps is a type-only export from the built components barrel", () => {
  const types = readFileSync(join(here, "..", "dist", "components", "index.d.ts"), "utf8");
  assert.match(types, /LoadingGateProps/);
});

test("LoadingGate's contract is its label, and its shell is the page loading gate", () => {
  assert.match(loadingGateCode, /export type LoadingGateProps = \{\s+label: string;\s+\};/);
  assert.match(
    loadingGateCode,
    /<YStack flex=\{1\} backgroundColor="\$surface" alignItems="center" justifyContent="center">/,
  );
  assert.match(loadingGateCode, /<Spinner label=\{label\} \/>/);
});
