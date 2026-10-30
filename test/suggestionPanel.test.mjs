/**
 * Contract test for SuggestionPanel (spudly/design-system#119,
 * recipes-detail tranche): the tinted suggestion panel
 * extracted from RecipeDetailPage's substitutions panel.
 *
 * The pins hold the panel's shape: exported from the package
 * root, the primary-tinted frame, a heading, and one
 * name → suggestion entry per item, keyed by the entry id.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "components", "SuggestionPanel.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("SuggestionPanel is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(
    typeof dist.SuggestionPanel,
    "function",
    "SuggestionPanel must be exported from @spudly/ui",
  );
});

test("the panel renders its heading and one entry per suggestion", () => {
  assert.match(code, /backgroundColor="\$primarySubtle"/, "the frame is the primary tint");
  assert.match(code, /\{title\}/, "the heading is the caller's title");
  assert.match(code, /entries\.map\(\(entry\) => \(/, "one block per entry");
  assert.match(code, /key=\{entry\.id\}/, "entries are keyed by id");
  assert.match(code, /\{entry\.label\}/);
  assert.match(code, /\{entry\.detail\}/);
});
