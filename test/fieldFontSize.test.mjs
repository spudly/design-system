/**
 * Contract test for the filter-bar font-size fix (spudly/design-system#67).
 *
 * On the recipe browse screens (RecipesPage — since #185 the single
 * recipes-list page, serving Shared-with-me too) the filter
 * bar (the shared CatalogFiltersBar since the #119 dedupe) mixes
 * SearchField, TextField and SelectField — and SelectField rendered
 * its value/item text at
 * fontSize.sm (14) while every text input rendered at fontSize.md (16),
 * so the fields visibly mismatched. The fix pins every field component's
 * entered/selected text to the shared token tokens.typography.fontSize.md.
 *
 * Source scan, not a render test: the invariant is a per-literal property
 * of the styled definitions, and no JS renderer in this repo exercises the
 * native text measurement where the mismatch showed. Comments are stripped
 * before scanning so explanatory comments cannot satisfy the patterns.
 * Labels are deliberately out of scope — they stay sm across all fields.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

function codeOf(rel) {
  const source = readFileSync(join(here, "..", rel), "utf8");
  return source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

/** Extract one styled(...) block starting at its const declaration. */
function styledBlock(code, constName) {
  const start = code.indexOf(`const ${constName} = styled(`);
  assert.ok(start !== -1, `${constName} styled definition not found`);
  const end = code.indexOf("});", start);
  assert.ok(end > start, `${constName} styled definition is not terminated`);
  return code.slice(start, end);
}

const FIELD_VALUE_BLOCKS = [
  ["src/components/TextField.tsx", "StyledInput"],
  ["src/components/SearchField.tsx", "StyledInput"],
  ["src/components/TextAreaField.tsx", "StyledTextArea"],
  ["src/components/SelectField.tsx", "StyledValue"],
  ["src/components/SelectField.tsx", "StyledItemText"],
];

for (const [rel, constName] of FIELD_VALUE_BLOCKS) {
  test(`${constName} in ${rel} renders field text at the shared fontSize.md (#67)`, () => {
    const block = styledBlock(codeOf(rel), constName);
    assert.ok(
      block.includes("fontSize: tokens.typography.fontSize.md"),
      `${constName} must pin tokens.typography.fontSize.md so filter-bar fields cannot drift apart`,
    );
    assert.ok(
      !block.includes("fontSize: tokens.typography.fontSize.sm"),
      `${constName} must not render field text at fontSize.sm (the #67 mismatch)`,
    );
  });
}

test("the recipes page builds its filter bar from the shared field components (#67)", () => {
  // Since #185 RecipesPage is the single recipes-list page (it also
  // serves Shared-with-me); before that, SharedWithMePage carried an
  // identical copy of this bar and was scanned alongside. Since the
  // #119 dedupe the page renders the shared CatalogFiltersBar, which
  // composes the shared fields — pin both links of that chain so the
  // bar's fields stay the font-pinned shared components.
  const page = codeOf("src/pages/RecipesPage.tsx");
  assert.ok(
    page.includes("CatalogFiltersBar"),
    "RecipesPage filter bar should be the shared CatalogFiltersBar",
  );
  const bar = codeOf("src/components/CatalogFiltersBar.tsx");
  for (const comp of ["SearchField", "SelectField", "TextField"]) {
    assert.ok(bar.includes(comp), `CatalogFiltersBar should use the shared ${comp}`);
  }
});
