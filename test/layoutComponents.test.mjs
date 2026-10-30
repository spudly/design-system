/**
 * Contract tests for the purpose-named layout components
 * (spudly/design-system#119, Stephen's design correction
 * 2026-10-29): there is no generic parameterized Column/Row in
 * the page-facing API — each layout need ships as a separate
 * component named for what it contains, the component owns its
 * spacing outright, and call sites pass no spacing props at all
 * (no scale steps, no role/variant prop, no margins:
 * spaceBefore/spaceAfter are abolished in all cases, and
 * separation between blocks is the parent stack's gap).
 *
 * - ButtonRow: a row of action buttons — gap spacing[3] (12px)
 *   and wrap. Separation from the content it follows is the
 *   parent's (a stack's gap, a card's internal gap), never the
 *   bar's own margin.
 * - CardStack: a stack of cards — gap spacing[2] (8px), stretch.
 * - SectionStack: a page's sections — gap spacing[8] (32px),
 *   stretch.
 * - FieldRow: a search field with its button — gap
 *   spacing[2] (8px), centered.
 * - ListStack: hairline rows as one list — no gap of its own;
 *   the rows own their separation.
 * - PanelStack: a section panel's blocks — padding and gap both
 *   spacing[4] (16px), stretch.
 * - ButtonStack: a stack of full-width buttons — gap
 *   spacing[3] (12px), stretch (ButtonRow's vertical form).
 * - Center: centers a single child — boolean `horizontal` /
 *   `vertical`, both defaulting to true.
 * The pins hold each component's treatment, its Omit of the
 * style keys it owns, and SearchField's `grow` (the other half
 * of the FieldRow pattern: the field takes the row's
 * remaining width).
 *
 * Source scan plus dist export checks, like the other component
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

function code(file) {
  return readFileSync(join(componentsDir, file), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const buttonRowCode = code("ButtonRow.tsx");
const cardStackCode = code("CardStack.tsx");
const sectionStackCode = code("SectionStack.tsx");
const fieldRowCode = code("FieldRow.tsx");
const listStackCode = code("ListStack.tsx");
const panelStackCode = code("PanelStack.tsx");
const buttonStackCode = code("ButtonStack.tsx");
const centerCode = code("Center.tsx");
const fieldStackCode = code("FieldStack.tsx");
const searchRowCode = code("SearchRow.tsx");
const textFieldSource = readFileSync(join(componentsDir, "TextField.tsx"), "utf8");
const searchFieldSource = readFileSync(join(componentsDir, "SearchField.tsx"), "utf8");

test("the layout components are exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  for (const name of [
    "ButtonRow",
    "CardStack",
    "SectionStack",
    "FieldRow",
    "ListStack",
    "PanelStack",
    "ButtonStack",
    "Center",
  ]) {
    assert.equal(typeof dist[name], "function", `${name} must be exported from @spudly/ui`);
  }
  assert.equal(
    dist.Row,
    undefined,
    "the generic step-prop Row must not survive as page-facing API (#119)",
  );
  assert.equal(
    dist.Column,
    undefined,
    "the generic step-prop Column must not survive as page-facing API (#119)",
  );
});

test("ButtonRow owns the action bar's gap and wrap; separation from preceding content is the parent's", () => {
  assert.match(buttonRowCode, /styled\(XStack, \{\s+name: "ButtonRow",/);
  assert.match(buttonRowCode, /gap: tokens\.spacing\[3\],\s+flexWrap: "wrap",/);
  assert.match(buttonRowCode, /alignItems: "flex-start",/);
  assert.ok(
    !buttonRowCode.includes("marginTop"),
    "ButtonRow must not carry a margin — separation from the content it follows belongs to the parent (#119)",
  );
  assert.match(
    buttonRowCode,
    /Omit<\s*StyledButtonRowProps,\s*"gap" \| "alignItems" \| "flexWrap"\s*>/,
  );
});

test("CardStack owns the card-list rhythm", () => {
  assert.match(cardStackCode, /styled\(YStack, \{\s+name: "CardStack",/);
  assert.match(cardStackCode, /gap: tokens\.spacing\[2\],\s+alignItems: "stretch",/);
  assert.match(cardStackCode, /Omit<StyledCardStackProps, "gap" \| "alignItems">/);
});

test("SectionStack owns the page-section rhythm", () => {
  assert.match(sectionStackCode, /styled\(YStack, \{\s+name: "SectionStack",/);
  assert.match(sectionStackCode, /gap: tokens\.spacing\[8\],\s+alignItems: "stretch",/);
  assert.match(sectionStackCode, /Omit<StyledSectionStackProps, "gap" \| "alignItems">/);
});

test("FieldRow owns the search row's gap and centering", () => {
  assert.match(fieldRowCode, /styled\(XStack, \{\s+name: "FieldRow",/);
  assert.match(fieldRowCode, /gap: tokens\.spacing\[2\],\s+alignItems: "center",/);
  assert.match(fieldRowCode, /Omit<StyledFieldRowProps, "gap" \| "alignItems">/);
});

test("PanelStack owns the section panel's inset and block rhythm", () => {
  assert.match(panelStackCode, /styled\(YStack, \{\s+name: "PanelStack",/);
  assert.match(panelStackCode, /padding: tokens\.spacing\[4\],\s+gap: tokens\.spacing\[4\],/);
  assert.match(panelStackCode, /alignItems: "stretch",/);
  assert.match(panelStackCode, /Omit<StyledPanelStackProps, "padding" \| "gap" \| "alignItems">/);
});

test("ButtonStack owns the full-width button stack's rhythm", () => {
  assert.match(buttonStackCode, /styled\(YStack, \{\s+name: "ButtonStack",/);
  assert.match(buttonStackCode, /gap: tokens\.spacing\[3\],\s+alignItems: "stretch",/);
  assert.match(buttonStackCode, /Omit<StyledButtonStackProps, "gap" \| "alignItems">/);
});

test("ListStack adds no gap of its own — the rows own their separation", () => {
  assert.match(listStackCode, /styled\(YStack, \{\s+name: "ListStack",\s+\}\)/);
  assert.ok(!/gap:/.test(listStackCode), "ListStack must not set a gap");
});

test("Center centers a single child on boolean dimensions defaulting to true", () => {
  assert.match(centerCode, /styled\(YStack, \{\s+name: "Center",/);
  assert.match(centerCode, /horizontal: \{\s+true: \{ alignItems: "center" \},/);
  assert.match(centerCode, /vertical: \{\s+true: \{ justifyContent: "center" \},/);
  assert.match(centerCode, /defaultVariants: \{\s+horizontal: true,\s+vertical: true,\s+\}/);
  assert.match(
    centerCode,
    /export function Center\(\{ horizontal = true, vertical = true, \.\.\.rest \}: CenterProps\)/,
  );
  assert.match(centerCode, /Omit<StyledCenterProps, "alignItems" \| "justifyContent">/);
});

test("no layout component offers step, role, or margin props", () => {
  for (const [name, src] of [
    ["ButtonRow", buttonRowCode],
    ["CardStack", cardStackCode],
    ["SectionStack", sectionStackCode],
    ["FieldRow", fieldRowCode],
    ["ListStack", listStackCode],
    ["PanelStack", panelStackCode],
    ["ButtonStack", buttonStackCode],
  ]) {
    for (const banned of ["spacing", "spaceBefore", "spaceAfter"]) {
      assert.ok(
        !new RegExp(String.raw`${banned}\?:`).test(src),
        `${name} must not carry a ${banned} prop — spacing belongs to the component and its parent stack (#119)`,
      );
    }
  }
});

test("the filter-bar shells are exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  for (const name of ["FieldStack", "SearchRow"]) {
    assert.equal(typeof dist[name], "function", `${name} must be exported from @spudly/ui`);
  }
  assert.equal(
    dist.FilterBar,
    undefined,
    "FilterBar was this tranche's local shell — the #119 dedupe subsumed it into CatalogFiltersBar and it must not survive as package API",
  );
  assert.equal(
    dist.ChoiceRow,
    undefined,
    "ChoiceRow was this tranche's local chooser row — the #119 dedupe retired it with the chips and it must not survive as package API",
  );
});

test("FieldStack owns the stacked-fields rhythm (#119)", () => {
  assert.match(fieldStackCode, /styled\(YStack, \{\s+name: "FieldStack",/);
  assert.match(fieldStackCode, /gap: tokens\.spacing\[3\],\s+alignItems: "stretch",/);
  assert.match(fieldStackCode, /Omit<StyledFieldStackProps, "gap" \| "alignItems">/);
});

test("SearchRow stretches its children — the Filters button matches the search field's height (#119)", () => {
  assert.match(searchRowCode, /styled\(XStack, \{\s+name: "SearchRow",/);
  assert.match(searchRowCode, /gap: tokens\.spacing\[2\],\s+alignItems: "stretch",/);
  assert.match(searchRowCode, /Omit<StyledSearchRowProps, "gap" \| "alignItems">/);
});

test("no filter-bar shell offers spacing or margin props", () => {
  for (const [name, src] of [
    ["FieldStack", fieldStackCode],
    ["SearchRow", searchRowCode],
  ]) {
    for (const banned of ["spacing", "spaceBefore", "spaceAfter"]) {
      assert.ok(
        !new RegExp(String.raw`${banned}\?:`).test(src),
        `${name} must not carry a ${banned} prop (#119)`,
      );
    }
  }
});

test("TextField's grow prop flexes the field's root, and only when set (#119)", () => {
  assert.match(
    textFieldSource,
    /grow\?: boolean;/,
    "TextFieldProps must carry the optional grow flag (the SearchField precedent)",
  );
  assert.match(
    textFieldSource,
    /\{\.\.\.\(grow \? \{ flex: 1 \} : \{\}\)\}/,
    "the field's root must take flex: 1 only when grow is set, so standalone fields are unchanged",
  );
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
