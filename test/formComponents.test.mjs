/**
 * Form-component contracts for the #119 form set the three
 * form pages compose: the dedupe set (LabeledField,
 * LabeledGroup, FieldLabel, RevertAction, ChangedListBanner,
 * FormStack, FormHeading), shipped once on main. Like the
 * layout-components contracts, these pin the public
 * shape (props and owned geometry) so a later edit cannot
 * silently reintroduce styling pass-throughs or move the owned
 * spacing, and pin the three form pages themselves to
 * composing DS components only — the no-page-styling rule is
 * dormant in the ESLint config (no TS7 parser), so this test
 * is the pages' enforcement until the rule revives.
 *
 * The forms tranche's wider set was split by disposition in the
 * adoption rounds: FieldLabelBlock and StepperGroup composed
 * away into LabeledGroup and FieldStack, while FieldColumns
 * and FormSubmit are genuine library components — they ship in
 * the #119 extraction set and are pinned here alongside the
 * dedupe set.
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
  assert.match(row, /<FieldLabel htmlFor=\{htmlFor\}>\{label\}<\/FieldLabel>/);
  const field = readRepoFile("src/components/LabeledField.tsx");
  assert.match(
    field,
    /<LabelRow label=\{label\} action=\{action\} separation=\{1\} htmlFor=\{fieldId\} \/>/,
  );
  const group = readRepoFile("src/components/LabeledGroup.tsx");
  assert.match(
    group,
    /<LabelRow label=\{label\} action=\{action\} separation=\{2\} htmlFor=\{fieldId\} \/>/,
  );
});

test("FieldLabel renders a real label element on web and keeps the text treatment on native", () => {
  const source = readRepoFile("src/components/FieldLabel.tsx");
  // Stephen's ruling on PR #320: web uses an HTML label element
  // with a proper `for`; native keeps the plain Text treatment.
  assert.match(source, /if \(isWeb\) \{/);
  assert.match(source, /<Label\s+\{\.\.\.\(htmlFor \? \{ htmlFor \} : \{\}\)\}/);
  assert.match(source, /htmlFor\?: string \| undefined;/);
  assert.match(source, /<Text\s+fontSize=\{tokens\.typography\.fontSize\.sm\}/);
});

test("LabeledField owns the 4px label separation and renders the error below the field", () => {
  const source = readRepoFile("src/components/LabeledField.tsx");
  assert.match(source, /label: string;/);
  assert.match(source, /fieldId\?: string | undefined;/);
  assert.match(source, /error\?: string \| null \| undefined;/);
  assert.match(source, /paddingBlockStart=\{tokens\.spacing\[2\]\}/);
  assert.match(source, /variant="error"/);
  // The host-placed error carries the field's deterministic
  // error id (the field components' own `${id}-error` shape).
  assert.match(source, /\{\.\.\.\(fieldId \? \{ id: `\$\{fieldId\}-error` \} : \{\}\)\}/);
});

test("LabeledGroup owns the wider 8px label separation for non-field controls", () => {
  const source = readRepoFile("src/components/LabeledGroup.tsx");
  assert.match(source, /separation=\{2\}/);
  assert.match(source, /fieldId\?: string | undefined;/);
  // The group is programmatically named by its label (the
  // NumberStepper pattern): group role + accessible name.
  assert.match(source, /\{\.\.\.groupRoleProps\}/);
  assert.match(source, /platformAccessibilityProps\(\{ accessibilityLabel: label \}\)/);
});

test("FormStack owns the form rhythm: 16px section gaps, stretched children, 32px tail", () => {
  const source = readRepoFile("src/components/FormStack.tsx");
  assert.match(source, /gap: tokens\.spacing\[4\]/);
  assert.match(source, /alignItems: "stretch"/);
  assert.match(source, /paddingBlockEnd: tokens\.spacing\[8\]/);
});

test("FieldColumns gives every child an equal flex column with an owned 12px gutter", () => {
  const source = readRepoFile("src/components/FieldColumns.tsx");
  assert.match(source, /gap=\{tokens\.spacing\[3\]\}/);
  assert.match(source, /<YStack flex=\{1\}>/);
  assert.match(source, /typeof child === "boolean"/);
});

test("FormSubmit owns the 16px separation above the submit row", () => {
  const source = readRepoFile("src/components/FormSubmit.tsx");
  assert.match(source, /paddingBlockStart=\{tokens\.spacing\[4\]\}/);
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

// Runtime imports are lazy (inside the SSR tests) so the
// source-scan tests above still run and report when the build
// output is missing or broken, instead of the whole file
// failing at import time.
let runtimePromise;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider } = await import("tamagui");
    const distRuntime = await import(join(here, "..", "dist", "index.js"));
    return { React, renderToString, TamaguiProvider, ...distRuntime };
  })();
  return runtimePromise;
}

async function renderToHtml(element) {
  const { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme } =
    await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  const html = renderToString(
    React.createElement(TamaguiProvider, { config, defaultTheme: "light" }, element),
  );
  const styleEnd = html.lastIndexOf("</style>");
  return styleEnd === -1 ? html : html.slice(styleEnd + "</style>".length);
}

test("SSR: a LabeledField's label is a real label element whose `for` matches the field's id", async () => {
  const { React, LabeledField, TextField } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(
      LabeledField,
      { label: "Title", fieldId: "recipe-title" },
      React.createElement(TextField, {
        id: "recipe-title",
        accessibilityLabel: "Title",
        value: "Tuscan chicken",
        onChangeText: () => null,
      }),
    ),
  );
  assert.match(
    html,
    /<label[^>]*for="recipe-title"[^>]*>(?:<[^>]+>)?Title/,
    "the visible label renders as a <label> element naming the field by id (PR #320)",
  );
  assert.match(html, /<input[^>]*id="recipe-title"/, "the field control carries the same id");
});

test("SSR: FieldLabel with htmlFor renders a label element; a LabeledGroup is a named group", async () => {
  const { React, FieldLabel, LabeledGroup, Text } = await loadRuntime();
  const labelHtml = await renderToHtml(
    React.createElement(FieldLabel, { htmlFor: "some-field" }, "Title"),
  );
  assert.match(labelHtml, /<label[^>]*for="some-field"[^>]*>(?:<[^>]+>)?Title/);

  const groupHtml = await renderToHtml(
    React.createElement(
      LabeledGroup,
      { label: "Tags" },
      React.createElement(Text, null, "Weeknight"),
    ),
  );
  assert.match(groupHtml, /role="group"/, "the group carries the group role on web");
  assert.match(groupHtml, /aria-label="Tags"/, "the group is named by its label");
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
