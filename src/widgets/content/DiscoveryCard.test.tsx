/**
 * Runtime contract tests for DiscoveryCard's per-card actions
 * (spudly/design-system#791), rendered against the built output
 * (SSR — `npm test` builds before running):
 *
 * 1. With `actions`, the card renders an overflow-menu trigger
 *    named "Actions for <title>" carrying the Dropdown family's
 *    `aria-haspopup` wiring.
 * 2. The trigger is a SIBLING of the card's link, never nested
 *    inside the anchor — activating it must not navigate.
 * 3. Without actions (or with an empty array) no menu trigger
 *    renders and the card is exactly the plain link card.
 *
 * The open menu itself renders through the Dropdown's Popover
 * portal, which does not SSR — menu-row rendering and
 * close-on-select are covered by the Dropdown family's own
 * tests and the Storybook stories.
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
    const distRuntime = await loadInternalDist();
    return {
      React,
      renderToString,
      TamaguiProvider,
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

const cardProps = {
  title: "Creamy Tuscan Garlic Chicken",
  subtitle: "By Maria · ★ 4.5 · Satiety 60",
  href: "/recipe/tuscan-chicken/creamy-tuscan-garlic-chicken",
};

describe("discoveryCardActions", () => {
  test("a card with actions renders a menu trigger named for the card", async () => {
    const { DiscoveryCard } = await loadRuntime();
    const html = await renderToHtml(
      <DiscoveryCard
        {...cardProps}
        actions={[
          { id: "hide", label: "Hide this recipe", onSelect: () => { /* noop */ } },
          { id: "show-less", label: "Show less like this", onSelect: () => { /* noop */ } },
        ]}
      />,
    );
    assert.match(
      html,
      /aria-label="Actions for Creamy Tuscan Garlic Chicken"/,
      "the overflow trigger's accessible name must name the card it acts on",
    );
    assert.match(
      html,
      /aria-haspopup/,
      "the trigger must carry the Dropdown family's haspopup wiring",
    );
  });

  test("the menu trigger is not nested inside the card's anchor", async () => {
    const { DiscoveryCard } = await loadRuntime();
    const html = await renderToHtml(
      <DiscoveryCard
        {...cardProps}
        actions={[{ id: "hide", label: "Hide this recipe", onSelect: () => { /* noop */ } }]}
      />,
    );
    const anchorStart = html.indexOf("<a ");
    const anchorEnd = html.indexOf("</a>");
    assert.ok(anchorStart !== -1 && anchorEnd > anchorStart, "the card must render its anchor");
    const anchorHtml = html.slice(anchorStart, anchorEnd);
    assert.ok(
      !anchorHtml.includes("Actions for"),
      "the menu trigger must be a sibling of the link, not nested inside it",
    );
    assert.ok(
      html.indexOf("Actions for") > anchorEnd,
      "the menu trigger must render outside the anchor element",
    );
  });

  test("a card without actions renders no menu trigger", async () => {
    const { DiscoveryCard } = await loadRuntime();
    const plain = await renderToHtml(<DiscoveryCard {...cardProps} />);
    assert.ok(!plain.includes("Actions for"), "no actions must render no menu trigger");
    const empty = await renderToHtml(<DiscoveryCard {...cardProps} actions={[]} />);
    assert.ok(!empty.includes("Actions for"), "an empty actions array must render no menu");
  });
});
