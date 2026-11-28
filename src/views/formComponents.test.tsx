/**
 * Form-component contracts for the #119 form set the three
 * form pages compose: the dedupe set (LabeledField,
 * LabeledGroup, FieldLabel, RevertAction, ChangedListBanner,
 * FormHeading), shipped once on main. (FormStack, the set's
 * form stack, was eliminated by #746 — forms compose a Col
 * at gap "m" directly.)
 *
 * The forms tranche's wider set was split by disposition in the
 * adoption rounds: FieldLabelBlock and StepperGroup composed
 * away into LabeledGroup and FormStack, while EqualColumns
 * is a genuine library component — it ships in the #119
 * extraction set and is pinned here alongside the dedupe set.
 * FormSubmit was removed in #478 (a logic-free wrapper whose
 * only effect was extra separation above the submit row).
 *
 * Converted from source scans to runtime checks in #733
 * tranche 5:
 * - Every component's runtime export and its type-only Props
 *   export are asserted against the built dist (the `.d.ts`
 *   reads are built-artifact reads, not source reads).
 * - The per-component styling-prop / type-alias source scans
 *   were deleted: prop surface shape is enforced by the
 *   TypeScript build, not a test (Stephen, 2026-11-20).
 * - The owned-geometry source scans (label separations,
 *   FormStack rhythm, EqualColumns gutter, FormHeading
 *   separation, the banner's warning wash, the shared
 *   LabelRow wiring) were deleted: styled-component geometry
 *   is not observable from rendered output. The observable
 *   contracts survive as SSR checks below — the label element
 *   and its `for`, the named group, the error line under its
 *   field, the revert affordance's text, the banner offering
 *   its revert only when given one, and the heading's title
 *   and subtitle.
 * - FieldStack's absence is asserted on the built surface.
 * - The three-form-pages composition source scan was deleted:
 *   page composition is pinned by the pages' own tests, and
 *   this tranche does not read page source.
 */
import "../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { loadInternalDist } from "../../test/internalDist.js";

const here = dirname(fileURLToPath(import.meta.url));
const dist = await loadInternalDist();
// The Props type check reads the built dist type surface (a
// built artifact, not JS/TS source).
const readDistTypes = (rel: string) => readFileSync(join(here, "../..", rel), "utf8");
const COMPONENTS = [
  "FieldLabel",
  "LabeledField",
  "LabeledGroup",
  "RevertAction",
  "ChangedListBanner",
  "EqualColumns",
  "FormHeading",
];

// RevertAction is a view since #470; ChangedListBanner was a
// view from #470 until #698 tranche 4 moved it to src/widgets
// (it owns its styling); the rest of the set is in src/widgets.
const VIEWS = new Set(["RevertAction"]);
const homeOf = (name: string) => (VIEWS.has(name) ? "views" : "widgets");
for (const name of COMPONENTS) {
  test(`${name} is exported from the built internal dist surface`, () => {
    assert.equal(typeof dist[name], "function", `${name} must be a runtime export`);
  });
  test(`${name}Props is a type-only export from its built internal barrel`, () => {
    const barrel = readDistTypes(`dist/${homeOf(name)}/index.d.ts`);
    assert.match(barrel, new RegExp(String.raw`export \{[^}]*type ${name}Props[^}]*\}`));
  });
}
test("FieldStack does not survive the #477 consolidation", () => {
  assert.equal(
    dist.FieldStack,
    undefined,
    "FieldStack must not be exported from the built surface",
  );
});

