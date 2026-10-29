/**
 * Contract test for Row (spudly/design-system#119), the DS layout
 * row pages compose instead of rendering a Tamagui stack with
 * styling props of their own.
 *
 * Row takes ONE semantic prop — its `variant`, the role the row
 * plays — and the role pins every style value in the component
 * (Stephen's direction, 2026-10-29: named scale steps at call
 * sites are style props with friendlier names, and per-call-site
 * choice is how page spacing drifts). The roles:
 * - `actions`: an action bar following content — gap spacing[3]
 *   (12px), wraps at narrow widths, and a spacing[2] (8px)
 *   role-owned separation from the content it follows (its
 *   parents — bare cards, section stacks — do not supply that
 *   separation uniformly).
 * - `inline`: controls composed on one line within content —
 *   gap spacing[2] (8px), vertically centered.
 * The pins hold that shape and, just as importantly, the absence
 * of the old step API: no `spacing` / `spaceBefore` / `spaceAfter`
 * / `align` / `wrap` props exist to pass.
 *
 * SearchField's `grow` prop is pinned here too: it is the other
 * half of the inline-group pattern Row enables (the field takes
 * the row's remaining width), added for VerseSearchPage's search
 * row in tranche 1.
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
const rowSource = readFileSync(join(componentsDir, "Row.tsx"), "utf8");
const searchFieldSource = readFileSync(join(componentsDir, "SearchField.tsx"), "utf8");

const rowCode = rowSource.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("Row is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(typeof dist.Row, "function", "Row must be exported from @spudly/ui");
});

test("Row's styled base is an XStack named Row, with the role variants pinning the styles", () => {
  assert.match(rowCode, /styled\(XStack, \{\s+name: "Row",/);
  assert.match(rowCode, /actions: \{\s+gap: tokens\.spacing\[3\],\s+flexWrap: "wrap",/);
  assert.match(rowCode, /alignItems: "flex-start",\s+marginTop: tokens\.spacing\[2\],/);
  assert.match(rowCode, /inline: \{\s+gap: tokens\.spacing\[2\],\s+alignItems: "center",\s+\}/);
});

test("Row's public API is the required role prop, and no step props exist", () => {
  assert.match(rowCode, /variant: "actions" \| "inline";/);
  assert.match(rowCode, /export function Row\(\{ variant, \.\.\.rest \}: RowProps\)/);
  for (const banned of ["spacing", "spaceBefore", "spaceAfter", "align", "wrap"]) {
    assert.ok(
      !new RegExp(String.raw`${banned}\?:`).test(rowCode),
      `RowProps must not carry a ${banned} prop — the role owns the styling (#119)`,
    );
  }
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
