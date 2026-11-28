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
 * - FieldRow: a search field with its button — gap
 *   spacing[2] (8px), stretch (the equal-height contract,
 *   #476: field and button render at one height; SearchRow,
 *   which differed only in that stretch, was consolidated
 *   into it — #481).
 * - Center: centers a single child — boolean `horizontal` /
 *   `vertical`, both defaulting to true, plus the semantic
 *   `fill` variant (grow to the parent's offered height).
 * #746 (2026-11-24) eliminated the style-only stack wrappers
 * (the rhythm family — CardStack, SectionStack, ListStack,
 * ButtonStack, FormStack, and the rest — and the alignment /
 * special family: BannerRow, CenteredRow, CompactRow, EndRow,
 * StartStack, PanelStack, HeroStack, ListHeaderStack,
 * SpacedTopStack, Grow, and the catalog columns/row):
 * their consumers compose Row / Col
 * directly with the matching semantic props, and the export
 * pins below hold that the wrappers do not survive as API.
 * The pins hold each remaining component's treatment, its Omit of the
 * style keys it owns, SearchField's `grow` (the other half
 * of the FieldRow pattern: the field takes the row's
 * remaining width), and Button's `grow` basis (the ButtonRow
 * pattern's other half: a growing button in a wrapping row
 * must keep a content-sized basis or it collapses on native).
 *
 * Source scan plus dist export checks, like the other component
 * contract tests. The dist import needs the harness's
 * react-native-svg stub registered first, so this file imports
 * registerSvgStub.ts before anything else.
 */
import "../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { loadInternalDist } from "../../test/internalDist.js";

const here = dirname(fileURLToPath(import.meta.url));
const componentsDir = join(here, "../..", "src", "widgets");

