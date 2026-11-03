/**
 * Contract test for spudly/design-system#405: FixedActionBanner
 * pinned with `position: "absolute"` (inherited from ActionBar), so
 * on web it pinned to its nearest positioned ancestor and scrolled
 * with the document — a consent bar could scroll out of view. The
 * component it replaced in eciperay rendered `position: "fixed"`
 * with the viewport as its containing block.
 *
 * The contract now:
 * 1. FixedActionBanner overrides ActionBar's position with the
 *    platform-conditional `{ default: "absolute", web: "fixed" }`:
 *    viewport-fixed on web, absolute on native (native has no
 *    viewport/document split; absolute edge-pinning inside the
 *    full-screen container is correct there).
 * 2. ActionBar's own styled base keeps `position: "absolute"` — a
 *    plain ActionBar still pins to its screen container, not the
 *    viewport.
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
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readCode(rel) {
  return readFileSync(join(root, rel), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const banner = readCode("src/components/FixedActionBanner.tsx");
const actionBar = readCode("src/components/ActionBar.tsx");

test("FixedActionBanner pins viewport-fixed on web and absolute on native (#405)", () => {
  assert.match(
    banner,
    /position=\{\{\s*default: "absolute",\s*web: "fixed"\s*\}\}/,
    "FixedActionBanner must pass the platform-conditional position to ActionBar",
  );
});

test("ActionBar's styled base stays absolute (#405)", () => {
  assert.match(
    actionBar,
    /position: "absolute"/,
    "ActionBar's base must keep absolute positioning for plain (non-banner) use",
  );
  assert.ok(
    !actionBar.includes('"fixed"'),
    "ActionBar must not pin fixed itself — viewport pinning is FixedActionBanner's contract",
  );
});

let runtimePromise;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider } = await import("tamagui");
    const dist = await import("../dist/index.js");
    return { React, renderToString, TamaguiProvider, ...dist };
  })();
  return runtimePromise;
}

async function renderSsr(element) {
  const { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme } =
    await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  return renderToString(
    React.createElement(TamaguiProvider, { config, defaultTheme: "light" }, element),
  );
}

// The position rules (in source order) for the classes on the
// rendered ActionBar root element. Tamagui emits one class per
// position value; a platform-conditional value emits both rules
// under one class, and the later rule wins the cascade.
function rootPositionRules(html) {
  const match = html.match(/<div name="ActionBar" class="([^"]*)"/);
  assert.ok(match, "expected a rendered ActionBar root element");
  const rules = [];
  for (const cls of match[1].split(/\s+/)) {
    if (!cls.startsWith("_p-")) continue;
    for (const rule of html.matchAll(new RegExp(String.raw`\.${cls}\{position:([a-z]+)\}`, "g"))) {
      rules.push(rule[1]);
    }
  }
  return rules;
}

test("SSR: the banner root's effective web position is fixed (#405)", async () => {
  const { React, FixedActionBanner } = await loadRuntime();
  const html = await renderSsr(
    React.createElement(FixedActionBanner, {
      message: "We use cookies.",
      primaryAction: { label: "Accept", onPress: () => undefined },
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
});
