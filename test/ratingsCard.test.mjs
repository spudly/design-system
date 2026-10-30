/**
 * Contract test for RatingsCard (spudly/design-system#119,
 * recipes-detail tranche): the ratings card extracted from
 * RecipeDetailPage's engagement stack.
 *
 * The pins hold the app adapter's semantics the page carried:
 * pressing the viewer's current star clears the rating (null),
 * a pending rating disables the input itself (and a handler-less
 * card renders it read-only), stale ratings show their hints,
 * and a null community rating renders the "No community
 * ratings yet" line.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "components", "RatingsCard.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("RatingsCard is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(typeof dist.RatingsCard, "function", "RatingsCard must be exported from @spudly/ui");
});

test("the viewer's star input keeps the adapter's clear-on-repress and pending semantics", () => {
  assert.match(
    code,
    /onChange\(value === star \? null : star\)/,
    "pressing the current star clears the rating",
  );
  // The non-interactive states are the input's own props, so
  // the semantics reach the star controls (a pointerEvents
  // wrapper would leave them focusable and announced enabled).
  assert.match(
    code,
    /readOnly=\{onChange === undefined\}/,
    "a card without a change handler renders the input read-only",
  );
  assert.match(code, /disabled=\{isPending\}/, "a pending rating disables the input itself");
  assert.ok(!code.includes("pointerEvents"), "no pointerEvents wrapper around the input");
});

// Runtime (SSR) pins for #316 at the card surface: a pending
// rating's stars are out of the tab order and announced disabled;
// a handler-less (read-only) card renders no star controls at all.
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

async function renderToHtml(element) {
  const { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme } =
    await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  return renderToString(
    React.createElement(TamaguiProvider, { config, defaultTheme: "light" }, element),
  );
}

const noop = () => null;
const community = { stars: "★★★★☆", label: "4.6 (9)" };

test("SSR: a pending card's stars are unfocusable and announced disabled (#316)", async () => {
  const { React, RatingsCard } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(RatingsCard, {
      ratings: { community, viewer: { value: 4, isPending: true } },
      onViewerRatingChange: noop,
    }),
  );
  const tags = html.match(/<[a-z]+[^>]*aria-label="Rate [^>]*>/g) ?? [];
  assert.equal(tags.length, 5, "five viewer star controls render");
  for (const tag of tags) {
    assert.ok(tag.includes('aria-disabled="true"'), `disabled is announced: ${tag}`);
    assert.ok(!tag.includes('aria-disabled="false"'), `no contradictory announcement: ${tag}`);
    assert.ok(tag.includes('tabindex="-1"'), `out of the tab order: ${tag}`);
  }
  // The pending dim is exactly ONE 0.5, carried by the rating
  // group itself. Derive the group's opacity utility class from
  // its own tag (the class name differs between render setups),
  // then count the elements carrying that exact class: a second
  // dimmed element (a wrapper around the group, or the stars
  // themselves) would compound the rendered opacity to 0.25
  // while sharing the same single CSS rule, so the rule count
  // alone cannot pin this — the element count does.
  const groupTag = (html.match(/<[a-z]+[^>]*role="radiogroup"[^>]*>/) ?? [])[0] ?? "";
  const opacityClass = (groupTag.match(/_o-[a-z0-9]+/) ?? [])[0];
  assert.ok(opacityClass, "the pending rating group carries an opacity utility class");
  const dimmedTags =
    html.match(new RegExp(`<[a-z]+[^>]*class="[^"]*${opacityClass}[^"]*"[^>]*>`, "g")) ?? [];
  assert.equal(dimmedTags.length, 1, "pending dims exactly one element (no stacked 0.5s)");
});

test("SSR: a read-only card renders no focusable star controls (#316)", async () => {
  const { React, RatingsCard } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(RatingsCard, {
      ratings: { community, viewer: { value: 4 } },
    }),
  );
  assert.equal(
    (html.match(/aria-label="Rate /g) ?? []).length,
    0,
    "no radio star controls in the read-only card",
  );
  assert.ok(html.includes('aria-label="Rated 4 out of 5 stars"'), "the static display is named");
});

test("stale ratings and the empty community state render their copy", () => {
  assert.match(code, /STALE_COMMUNITY_RATING_HINT/);
  assert.match(code, /STALE_VIEWER_RATING_HINT/);
  assert.match(code, /No community ratings yet/);
  assert.match(code, /<Card variant="muted">/, "the card renders in the muted card treatment");
});
