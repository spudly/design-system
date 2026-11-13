/**
 * Contract test for spudly/design-system#405: FixedActionBanner
 * pinned with `position: "absolute"` (inherited from ActionBar), so
 * on web it pinned to its nearest positioned ancestor and scrolled
 * with the document — a consent bar could scroll out of view. The
 * component it replaced in eciperay rendered `position: "fixed"`
 * with the viewport as its containing block.
 *
 * The contract now:
 * 1. The pinning styles live inside ActionBar's own styled
 *    definition, in its `pinning` variant: the "viewport" mode
 *    carries the platform-conditional position
 *    `{ default: "absolute", web: "fixed" }` (viewport-fixed on web,
 *    absolute on native — native has no viewport/document split;
 *    absolute edge-pinning inside the full-screen container is
 *    correct there) plus the web-only viewport cap
 *    (`maxHeight: "100%"`) and internal scroll (`overflow: "auto"`).
 *    FixedActionBanner selects that mode through the semantic
 *    `pinning="viewport"` prop and passes NO style props — DS
 *    components own their styles; styling props never cross a
 *    component boundary, not even between DS components.
 * 2. ActionBar's own styled base keeps `position: "absolute"` and
 *    `pinning` defaults to "container", which adds no styles — a
 *    plain ActionBar still pins to its screen container, not the
 *    viewport, and carries neither the cap nor the scroll.
 * 3. Runtime (SSR, against the built output): the banner root's
 *    position class carries both rules with `fixed` LAST (same
 *    specificity, so source order decides — fixed wins on web),
 *    while a plain ActionBar root's position class carries only
 *    `absolute` rules.
 *
 * Run against the built output: `npm run build` first (the `test`
 * script does both). The source scan strips comments first, like
 * the other contract tests here, so prose cannot satisfy or trip
 * the patterns.
 */
import "../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function readCode(rel) {
  return readFileSync(join(root, rel), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const banner = readCode("src/widgets/FixedActionBanner.tsx");
const actionBar = readCode("src/widgets/ActionBar.tsx");

test("FixedActionBanner selects viewport pinning and passes no style props (#405)", () => {
  assert.match(
    banner,
    /pinning="viewport"/,
    "FixedActionBanner must select ActionBar's viewport pinning through the semantic pinning prop",
  );
  for (const styleProp of ["position=", "maxHeight=", "overflow="]) {
    assert.ok(
      !banner.includes(styleProp),
      `FixedActionBanner must not pass the ${styleProp} style prop — ActionBar owns its styles`,
    );
  }
});

test("ActionBar owns the viewport pinning styles in its pinning variant (#405)", () => {
  assert.match(
    actionBar,
    /position: \{\s*default: "absolute",\s*web: "fixed"\s*\}/,
    "ActionBar's viewport pinning must carry the platform-conditional position (fixed on web, absolute on native)",
  );
  assert.match(
    actionBar,
    /maxHeight: \{\s*web: "100%"\s*\}/,
    "ActionBar's viewport pinning must cap the web bar at the viewport height (100% of the fixed containing block)",
  );
  assert.match(
    actionBar,
    /overflow: \{\s*web: "auto"\s*\}/,
    "ActionBar's viewport pinning must let an over-height web bar scroll internally so its content stays reachable",
  );
  assert.ok(
    actionBar.indexOf("pinning:") < actionBar.indexOf('web: "fixed"'),
    "the pinning styles must live inside ActionBar's pinning variant, not its base styles",
  );
});

test("ActionBar's styled base stays absolute and pinning defaults to container (#405)", () => {
  assert.match(
    actionBar,
    /position: "absolute"/,
    "ActionBar's base must keep absolute positioning for plain (non-banner) use",
  );
  assert.match(
    actionBar,
    /container: \{\}/,
    "container pinning must add no styles over the absolute base",
  );
  assert.match(
    actionBar,
    /pinning: "container"/,
    "pinning must default to container so a plain ActionBar keeps its existing contract",
  );
});

let runtimePromise;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider } = await import("tamagui");
    // #298: the package root is pages-only; the internal surface
    // is loaded from its dist modules directly (this .mjs test is
    // not part of the compiled test suite, so it cannot use the
    // test/internalDist.ts helper the .ts tests share).
    const dist = {
      ...(await import("../../dist/tokens/index.js")),
      ...(await import("../../dist/themes/index.js")),
      ...(await import("../../dist/tamagui.config.js")),
      ...(await import("../../dist/widgets/index.js")),
    };
    const voiceFixtures: Record<string, any> = await import("../../dist/voice/fixtures.js");
    const voiceModule: Record<string, any> = await import("../../dist/voice/index.js");
    return { React, renderToString, TamaguiProvider, ...dist, ...voiceFixtures, ...voiceModule };
  })();
  return runtimePromise;
}

