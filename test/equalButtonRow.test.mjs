/**
 * Contract test for EqualButtonRow (spudly/design-system#119),
 * the row whose buttons share its width equally with a 40%
 * minimum, wrapping instead of shrinking — the call-to-action
 * bar treatment PublicRecipePage's CTA card hand-styled onto its
 * Buttons (flex + minWidth on each) before this component, which
 * a page may not do under #119.
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
const rowSource = readFileSync(join(componentsDir, "EqualButtonRow.tsx"), "utf8");

const rowCode = rowSource.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("EqualButtonRow is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(
    typeof dist.EqualButtonRow,
    "function",
    "EqualButtonRow must be exported from @spudly/ui",
  );
});

test("EqualButtonRowProps is a type-only export from the built components barrel", () => {
  const types = readFileSync(join(here, "..", "dist", "components", "index.d.ts"), "utf8");
  assert.match(types, /EqualButtonRowProps/);
});

test("the row owns the equal-share sizing: flexed buttons at a 40% minimum in a wrapping row", () => {
  assert.match(rowCode, /name: "EqualButtonRow"/);
  assert.match(rowCode, /flexWrap: "wrap"/);
  assert.match(
    rowCode,
    /child\.type === Fragment/,
    "a fragment child flattens into the row, so a variant's button set passes as one fragment",
  );
  assert.match(
    rowCode,
    /cloneElement\(item as ReactElement<\{ flex\?: number; minWidth\?: string \}>, \{\s+flex: 1,\s+minWidth: "40%",/,
    "the row sizes each button itself (flex 1, 40% minimum), as the CTA card hand-styled them",
  );
  assert.ok(!rowCode.includes("lineHeight"), "the row must not set lineHeight");
});
