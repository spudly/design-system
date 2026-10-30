/**
 * Contract test for PinnedHeaderShell (spudly/design-system#119,
 * the meals & planning tranche): the page shell extracted from
 * MealsHubPage's plans tab — a header pinned above a
 * self-scrolling content region.
 *
 * The pins hold the shell's shape: it paints the page
 * background (gray step 1) at full height, the header block
 * carries the page inset (16px sides and top, no bottom inset —
 * the content region owns its own top spacing), and the shell
 * renders no scroller of its own (the #188 constraint: the
 * content scrolls itself, never nested inside the shell's
 * scroll view).
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "components", "PinnedHeaderShell.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("PinnedHeaderShell is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(
    typeof dist.PinnedHeaderShell,
    "function",
    "PinnedHeaderShell must be exported from @spudly/ui",
  );
});

test("the shell paints the page background and insets the header block", () => {
  assert.match(code, /<YStack flex=\{1\} backgroundColor=\{tokens\.colors\.gray\.gray1\}>/);
  assert.match(code, /<YStack paddingHorizontal="\$4" paddingTop="\$4">/);
});

test("the shell renders no scroller — the content region scrolls itself (#188)", () => {
  assert.ok(!code.includes("ScrollView"), "PinnedHeaderShell must not render a ScrollView");
  assert.ok(!code.includes("ScrollRegion"), "PinnedHeaderShell must not nest a scroll region");
  assert.match(code, /header: ReactNode;/);
  assert.match(code, /children: ReactNode;/);
});
