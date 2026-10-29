/**
 * Form-component contracts for the #119 forms tranche: the
 * components the RecipeFormPage / MealFormPage /
 * MealPlanFormPage de-styling extracted (LabeledField,
 * LabeledGroup, FieldLabel, RevertAction, ChangedListBanner,
 * FieldColumns, FormStack, FormHeading, FormSubmit,
 * StepperGroup). Like the layout-components contracts, these
 * pin the public shape (props and owned geometry) so a later
 * edit cannot silently reintroduce styling pass-throughs or
 * move the owned spacing, and pin the three pages themselves
 * to composing DS components only — the no-page-styling rule
 * is dormant in the ESLint config (no TS7 parser), so this
 * test is the tranche's enforcement until the rule revives.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dist = await import(join(here, "..", "dist", "index.js"));
// Comments are stripped before asserting: the components' doc
// comments legitimately name the abolished props they refuse.
const readRepoFile = (rel) =>
  readFileSync(join(here, "..", rel), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

const COMPONENTS = [
  "FieldLabel",
  "LabeledField",
  "LabeledGroup",
  "RevertAction",
  "ChangedListBanner",
  "FieldColumns",
  "FormStack",
  "FormHeading",
  "FormSubmit",
  "StepperGroup",
];

for (const name of COMPONENTS) {
  test(`${name} is exported from the built package root`, () => {
    assert.equal(typeof dist[name], "function", `${name} must be a runtime export`);
  });
  test(`${name}Props is a type-only export from the built components barrel`, () => {
    const barrel = readRepoFile("dist/components/index.d.ts");
    assert.match(barrel, new RegExp(String.raw`export \{[^}]*type ${name}Props[^}]*\}`));
  });
  test(`${name} offers no styling or spacing props and uses type aliases only`, () => {
    const source = readRepoFile(`src/components/${name}.tsx`);
    assert.doesNotMatch(source, /spaceBefore|spaceAfter|className|style\??:/);
    assert.doesNotMatch(source, /\binterface\s/);
  });
}

test("LabeledField owns the 4px label separation and renders the error below the field", () => {
  const source = readRepoFile("src/components/LabeledField.tsx");
  assert.match(source, /paddingBlockEnd=\{tokens\.spacing\[1\]\}/);
  assert.match(source, /label: string;/);
  assert.match(source, /error\?: string \| null \| undefined;/);
  assert.match(source, /paddingBlockStart=\{tokens\.spacing\[2\]\}/);
  assert.match(source, /variant="error"/);
});

test("LabeledGroup owns the wider 8px label separation for non-field controls", () => {
  const source = readRepoFile("src/components/LabeledGroup.tsx");
  assert.match(source, /paddingBlockEnd=\{tokens\.spacing\[2\]\}/);
});

test("FieldColumns gives every child an equal flex column with an owned 12px gutter", () => {
  const source = readRepoFile("src/components/FieldColumns.tsx");
  assert.match(source, /gap=\{tokens\.spacing\[3\]\}/);
  assert.match(source, /<YStack flex=\{1\}>/);
  assert.match(source, /typeof child === "boolean"/);
});

test("FormStack owns the form rhythm: 16px section gaps, stretched children, 32px tail", () => {
  const source = readRepoFile("src/components/FormStack.tsx");
  assert.match(source, /gap: tokens\.spacing\[4\]/);
  assert.match(source, /alignItems: "stretch"/);
  assert.match(source, /paddingBlockEnd: tokens\.spacing\[8\]/);
});

test("FormHeading owns the title treatment and its 24px separation", () => {
  const source = readRepoFile("src/components/FormHeading.tsx");
  assert.match(source, /paddingBottom=\{tokens\.spacing\[6\]\}/);
  assert.match(source, /variant="formTitle"/);
});

test("FormSubmit owns the 16px separation above the submit row", () => {
  const source = readRepoFile("src/components/FormSubmit.tsx");
  assert.match(source, /paddingBlockStart=\{tokens\.spacing\[4\]\}/);
});

test("StepperGroup is flush: it sets no gap, so one entry's steppers stay glued", () => {
  const source = readRepoFile("src/components/StepperGroup.tsx");
  assert.doesNotMatch(source, /gap/);
});

test("RevertAction keeps the warning treatment and the translated button role", () => {
  const source = readRepoFile("src/components/RevertAction.tsx");
  assert.match(source, /Revert to: \$\{label\}/);
  assert.match(source, /platformAccessibilityProps\(\{ accessibilityRole: "button" \}\)/);
  assert.match(source, /tokens\.colors\.warning/);
});

test("ChangedListBanner keeps the warning wash and offers its revert only when given one", () => {
  const source = readRepoFile("src/components/ChangedListBanner.tsx");
  assert.match(source, /backgroundColor=\{tokens\.colors\.warning\.warning1\}/);
  assert.match(source, /\{onRevert \? \(/);
});

test("the three form pages compose DS components only — no tamagui, no tokens, no styled (#119)", () => {
  for (const page of ["RecipeFormPage", "MealFormPage", "MealPlanFormPage"]) {
    const source = readRepoFile(`src/pages/${page}.tsx`);
    assert.doesNotMatch(source, /from "tamagui"/, `${page} must not import layout primitives`);
    assert.doesNotMatch(source, /tokens/, `${page} must not reach for design tokens`);
    assert.doesNotMatch(source, /styled\(/, `${page} must not define styled components`);
    assert.doesNotMatch(source, /<(XStack|YStack|ZStack|Stack|View|ScrollView)\b/);
  }
});
