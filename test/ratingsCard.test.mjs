/**
 * Contract test for RatingsCard (spudly/design-system#119), the
 * community + viewer ratings card the two recipe surfaces render
 * identically from the shared ratings view-model. Both pages
 * carried the card inline before it moved here; its invariants
 * are the engagement semantics the #169 contract settled: the
 * viewer's star input hides when the viewer is null, pressing
 * the current star clears the rating, a pending rating disables
 * the input, and the stale-rating hints carry the app's verbatim
 * copy.
 *
 * Source scan plus a dist export check, like the other component
 * contract tests. The dist import needs the harness's
 * react-native-svg stub registered first, so this file imports
 * registerSvgStub.mjs before anything else.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const componentsDir = join(here, "..", "src", "components");
const cardSource = readFileSync(join(componentsDir, "RatingsCard.tsx"), "utf8");

const cardCode = cardSource
  .replaceAll(/\/\*[\s\S]*?\*\//g, "")
  .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("RatingsCard is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(typeof dist.RatingsCard, "function", "RatingsCard must be exported from @spudly/ui");
});

test("RatingsCard's types are type-only exports from the built components barrel", () => {
  const types = readFileSync(join(here, "..", "dist", "components", "index.d.ts"), "utf8");
  for (const name of [
    "RatingsCardProps",
    "RatingsCardRatings",
    "RatingsCardCommunityRating",
    "RatingsCardViewerRating",
  ]) {
    assert.match(types, new RegExp(name), `${name} must be exported from the barrel types`);
  }
});

test("the card renders community and viewer blocks with the settled semantics", () => {
  assert.match(cardCode, /<Card variant="muted">/);
  assert.match(
    cardCode,
    /\{ratings\.community \? \(/,
    "the community block renders only with a community rating",
  );
  assert.match(cardCode, /No community ratings yet/, "the empty community line is pinned copy");
  assert.match(
    cardCode,
    /\{ratings\.viewer \? \(/,
    "the viewer block renders only with a viewer (signed out hides it)",
  );
  assert.match(
    cardCode,
    /onChange\(value === star \? null : star\)/,
    "pressing the current star clears the rating",
  );
  assert.match(
    cardCode,
    /pointerEvents=\{interactive \? "auto" : "none"\}/,
    "a pending rating disables the input",
  );
  assert.ok(
    cardCode.includes(
      '"Some community ratings were left on earlier recipe versions and count at half weight in the average."',
    ),
    "the stale community hint is the app's verbatim copy",
  );
  assert.ok(
    cardCode.includes(
      '"Your rating was left on an earlier version of the recipe. Tap a star to update it for the current version."',
    ),
    "the stale viewer hint is the app's verbatim copy",
  );
  assert.ok(!cardCode.includes("lineHeight"), "the card must not set lineHeight");
});
