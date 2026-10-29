/**
 * Form-component contracts for the #119 dedupe set: the form
 * components both form tranches coined (LabeledField,
 * LabeledGroup, FieldLabel, RevertAction, ChangedListBanner,
 * FormStack, FormHeading), shipped once here. Like the
 * layout-components contracts, these pin the public shape
 * (props and owned geometry) so a later edit cannot silently
 * reintroduce styling pass-throughs or move the owned spacing.
 *
 * The forms tranche's wider set (FieldLabelBlock, FieldColumns,
 * FormSubmit, StepperGroup) and its page-composition pins stay
 * with that tranche — they are single-family components and
 * this PR ships no page rewrite.
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
  "FormStack",
  "FormHeading",
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

test("the label row is one shared implementation behind both labeled wrappers", () => {
  const row = readRepoFile("src/components/labelRow.tsx");
  assert.match(row, /paddingBlockEnd=\{tokens\.spacing\[separation\]\}/);
  assert.match(row, /<FieldLabel>\{label\}<\/FieldLabel>/);
  const field = readRepoFile("src/components/LabeledField.tsx");
  assert.match(field, /<LabelRow label=\{label\} action=\{action\} separation=\{1\} \/>/);
  const group = readRepoFile("src/components/LabeledGroup.tsx");
  assert.match(group, /<LabelRow label=\{label\} action=\{action\} separation=\{2\} \/>/);
});

test("LabeledField owns the 4px label separation and renders the error below the field", () => {
  const source = readRepoFile("src/components/LabeledField.tsx");
  assert.match(source, /label: string;/);
  assert.match(source, /error\?: string \| null \| undefined;/);
  assert.match(source, /paddingBlockStart=\{tokens\.spacing\[2\]\}/);
  assert.match(source, /variant="error"/);
});

test("LabeledGroup owns the wider 8px label separation for non-field controls", () => {
  const source = readRepoFile("src/components/LabeledGroup.tsx");
  assert.match(source, /separation=\{2\}/);
});

test("FormStack owns the form rhythm: 16px section gaps, stretched children, 32px tail", () => {
  const source = readRepoFile("src/components/FormStack.tsx");
  assert.match(source, /gap: tokens\.spacing\[4\]/);
  assert.match(source, /alignItems: "stretch"/);
  assert.match(source, /paddingBlockEnd: tokens\.spacing\[8\]/);
});

test("FormHeading owns the title treatment, its 24px separation, and the optional subtitle", () => {
  const source = readRepoFile("src/components/FormHeading.tsx");
  assert.match(source, /paddingBottom=\{tokens\.spacing\[6\]\}/);
  assert.match(source, /variant="formTitle"/);
  // The import tranche's SessionHeader retired into this
  // optional subtitle (dedupe cluster B5).
  assert.match(source, /subtitle\?: string;/);
  assert.match(source, /variant="hint"/);
});

test("RevertAction is the warning text action composed on TextAction", () => {
  const source = readRepoFile("src/components/RevertAction.tsx");
  assert.match(source, /Revert to: \$\{label\}/);
  // Cluster C3 of the dedupe: the button role and its keyboard
  // behavior are TextAction's — no hand-rolled pressable.
  assert.match(source, /<TextAction/);
  assert.match(source, /tokens\.colors\.warning/);
  assert.ok(!source.includes("platformAccessibilityProps"), "no hand-rolled a11y translation");
});

test("ChangedListBanner keeps the warning wash and offers its revert only when given one", () => {
  const source = readRepoFile("src/components/ChangedListBanner.tsx");
  assert.match(source, /backgroundColor=\{tokens\.colors\.warning\.warning1\}/);
  assert.match(source, /\{onRevert \? \(/);
  assert.match(source, /<TextAction/, "the revert renders through TextAction (cluster C3)");
});
