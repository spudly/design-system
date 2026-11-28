/**
 * Contract + behavior tests for the sortable instruction list
 * views (#130, tranche T4): RecipeInstructionListView (the list
 * chrome) and RecipeInstructionRowView (the row), landing the
 * settled #124 row contract ({key, body}) under Stephen's
 * 2026-11-09 drag boundary — the DS owns the row views and the
 * list chrome, emitting field-change / add / remove intents;
 * hosts keep their drag containers and bind the handle; no
 * drag library enters the DS. Revised 2026-11-26 on #878:
 * the DS also owns the handle visual — the list renders the
 * DragHandleView grip by default, and a host-supplied
 * `renderDragHandle` still wins over it.
 *
 * The contracts pinned here:
 * 1. The views are exported from the views barrel (the list
 *    view stays internal; the row view is also exported from
 *    the package root under the #671 exception); RecipeFormPage renders the list from the
 *    `instructions` data prop — its former render slot was
 *    removed in #683, so the data prop is the only path.
 * 2. The views are controlled and drag-free: no state of their
 *    own, no drag library, no app imports — values cross as
 *    view-models and every intent reports the row's key.
 * 3. Behavior (SSR): the label and add action render when the
 *    add intent is provided; steps render numbered by position
 *    with the host-bound handle node; the remove action renders
 *    only with its intent; an empty list renders its empty
 *    line instead of rows.
 *
 * Converted in #733 tranche 5: the barrel / root / page-
 * composition source scan was replaced by runtime checks on
 * the built modules (both views ship in the built surface;
 * the list view stays off the built package root while the
 * row view is on it under the #671 exception; page
 * composition is pinned by RecipeFormPage's own tests), and
 * the controlled / drag-free source scan was deleted — state
 * ownership and library imports are not observable from the
 * built output, while every rendered contract is pinned by
 * the SSR tests below.
 */
import "../../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { test } from "node:test";

import { loadInternalDist } from "../../../test/internalDist.js";

test("the views ship in the built surface; the list stays internal, the row is public (#671)", async () => {
  const distRuntime = await loadInternalDist();
  assert.equal(typeof distRuntime.RecipeInstructionListView, "function");
  assert.equal(typeof distRuntime.RecipeInstructionRowView, "function");
  assert.equal(typeof distRuntime.DragHandleView, "function");
  const { readFileSync } = await import("node:fs");
  const { dirname, join } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const rootTypes = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../../..", "dist", "index.d.ts"),
    "utf8",
  );
  assert.doesNotMatch(
    rootTypes,
    /\bRecipeInstructionListView\b/,
    "the list view stays off the public surface",
  );
  assert.match(
    rootTypes,
    /\bRecipeInstructionRowView\b/,
    "the row view is exported from the package root (#671)",
  );
});
const rows = [
  {
    key: "sear",
    body: "Season the chicken and sear until golden.",
  },
  {
    key: "simmer",
    body: "Pour in the cream and simmer gently.",
  },
];
async function renderList(props: Record<string, unknown>): Promise<string> {
  const { createElement: h } = await import("react");
  const { renderToString } = await import("react-dom/server");
  // eslint-disable-next-line design-system/no-page-styling -- test harness imports TamaguiProvider directly to render the view under test; tests ship no page code
  const { TamaguiProvider }: Record<string, any> = await import("tamagui");
  const distRuntime = await loadInternalDist();
  const { createTamaguiConfig, baseTheme, RecipeInstructionListView } = distRuntime;
  const voiceFixtures: Record<string, any> = await import("../../../dist/voice/fixtures.js");
  const voiceModule: Record<string, any> = await import("../../../dist/voice/index.js");
  const config = createTamaguiConfig(baseTheme);
  return renderToString(
    h(
      TamaguiProvider,
      {
        config,
        defaultTheme: "light",
      },
      h(
        voiceModule.VoiceProvider,
        { voice: voiceFixtures.fixtureVoice },
        h(RecipeInstructionListView, props),
      ),
    ),
  );
}
const baseProps = {
  rows,
  onAdd: () => { /* noop */ },
  onBodyChange: () => { /* noop */ },
  onRemove: () => { /* noop */ },
};
test("populated list: label, add action, numbered step bodies, handles, and remove actions render", async () => {
  const { createElement: h } = await import("react");
  const html = await renderList({
    ...baseProps,
    renderDragHandle: () => h("span", null, "HANDLE"),
  });
  assert.ok(html.includes("Instructions"), "the section label renders");
  assert.ok(html.includes("+ Add"), "the add action renders");
  assert.ok(html.includes("Season the chicken and sear until golden."), "the first step renders");
  assert.ok(html.includes("Pour in the cream and simmer gently."), "the second step renders");
  assert.ok(html.includes("1."), "the first step number renders");
  assert.ok(html.includes("2."), "the second step number renders");
  assert.ok(html.includes("HANDLE"), "the host-bound drag handles render");
  assert.ok(html.includes("Remove step 1"), "the first remove action is named by position");
  assert.ok(html.includes("Step 2"), "the step fields are named by position");
});
test("default drag handle: the DS grip renders when no renderDragHandle is given (#878)", async () => {
  const html = await renderList({ ...baseProps });
  assert.ok(
    html.includes('aria-label="Drag to reorder"'),
    "the default DS grip renders on the rows",
  );
  assert.ok(!html.includes("HANDLE"), "no host handle renders");
});
test("host override wins: a supplied renderDragHandle replaces the DS grip (#878)", async () => {
  const { createElement: h } = await import("react");
  const html = await renderList({
    ...baseProps,
    renderDragHandle: () => h("span", null, "HANDLE"),
  });
  assert.ok(html.includes("HANDLE"), "the host-bound drag handles render");
  assert.ok(
    !html.includes('aria-label="Drag to reorder"'),
    "the default DS grip does not render when the host supplies its own handle",
  );
});
test("empty list: the empty line renders and the add action stays", async () => {
  const html = await renderList({
    ...baseProps,
    rows: [],
  });
  assert.ok(html.includes("No instructions yet"), "the empty line renders");
  assert.ok(html.includes("+ Add"), "the add action renders");
  assert.ok(!html.includes("Remove step"), "no rows render");
});
test("no intents: no add or remove actions render", async () => {
  const html = await renderList({
    rows,
  });
  assert.ok(!html.includes("+ Add"), "no add action without its intent");
  assert.ok(!html.includes("Remove step"), "no remove actions without their intent");
  assert.ok(html.includes("Season the chicken"), "the rows still render");
});
