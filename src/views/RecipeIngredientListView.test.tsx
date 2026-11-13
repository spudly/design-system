/**
 * Contract + behavior tests for the sortable ingredient list
 * views (#130, tranche T4): RecipeIngredientListView (the list
 * chrome) and RecipeIngredientRowView (the row), landing the
 * settled #124 row contract ({key, quantity, unit, name}) under
 * Stephen's 2026-11-09 drag boundary — the DS owns the row
 * views and the list chrome, emitting field-change / add /
 * remove intents; hosts keep their drag containers and bind
 * the handle; no drag library enters the DS.
 *
 * The contracts pinned here:
 * 1. The views are exported from the views barrel (internal
 *    surface only); RecipeFormPage renders the list from the
 *    `ingredients` data prop, ahead of the
 *    `renderIngredientsSection` slot, which remains the
 *    fallback.
 * 2. The views are controlled and drag-free: no state of their
 *    own, no drag library, no app imports — values cross as
 *    view-models and every intent reports the row's key.
 * 3. Behavior (SSR): the label and add action render when the
 *    add intent is provided; rows render their fields with
 *    per-row accessible names and the host-bound handle node;
 *    the remove action renders only with its intent; an empty
 *    list renders its empty line instead of rows.
 */
import "../../test/registerSvgStub.js";
import { loadInternalDist } from "../../test/internalDist.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const read = (rel: string) => readFileSync(join(root, rel), "utf8");
test("the views are barrel-exported and RecipeFormPage renders the list from the ingredients data prop", () => {
  const barrel = read("src/views/index.ts");
  for (const name of ["RecipeIngredientListView", "RecipeIngredientRowView"]) {
    assert.ok(barrel.includes(name), `${name} is exported from src/views/index.ts`);
    assert.ok(barrel.includes(`from "./${name}.js"`), `${name} is exported from its own module`);
    const rootIndex = read("src/index.ts");
    assert.doesNotMatch(
      rootIndex,
      new RegExp(`\\b${name}\\b`),
      "the view stays off the public surface",
    );
  }
  const form = read("src/pages/RecipeFormPage.tsx");
  assert.ok(
    form.includes("ingredients?: RecipeFormPageIngredients | null"),
    "the ingredients data prop is on the form's contract",
  );
  assert.match(
    form,
    /<RecipeIngredientListView \{\.\.\.ingredients\} \/>/,
    "the page renders the list view from the data prop",
  );
  assert.ok(
    form.includes("renderIngredientsSection()"),
    "the slot fallback still renders for unmigrated hosts",
  );
});
test("the views are controlled and drag-free", () => {
  for (const file of ["RecipeIngredientListView.tsx", "RecipeIngredientRowView.tsx"]) {
    const view = read(`src/views/${file}`);
    assert.ok(!view.includes("useState"), `${file} must not own state`);
    assert.ok(!view.includes("@dnd-kit"), `${file} must not take a drag library`);
    assert.ok(!view.includes("draggable-flatlist"), `${file} must not take a drag library`);
    assert.ok(!view.includes("@eciperay"), `${file} must not import an app package`);
  }
});
const rows = [
  {
    key: "chicken",
    quantity: "1 1/2",
    unit: "lb",
    name: "Chicken breasts",
  },
  {
    key: "garlic",
    quantity: "4",
    unit: "",
    name: "Garlic cloves",
  },
];
async function renderList(props: Record<string, unknown>): Promise<string> {
  const { createElement: h } = await import("react");
  const { renderToString } = await import("react-dom/server");
  const { TamaguiProvider }: Record<string, any> = await import("tamagui");
  const distRuntime = await loadInternalDist();
  const { createTamaguiConfig, baseTheme, RecipeIngredientListView } = distRuntime;
  const voiceFixtures: Record<string, any> = await import("../../dist/voice/fixtures.js");
  const voiceModule: Record<string, any> = await import("../../dist/voice/index.js");
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
        h(RecipeIngredientListView, props),
      ),
    ),
  );
}
const baseProps = {
  rows,
  onAdd: () => {},
  onFieldChange: () => {},
  onRemove: () => {},
};
test("populated list: label, add action, row values, handles, and remove actions render", async () => {
  const { createElement: h } = await import("react");
  const html = await renderList({
    ...baseProps,
    renderDragHandle: () => h("span", null, "HANDLE"),
  });
  assert.ok(html.includes("Ingredients"), "the section label renders");
  assert.ok(html.includes("+ Add"), "the add action renders");
  assert.ok(html.includes("Chicken breasts"), "the first row's name renders");
  assert.ok(html.includes("Garlic cloves"), "the second row's name renders");
  assert.ok(html.includes("HANDLE"), "the host-bound drag handles render");
  assert.ok(html.includes("Remove"), "the remove actions render");
  assert.ok(html.includes("Remove ingredient 1"), "the first remove action is named by position");
  assert.ok(html.includes("Ingredient 2 quantity"), "the row fields are named by position");
});
test("empty list: the empty line renders and the add action stays", async () => {
  const html = await renderList({
    ...baseProps,
    rows: [],
  });
  assert.ok(html.includes("No ingredients yet"), "the empty line renders");
  assert.ok(html.includes("+ Add"), "the add action renders");
  assert.ok(!html.includes("Remove ingredient"), "no rows render");
});
test("no intents: no add or remove actions render", async () => {
  const html = await renderList({
    rows,
  });
  assert.ok(!html.includes("+ Add"), "no add action without its intent");
  assert.ok(!html.includes("Remove ingredient"), "no remove actions without their intent");
  assert.ok(html.includes("Chicken breasts"), "the rows still render");
});
