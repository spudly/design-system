/**
 * Contract test for ScrollRegion (spudly/design-system#119), the
 * shared inner scroll region extracted for the page de-styling
 * program's foundation: RecipeDetailPage, PublicRecipePage, and
 * RecipeFormPage each render the identical ScrollView — `flex: 1`
 * with `keyboardShouldPersistTaps="handled"` — under their pinned
 * chrome. The region owns that treatment so the pages compose it
 * without rendering a layout primitive (#119 bans ScrollView in
 * pages outright).
 *
 * The pins hold the shape: exported from the package root, the
 * contract is children only, and the ScrollView carries the
 * treatments the three pages render today plus web keyboard
 * focus (`tabIndex={0}`), so a region whose content has no
 * focusable element stays scrollable from the keyboard.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "components", "ScrollRegion.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("ScrollRegion is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(
    typeof dist.ScrollRegion,
    "function",
    "ScrollRegion must be exported from @spudly/ui",
  );
});

test("ScrollRegionProps is a type-only export from the built components barrel", () => {
  const types = readFileSync(join(here, "..", "dist", "components", "index.d.ts"), "utf8");
  assert.match(types, /ScrollRegionProps/);
});

test("the contract is children only — no styling surface", () => {
  assert.match(code, /export type ScrollRegionProps = \{\s+children: ReactNode;\s+\};/);
});

test("the region fills its shell, keeps taps landing with the keyboard open, and is keyboard-focusable on web", () => {
  assert.match(code, /<ScrollView flex=\{1\} keyboardShouldPersistTaps="handled" tabIndex=\{0\}>/);
});
