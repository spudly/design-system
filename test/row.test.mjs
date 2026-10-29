/**
 * Contract test for Row (spudly/design-system#119), the DS layout
 * row pages compose instead of rendering a Tamagui stack with
 * styling props of their own.
 *
 * Row is the layout-wrapper building block of the #119 page-fix
 * program (the audit's block 2): pages name the intent through
 * semantic props — `spacing` (gap step), `align` (cross-axis
 * alignment), `spaceBefore` (space above the row) — and Row owns
 * the style values on the spacing scale. The pins below hold
 * that shape: the styled base is an XStack named "Row", every
 * variant value comes from the spacing tokens, and the semantic
 * prop names are the public API.
 *
 * SearchField's `grow` prop is pinned here too: it is the other
 * half of the inline-form-row pattern Row enables (the field
 * takes the row's remaining width), added for VerseSearchPage's
 * search row in the same #119 tranche.
 *
 * Source scan plus a dist export check, like the other component
 * contract tests: the invariants are per-literal properties of
 * the source and of the built package surface. The dist import
 * needs the harness's react-native-svg stub registered first
 * (the root entry's graph reaches the icons module), so this
 * file imports registerSvgStub.mjs before anything else, like
 * the accordion and dropdown contract tests.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const componentsDir = join(here, "..", "src", "components");
const rowSource = readFileSync(join(componentsDir, "Row.tsx"), "utf8");
const searchFieldSource = readFileSync(join(componentsDir, "SearchField.tsx"), "utf8");

const rowCode = rowSource.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("Row is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(typeof dist.Row, "function", "Row must be exported from @spudly/ui");
});

test("Row's styled base is an XStack named Row, with token-driven variants", () => {
  assert.match(rowCode, /styled\(XStack, \{\s+name: "Row",/);
  assert.match(rowCode, /sm: \{ gap: tokens\.spacing\[2\] \}/);
  assert.match(rowCode, /md: \{ gap: tokens\.spacing\[4\] \}/);
  assert.match(rowCode, /sm: \{ marginTop: tokens\.spacing\[2\] \}/);
  assert.match(rowCode, /md: \{ marginTop: tokens\.spacing\[4\] \}/);
  assert.match(rowCode, /center: \{ alignItems: "center" \}/);
});

test("Row's public API is the semantic props, with the tranche defaults", () => {
  assert.match(rowCode, /spacing\?: "none" \| "sm" \| "md";/);
  assert.match(rowCode, /align\?: "start" \| "center" \| "end" \| "stretch";/);
  assert.match(rowCode, /spaceBefore\?: "none" \| "sm" \| "md";/);
  assert.match(rowCode, /spacing = "sm", align = "start", spaceBefore = "none"/);
});

test("SearchField's grow prop flexes the field's root, and only when set", () => {
  assert.match(
    searchFieldSource,
    /grow\?: boolean;/,
    "SearchFieldProps must carry the optional grow flag (#119)",
  );
  assert.match(
    searchFieldSource,
    /\{\.\.\.\(grow \? \{ flex: 1 \} : \{\}\)\}/,
    "the field's root must take flex: 1 only when grow is set, so standalone fields are unchanged",
  );
});
