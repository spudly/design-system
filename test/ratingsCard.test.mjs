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

test("stale ratings and the empty community state render their copy", () => {
  assert.match(code, /STALE_COMMUNITY_RATING_HINT/);
  assert.match(code, /STALE_VIEWER_RATING_HINT/);
  assert.match(code, /No community ratings yet/);
  assert.match(code, /<Card variant="muted">/, "the card renders in the muted card treatment");
});
