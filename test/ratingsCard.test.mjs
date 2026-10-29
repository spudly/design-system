/**
 * Contract test for RatingsCard (spudly/design-system#119,
 * recipes-detail tranche): the ratings card extracted from
 * RecipeDetailPage's engagement stack.
 *
 * The pins hold the app adapter's semantics the page carried:
 * pressing the viewer's current star clears the rating (null),
 * a pending rating disables the input behind a non-interactive
 * wrapper, stale ratings show their hints, and a null community
 * rating renders the "No community ratings yet" line.
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
  assert.match(
    code,
    /pointerEvents=\{interactive \? "auto" : "none"\}/,
    "a pending (or read-only) input is non-interactive",
  );
  assert.match(
    code,
    /accessibilityState: \{ disabled: isPending \}/,
    "the pending state is announced as disabled",
  );
});

test("stale ratings and the empty community state render their copy", () => {
  assert.match(code, /STALE_COMMUNITY_RATING_HINT/);
  assert.match(code, /STALE_VIEWER_RATING_HINT/);
  assert.match(code, /No community ratings yet/);
  assert.match(code, /<Card variant="muted">/, "the card renders in the muted card treatment");
});
