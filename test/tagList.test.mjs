/**
 * Contract test for TagList (spudly/design-system#119,
 * recipes-detail tranche): the display tag list extracted from
 * RecipeDetailPage's tag row.
 *
 * The pins hold the #211 contract: tags render through Badge's
 * color form (the name-typed color, resolved by Badge — never a
 * re-implemented tint or a raw hex at the call site), one badge
 * per tag in the caller's order, in a wrapping chip row.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "components", "TagList.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("TagList is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(typeof dist.TagList, "function", "TagList must be exported from @spudly/ui");
});

test("tags render through Badge's color form, one per tag", () => {
  assert.match(code, /<Badge key=\{tag\.id\} color=\{tag\.color\}>/);
  assert.match(code, /\{tag\.name\}/, "the badge label is the tag's name");
  assert.match(code, /tags\.map\(\(tag\) =>/, "one badge per tag, in order");
  assert.match(code, /<ChipRow>/, "the badges flow in a chip row");
  assert.match(code, /color: TagColorName;/, "the color is a strictly-typed tag color name");
  assert.ok(!code.includes("{tag.color}22"), "the list must not re-implement the tag tint inline");
});
