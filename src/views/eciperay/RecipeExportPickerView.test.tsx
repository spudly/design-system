/**
 * Contract + behavior tests for RecipeExportPickerView's error
 * state (CodeRabbit finding on PR #452, verified against source):
 *
 * When the item query fails, the view renders the error Alert
 * INSTEAD of the CheckboxSelectList — the items are hidden — but
 * the BulkSelectToolbar above it used to keep Select all enabled
 * whenever the (cached) item list was non-empty, so a press would
 * select items the user cannot see. The contracts pinned here:
 * 1. In the error state the toolbar sees an empty visible set, so
 *    Select all disables (SSR-pinned below).
 * 2. An existing selection can still be cleared during the error
 *    state: the toolbar gates Clear selection on the selection
 *    itself, not on the visible count (SSR-pinned below).
 * 3. Outside the error state nothing changes: Select all enables
 *    with visible items, and the items render.
 *
 * Converted in #733 tranche 5: the two former source scans
 * (the view passing an empty visible count in the error state,
 * and the toolbar's disabled-prop wiring) were deleted —
 * both contracts are exactly what the SSR tests below pin at
 * runtime (Select all disabled / Clear selection enabled in
 * the error state; Select all enabled with visible items).
 */
import "../../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { test } from "node:test";

import { loadInternalDist } from "../../../test/internalDist.js";
async function renderPicker(props: Record<string, unknown>): Promise<string> {
  const { createElement: h } = await import("react");
  const { renderToString } = await import("react-dom/server");
  const { TamaguiProvider }: Record<string, any> = await import("tamagui");
  const distRuntime = await loadInternalDist();
  const { createTamaguiConfig, baseTheme, RecipeExportPickerView } = distRuntime;
  const { VoiceProvider }: Record<string, any> = await import("../../../dist/voice/index.js");
  const { fixtureVoice }: Record<string, any> = await import("../../../dist/voice/fixtures.js");
  const config = createTamaguiConfig(baseTheme);
  return renderToString(
    h(
      TamaguiProvider,
      {
        config,
        defaultTheme: "light",
      },
      h(VoiceProvider, { voice: fixtureVoice }, h(RecipeExportPickerView, props)),
    ),
  );
}
function buttonAttrs(html: string, label: string): string {
  const idx = html.indexOf(label);
  assert.ok(idx >= 0, `the "${label}" button renders`);
  const start = html.lastIndexOf("<button", idx);
  const end = html.indexOf(">", start);
  return html.slice(start, end);
}
const baseProps = {
  search: "",
  onSearchChange: () => {},
  items: [
    {
      id: "a",
      label: "Recipe A",
    },
    {
      id: "b",
      label: "Recipe B",
    },
  ],
  selectedIds: ["a"],
  onToggle: () => {},
  onSelectAll: () => {},
  onClearSelection: () => {},
  onExport: () => {},
  exportLabel: "Export selected (1)",
};
test("error state: Select all is disabled, the selection can still be cleared, items stay hidden", async () => {
  const html = await renderPicker({
    ...baseProps,
    error: "Could not load recipes.",
  });
  assert.ok(html.includes("Could not load recipes."), "the error alert renders");
  assert.ok(!html.includes("Recipe A"), "the items are hidden behind the error");
  assert.match(buttonAttrs(html, "Select all"), /aria-disabled="true"/, "Select all is disabled");
  assert.match(
    buttonAttrs(html, "Clear selection"),
    /aria-disabled="false"/,
    "Clear selection stays enabled so the existing selection can be dropped",
  );
});
test("no error: Select all is enabled and the items render", async () => {
  const html = await renderPicker({
    ...baseProps,
    error: null,
  });
  assert.ok(html.includes("Recipe A"), "the items render");
  assert.match(buttonAttrs(html, "Select all"), /aria-disabled="false"/, "Select all is enabled");
});
