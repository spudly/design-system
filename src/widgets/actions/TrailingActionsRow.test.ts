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
import "../../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { loadInternalDist } from "../../../test/internalDist.js";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(
  join(here, "../../..", "src", "widgets", "actions", "TrailingActionsRow.tsx"),
  "utf8",
);
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("TrailingActionsRow is exported from the built internal components barrel", async () => {
  const dist: Record<string, any> = await loadInternalDist();
  assert.equal(
    typeof dist.TrailingActionsRow,
    "function",
    "TrailingActionsRow must be exported from the internal components barrel",
  );
});

test("the contract is a leading group plus action children — no styling surface", () => {
  assert.match(code, /leading: ReactNode;/);
  assert.match(code, /children: ReactNode;/);
  assert.ok(!/style|className/.test(code), "no styling props cross the contract");
});

test("the row wraps with the groups spread to opposite ends (#219)", () => {
  assert.match(code, /<Row wrap gap="s" middle between>/);
});

test("the actions group keeps the 12px action gap", () => {
  assert.match(code, /<Row gap="m" middle>/);
});
