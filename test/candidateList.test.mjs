/**
 * Contract test for CandidateList (spudly/design-system#119,
 * recipes-detail tranche): the activation-candidate list
 * extracted from RecipeDetailPage's lifecycle section.
 *
 * The pins hold the shape the page's contract depends on: the
 * list is exported from the package root, a candidate renders
 * its Activate action ONLY when the activation callback is
 * provided (candidate data alone exposes no dead action — the
 * invariant recipeDetailPage.test.mjs pinned while the block
 * lived in the page), a pending activation disables the
 * actions, and activating reports the candidate's id.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "components", "CandidateList.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("CandidateList is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(
    typeof dist.CandidateList,
    "function",
    "CandidateList must be exported from @spudly/ui",
  );
});

test("the Activate action renders only with its callback, and reports the candidate id", () => {
  assert.match(code, /\{onActivatePress \? \(/, "no callback, no Activate button");
  assert.match(code, /onActivatePress\(candidate\.id\)/, "activation reports the candidate id");
  assert.match(
    code,
    /disabled=\{isActivationPending\}/,
    "a pending activation disables the actions",
  );
  assert.match(code, /key=\{candidate\.id\}/, "cards are keyed by the candidate id");
});