async function renderSsr(element) {
  const { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme, VoiceProvider, fixtureVoice } =
    await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  return renderToString(
    React.createElement(
      TamaguiProvider,
      { config, defaultTheme: "light" },
      React.createElement(VoiceProvider, { voice: fixtureVoice }, element),
    ),
  );
}

// The values of one CSS property for the classes on the rendered
// ActionBar root element, collected in STYLESHEET order (the order
// the rules appear in the rendered document), because the cascade —
// not the class attribute's order — decides which of two
// same-specificity rules wins. Tamagui emits one class per value; a
// platform-conditional value emits both rules under one class, and
// the later rule in the stylesheet wins.
function rootCssValues(html, property) {
  const match = html.match(/<div name="ActionBar" class="([^"]*)"/);
  assert.ok(match, "expected a rendered ActionBar root element");
  const rootClasses = new Set(match[1].split(/\s+/));
  const values = [];
  for (const rule of html.matchAll(/\.([_a-zA-Z0-9-]+)\{([^}]*)\}/g)) {
    if (!rootClasses.has(rule[1])) continue;
    const declaration = rule[2].match(new RegExp(String.raw`${property}\s*:\s*([^;}]+)`));
    if (declaration) values.push(declaration[1]);
  }
  return values;
}

function rootPositionRules(html) {
  return rootCssValues(html, "position");
}

test("SSR: the banner root's effective web position is fixed (#405)", async () => {
  const { React, FixedActionBanner } = await loadRuntime();
  const html = await renderSsr(
    React.createElement(FixedActionBanner, {
      message: "We use cookies.",
      primaryAction: { label: "Accept", onPress: () => "accept" },
    }),
  );
  const rules = rootPositionRules(html);
  assert.ok(rules.includes("fixed"), `expected a position:fixed rule, got: ${rules.join(", ")}`);
  assert.equal(
    rules.at(-1),
    "fixed",
    `the fixed rule must come last so it wins the cascade, got: ${rules.join(", ")}`,
  );
});

test("SSR: the banner root caps height at the viewport and scrolls on web (#405)", async () => {
  const { React, FixedActionBanner } = await loadRuntime();
  const html = await renderSsr(
    React.createElement(FixedActionBanner, {
      message: "We use cookies.",
      primaryAction: { label: "Accept", onPress: () => "accept" },
    }),
  );
  assert.equal(
    rootCssValues(html, "max-height").at(-1),
    "100%",
    "the banner root's effective max-height must be 100% (the last matching rule wins the cascade)",
  );
  assert.equal(
    rootCssValues(html, "overflow").at(-1),
    "auto",
    "the banner root's effective overflow must be auto (the last matching rule wins the cascade)",
  );
});

test("SSR: a plain ActionBar root stays absolute (#405)", async () => {
  const { React, ActionBar, Text } = await loadRuntime();
  const html = await renderSsr(
    React.createElement(ActionBar, null, React.createElement(Text, null, "Actions")),
  );
  const rules = rootPositionRules(html);
  assert.ok(rules.length > 0, "expected position rules for the ActionBar root");
  assert.ok(
    rules.every((rule) => rule === "absolute"),
    `a plain ActionBar must carry only absolute position rules, got: ${rules.join(", ")}`,
  );
  assert.deepEqual(
    rootCssValues(html, "max-height"),
    [],
    "a plain ActionBar must not carry the banner's viewport cap",
  );
  assert.deepEqual(
    rootCssValues(html, "overflow"),
    [],
    "a plain ActionBar must not carry the banner's internal scroll",
  );
});
