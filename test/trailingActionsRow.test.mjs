/**
 * Contract test for TrailingActionsRow (spudly/design-system#119,
 * the meals & planning tranche): the row extracted from
 * TagsPage's form rows — a leading group and its actions spread
 * to opposite ends of a wrapping row.
 *
 * The pins hold the #219 treatment verbatim (the row wraps when
 * the groups cannot fit, so an action never overflows
 * off-screen) and the actions group's own 12px gap.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(
  join(here, "..", "src", "components", "TrailingActionsRow.tsx"),
  "utf8",
);
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("TrailingActionsRow is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(
    typeof dist.TrailingActionsRow,
    "function",
    "TrailingActionsRow must be exported from @spudly/ui",
  );
});

test("the contract is a leading group plus action children — no styling surface", () => {
  assert.match(code, /leading: ReactNode;/);
  assert.match(code, /children: ReactNode;/);
  assert.ok(!/style|className/.test(code), "no styling props cross the contract");
});

test("the row wraps with the groups spread to opposite ends (#219)", () => {
  assert.match(
    code,
    /<XStack flexWrap="wrap" gap="\$2" alignItems="center" justifyContent="space-between">/,
  );
});

test("the actions group keeps the 12px action gap", () => {
  assert.match(code, /<XStack gap=\{tokens\.spacing\[3\]\} alignItems="center">/);
});