// Runtime imports are lazy (inside the SSR tests) so the
// export tests above still run and report when the build
// output is missing or broken, instead of the whole file
// failing at import time.
let runtimePromise;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider }: Record<string, any> = await import("tamagui");
    const distRuntime = await loadInternalDist();
    const { VoiceProvider }: Record<string, any> = await import("../../dist/voice/index.js");
    const { fixtureVoice }: Record<string, any> = await import("../../dist/voice/fixtures.js");
    return {
      React,
      renderToString,
      TamaguiProvider,
      VoiceProvider,
      fixtureVoice,
      ...distRuntime,
    };
  })();
  return runtimePromise;
}
async function renderToHtml(element: any) {
  const { renderToString, TamaguiProvider, createTamaguiConfig, baseTheme } = await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  const html = renderToString(
    <TamaguiProvider config={config} defaultTheme="light">
      {element}
    </TamaguiProvider>,
  );
  const styleEnd = html.lastIndexOf("</style>");
  return styleEnd === -1 ? html : html.slice(styleEnd + "</style>".length);
}
async function renderWithVoice(element: any) {
  const { VoiceProvider, fixtureVoice } = await loadRuntime();
  return renderToHtml(<VoiceProvider voice={fixtureVoice}>{element}</VoiceProvider>);
}
test("SSR: a LabeledField's label is a real label element whose `for` matches the field's id", async () => {
  const { LabeledField, TextField } = await loadRuntime();
  const html = await renderToHtml(
    <LabeledField label="Title" fieldId="recipe-title">
      <TextField
        id="recipe-title"
        accessibilityLabel="Title"
        value="Tuscan chicken"
        onChangeText={() => null}
      />
    </LabeledField>,
  );
  assert.match(
    html,
    /<label[^>]*for="recipe-title"[^>]*>(?:<[^>]+>)?Title/,
    "the visible label renders as a <label> element naming the field by id (PR #320)",
  );
  assert.match(html, /<input[^>]*id="recipe-title"/, "the field control carries the same id");
});
test("SSR: FieldLabel with htmlFor renders a label element; a LabeledGroup is a named group", async () => {
  const { FieldLabel, LabeledGroup, Text } = await loadRuntime();
  const labelHtml = await renderToHtml(<FieldLabel htmlFor="some-field">Title</FieldLabel>);
  assert.match(labelHtml, /<label[^>]*for="some-field"[^>]*>(?:<[^>]+>)?Title/);
  const groupHtml = await renderToHtml(
    <LabeledGroup label="Tags">
      <Text>Weeknight</Text>
    </LabeledGroup>,
  );
  assert.match(groupHtml, /role="group"/, "the group carries the group role on web");
  assert.match(groupHtml, /aria-label="Tags"/, "the group is named by its label");
});
test("SSR: a LabeledField renders its error below the field, keyed by the field's error id", async () => {
  const { LabeledField, TextField } = await loadRuntime();
  const html = await renderWithVoice(
    <LabeledField label="Title" fieldId="recipe-title" error="Title is required">
      <TextField id="recipe-title" accessibilityLabel="Title" value="" onChangeText={() => null} />
    </LabeledField>,
  );
  assert.ok(html.includes("Title is required"), "the error line renders");
  assert.ok(html.includes('id="recipe-title-error"'), "the error carries the field's error id");
  assert.ok(
    !html.includes("Tuscan") &&
      html.indexOf('id="recipe-title"') < html.indexOf("Title is required"),
    "the error renders below the field",
  );
});
test("SSR: RevertAction renders the revert affordance naming its label (#464)", async () => {
  const { RevertAction } = await loadRuntime();
  const html = await renderToHtml(<RevertAction label="Ingredients" onPress={() => null} />);
  assert.ok(html.includes("Revert to: Ingredients"), "the affordance names what it reverts");
});
test("SSR: ChangedListBanner offers its revert only when given one", async () => {
  const { ChangedListBanner } = await loadRuntime();
  const withRevert = await renderWithVoice(
    <ChangedListBanner label="3 changes" onRevert={() => null} />,
  );
  assert.ok(withRevert.includes("3 changes"), "the summary line renders");
  assert.ok(withRevert.includes("Revert"), "the revert action renders when given one");
  const withoutRevert = await renderWithVoice(<ChangedListBanner label="3 changes" />);
  assert.ok(!withoutRevert.includes("Revert"), "no revert action renders without one");
});
test("SSR: FormHeading renders its title and optional subtitle; the form Col renders its children", async () => {
  const { FormHeading, Col, Text } = await loadRuntime();
  const headingHtml = await renderToHtml(
    <FormHeading subtitle="Imported from a link">Recipe details</FormHeading>,
  );
  assert.ok(headingHtml.includes("Recipe details"), "the title renders");
  assert.ok(headingHtml.includes("Imported from a link"), "the subtitle renders");
  const stackHtml = await renderToHtml(
    <Col gap="m">
      <Text>First field</Text>
      <Text>Second field</Text>
    </Col>,
  );
  assert.ok(stackHtml.includes("First field") && stackHtml.includes("Second field"));
});
test("SSR: EqualColumns renders every child", async () => {
  const { EqualColumns, Text } = await loadRuntime();
  const html = await renderToHtml(
    <EqualColumns>
      <Text>Left column</Text>
      <Text>Right column</Text>
    </EqualColumns>,
  );
  assert.ok(html.includes("Left column") && html.includes("Right column"));
});
