/**
 * Behavioral tests for LabelRow (#718): the shared label row
 * LabeledField and LabeledGroup compose — the FieldLabel on the
 * left, the optional action cluster right-aligned beside it, and
 * the caller's separation below the row. LabelRow is internal
 * (not exported from the widgets barrel), so the runtime tests
 * load its built module directly, the same internal-dist route
 * the other contract tests use.
 *
 * The contract:
 * 1. The label text renders, and `htmlFor` reaches the rendered
 *    label element's `for` attribute (web label association).
 * 2. The action cluster renders only when an `action` is given.
 * 3. `separation` 1 renders a 4px space below the row and
 *    `separation` 2 renders 8px (spacing steps 1 and 2).
 */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import "../../../test/registerSvgStub.js";
import { loadInternalDist } from "../../../test/internalDist.js";

let runtimePromise: Promise<Record<string, any>> | undefined;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider }: Record<string, any> = await import("tamagui");
    const dist: Record<string, any> = await loadInternalDist();
    const labelRowModule: Record<string, any> = await import(
      "../../../dist/widgets/data/LabelRow.js"
    );
    return { React, renderToString, TamaguiProvider, ...dist, ...labelRowModule };
  })();
  return runtimePromise;
}

async function renderRow(props: Record<string, any>) {
  const { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme, LabelRow } =
    await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  return renderToString(
    <TamaguiProvider config={config} defaultTheme="light">
      <LabelRow {...props} />
    </TamaguiProvider>,
  );
}

/** Every generated CSS declaration block for one class in the SSR style block. */
function declarationBlocks(html: string, className: string) {
  return html.match(new RegExp(String.raw`\.${className}\{[^}]*\}`, "g")) ?? [];
}

/**
 * The below-the-row padding value the outermost rendered element's
 * classes generate, or null. Tamagui emits the logical
 * `padding-block-end` property for `paddingBlockEnd` on web.
 */
function renderedPaddingBottom(html: string) {
  const element = html.match(/<div class="([^"]*)"/);
  assert.ok(element, `expected a rendered row element in: ${html.slice(-600)}`);
  for (const className of element[1].split(/\s+/)) {
    for (const block of declarationBlocks(html, className)) {
      const padding = block.match(/(?:padding-bottom|padding-block-end):([\d.]+px)/);
      if (padding) return padding[1];
    }
  }
  return null;
}

describe("LabelRow", () => {
  test("renders the label text and forwards htmlFor to the label element", async () => {
    const html = await renderRow({ label: "Recipe title", separation: 1, htmlFor: "title-field" });
    assert.ok(html.includes("Recipe title"), "the label text must render");
    assert.ok(
      /<label[^>]*for="title-field"/.test(html),
      "htmlFor must reach the rendered label element's for attribute",
    );
  });

  test("renders the action cluster only when an action is given", async () => {
    const { React } = await loadRuntime();
    const withAction = await renderRow({
      label: "Ingredients",
      separation: 2,
      action: React.createElement("span", null, "Revert"),
    });
    assert.ok(withAction.includes("Revert"), "the action content must render when given");
    const withoutAction = await renderRow({ label: "Ingredients", separation: 2 });
    assert.ok(!withoutAction.includes("Revert"), "no action content renders when none is given");
  });

  test("separation 1 renders 4px below the row and separation 2 renders 8px", async () => {
    const one = await renderRow({ label: "Name", separation: 1 });
    assert.equal(renderedPaddingBottom(one), "4px");
    const two = await renderRow({ label: "Name", separation: 2 });
    assert.equal(renderedPaddingBottom(two), "8px");
  });
});
