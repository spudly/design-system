/**
 * Contract test for the filter-bar font-size fix (spudly/design-system#67).
 *
 * On the recipe browse screens (RecipesPage, SharedWithMePage) the filter
 * bar mixes SearchField, TextField (incl. the page NumberFilters) and
 * SelectField — and SelectField rendered its value/item text at
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
  ["src/components/MultilineField.tsx", "StyledTextArea"],
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

test("both browse pages build their filter bars from the shared field components (#67)", () => {
  for (const page of ["src/pages/RecipesPage.tsx", "src/pages/SharedWithMePage.tsx"]) {
    const code = codeOf(page);
    for (const comp of ["SearchField", "SelectField", "TextField"]) {
      assert.ok(code.includes(comp), `${page} filter bar should use the shared ${comp}`);
    }
  }
});