function code(file: string) {
  return readFileSync(join(componentsDir, file), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const buttonRowCode = code("actions/ButtonRow.tsx");
const fieldRowCode = code("form/FieldRow.tsx");
const centerCode = code("layout/Center.tsx");
const textFieldSource = readFileSync(join(componentsDir, "form/TextField.tsx"), "utf8");
const searchFieldSource = readFileSync(join(componentsDir, "form/SearchField.tsx"), "utf8");
const fieldShellSource = readFileSync(join(componentsDir, "form/FieldShell.tsx"), "utf8");
const buttonCode = code("actions/Button.tsx");

test("the layout components are exported from the built internal components barrel", async () => {
  const dist: Record<string, any> = await loadInternalDist();
  for (const name of ["ButtonRow", "FieldRow", "Center"]) {
    assert.equal(
      typeof dist[name],
      "function",
      `${name} must be exported from the internal components barrel`,
    );
  }
  // #746 supersedes the #119 ban on a generic Row: Row / Col /
  // Spacer are now the approved strict-prop-subset layout
  // primitives (Stephen's prop table, 2026-11-21), exported from
  // the barrel and pinned by RowColSpacer.test.ts.
  for (const name of ["Row", "Col", "Spacer"]) {
    assert.equal(
      typeof dist[name],
      "function",
      `${name} must be exported from the internal components barrel (#746)`,
    );
  }
  assert.equal(
    dist.Column,
    undefined,
    "the generic step-prop Column must not survive as page-facing API (#119)",
  );
  assert.equal(
    dist.FieldStack,
    undefined,
    "FieldStack was combined into FormStack (#477) and must not survive as package API",
  );
  // #746 eliminated the style-only stack wrappers: consumers
  // compose Col with the matching t-shirt gap instead.
  for (const name of [
    "ButtonStack",
    "CardStack",
    "CompactStack",
    "ContentStack",
    "FormStack",
    "LinkStack",
    "ListStack",
    "ProseStack",
    "SectionStack",
    "TightStack",
    "BannerRow",
    "CenteredRow",
    "CompactRow",
    "EndRow",
    "StartStack",
    "PanelStack",
    "HeroStack",
    "ListHeaderStack",
    "SpacedTopStack",
    "Grow",
    "CatalogCardColumn",
    "CatalogListColumn",
    "CatalogRow",
  ]) {
    assert.equal(
      dist[name],
      undefined,
      `${name} was eliminated by #746 and must not survive as package API`,
    );
  }
});

test("ButtonRow owns the action bar's gap and wrap; separation from preceding content is the parent's", () => {
  // #746 (Option B): no styled root — both branches render a
  // Row carrying the gap, wrap, and top alignment in props.
  assert.match(buttonRowCode, /<Row wrap gap="m" top \{\.\.\.rest\}>/);
  assert.ok(
    !buttonRowCode.includes("marginTop"),
    "ButtonRow must not carry a margin — separation from the content it follows belongs to the parent (#119)",
  );
  assert.match(buttonRowCode, /Omit<RowProps, "gap" \| "top" \| "wrap">/);
});

test("FieldRow owns the search row's gap and stretch — the equal-height contract (#476)", () => {
  // #746: FieldRow is a function component rendering Row — the
  // gap/stretch ownership is pinned on the Row it renders.
  assert.match(
    fieldRowCode,
    /export function FieldRow\(\{ \.\.\.rest \}: FieldRowProps\) \{\s+return <Row gap="s" stretch \{\.\.\.rest\} \/>;/,
  );
  assert.match(fieldRowCode, /Omit<RowProps, "gap" \| "stretch">/);
});

test("FieldRow's field types fill the row height on their grow path (#476)", () => {
  const searchFieldCode = readFileSync(join(componentsDir, "form/SearchField.tsx"), "utf8");
  const textFieldCode = readFileSync(join(componentsDir, "form/TextField.tsx"), "utf8");
  const selectFieldCode = code("form/SelectField.tsx");
  // SearchField: the bordered container fills its root when growing (no label).
  assert.match(
    searchFieldCode,
    /<StyledContainer\s+error=\{!!error\}\s+\{\.\.\.\(embedded \? \{ flex: 1, minWidth: 120, embedded: true \} : \{\}\)\}\s+\{\.\.\.\(grow && !label \? \{ flex: 1 \} : \{\}\)\}\s+>/,
  );
  // TextField: the styled input (the bordered box) fills its root when growing.
  // Scoped to the StyledInput block: the root YStack carries the same grow
  // expression for its width, and must not be able to satisfy this pin.
  assert.match(textFieldCode, /<StyledInput[\s\S]*?\.\.\.\(grow \? \{ flex: 1 \} : \{\}\)/);
  // SelectField: the styled trigger (the bordered box) fills its root when growing.
  assert.match(selectFieldCode, /<StyledTrigger\s+\{\.\.\.\(grow \? \{ flex: 1 \} : \{\}\)\}/);
});

test("Center centers a single child on boolean dimensions, with a semantic fill variant", () => {
  // #746 (Option B): no styled root — the booleans translate to
  // Col's semantic props in code: horizontal is the cross axis
  // (center, or stretch when off), vertical the main axis
  // (middle, or top when off), and fill is flex: 1's grow
  // shrink translation.
  assert.match(centerCode, /\{\.\.\.\(horizontal \? \{ center: true \} : \{ stretch: true \}\)\}/);
  assert.match(centerCode, /\{\.\.\.\(vertical \? \{ middle: true \} : \{ top: true \}\)\}/);
  assert.match(centerCode, /\{\.\.\.\(fill \? \{ grow: true, shrink: true \} : null\)\}/);
  assert.match(
    centerCode,
    /export function Center\(\{ horizontal = true, vertical = true, fill = false, \.\.\.rest \}: CenterProps\)/,
  );
  assert.match(
    centerCode,
    /Omit<\s+ColProps,\s+"center" \| "stretch" \| "middle" \| "top" \| "grow" \| "shrink" \| "fill"\s+>/,
  );
});

test("no layout component offers step, role, or margin props", () => {
  for (const [name, src] of [
    ["ButtonRow", buttonRowCode],
    ["FieldRow", fieldRowCode],
  ]) {
    for (const banned of ["spacing", "spaceBefore", "spaceAfter"]) {
      assert.ok(
        !new RegExp(String.raw`${banned}\?:`).test(src),
        `${name} must not carry a ${banned} prop — spacing belongs to the component and its parent stack (#119)`,
      );
    }
  }
});

test("Button's grow keeps a content-sized basis in both forms (no wrapping-row collapse)", () => {
  const spreads = buttonCode.match(
    /\{\.\.\.\(grow && rest\.flex === undefined\s+\? \{ flexGrow: 1, flexShrink: 0, flexBasis: "auto", maxWidth: "100%" \}\s+: null\)\}/g,
  );
  assert.equal(
    spreads?.length,
    2,
    "both Button forms must spread the content-basis grow shape, displaced by a caller-passed flex and capped at the row's width — a zero basis (flex: 1) collapses a growing button in a wrapping row on native (PR #314's Start Cooking)",
  );
  assert.ok(
    !buttonCode.includes('{...(grow ? { flex: 1 }'),
    "Button's grow must never spread flex: 1 (zero basis — the wrapping-row collapse)",
  );
});

test("the filter-bar shells are exported from the built internal components barrel", async () => {
  const dist: Record<string, any> = await loadInternalDist();
  assert.equal(
    dist.FilterBar,
    undefined,
    "FilterBar was this tranche's local shell — the #119 dedupe subsumed it into CatalogFiltersBar and it must not survive as package API",
  );
  assert.equal(
    dist.SearchRow,
    undefined,
    "SearchRow duplicated FieldRow except for its stretch alignment — the #481 consolidation folded it into FieldRow and it must not survive as package API",
  );
  assert.equal(
    dist.ChoiceRow,
    undefined,
    "ChoiceRow was this tranche's local chooser row — the #119 dedupe retired it with the chips and it must not survive as package API",
  );
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
  // The root spread lives in the shared FieldShell since the
  // #587 phase-3 dedupe; SearchField hands its grow flag to the
  // shell, and the shell's root carries the conditional spread.
  assert.match(
    searchFieldSource,
    /<FieldShell[\s\S]*?grow=\{grow\}/,
    "SearchField must hand its grow flag to the shared field shell",
  );
  assert.match(
    fieldShellSource,
    /\{\.\.\.\(grow \? \{ grow: true, shrink: true \} : \{\}\)\}/,
    "the field's root must take flex: 1 (grow shrink, #746's translation) only when grow is set, so standalone fields are unchanged",
  );
});
