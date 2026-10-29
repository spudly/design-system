/**
 * Contract test for StatBand (spudly/design-system#119), the
 * shared stat band extracted for the page de-styling program's
 * foundation: RecipeDetailPage and PublicRecipePage each hand-style
 * the identical band — a recessed gray rounded row spreading its
 * StatCards with space-around — above their ingredient sections.
 *
 * The pins hold the shape: exported from the package root, the
 * contract is children only (the caller composes the stats), and
 * the band owns exactly the fill, radius, vertical padding, and
 * spread the two pages render today — with no outer spacing of its
 * own (separation is the parent stack's, per the layout rules).
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "components", "StatBand.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("StatBand is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(typeof dist.StatBand, "function", "StatBand must be exported from @spudly/ui");
});

test("StatBandProps is a type-only export from the built components barrel", () => {
  const types = readFileSync(join(here, "..", "dist", "components", "index.d.ts"), "utf8");
  assert.match(types, /StatBandProps/);
});

test("the contract is children only — the caller composes the stats", () => {
  assert.match(code, /export type StatBandProps = \{/);
  assert.match(code, /children: ReactNode;/);
});

test("the band owns the recessed fill, radius, vertical padding, and spread", () => {
  assert.match(code, /backgroundColor=\{tokens\.colors\.gray\.gray1\}/);
  assert.match(code, /borderRadius=\{tokens\.radii\.lg\}/);
  assert.match(code, /paddingVertical="\$4"/);
  assert.match(code, /justifyContent="space-around"/);
});

test("the band carries no margin or outer spacing of its own", () => {
  assert.ok(!/margin/.test(code), "StatBand must not set margins — separation is the parent's");
});
