/**
 * Contract test for ScrollShell (spudly/design-system#119), the
 * scrolling page shell: a surface-painted full-height frame whose
 * single ScrollRegion holds the page's blocks in an inset column
 * with the standard separation rhythm.
 *
 * PublicRecipePage hand-rolled this shell as a styled YStack
 * around its ScrollView — styling a page may not apply itself
 * under #119 — so the shell is a component here and the page
 * composes it. The paint is contractual: the page's own surface
 * paint is what its sections sit on inside the host's frame.
 *
 * Source scan plus a dist export check, like the other component
 * contract tests. The dist import needs the harness's
 * react-native-svg stub registered first, so this file imports
 * registerSvgStub.ts before anything else.
 */
import "../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const componentsDir = join(here, "../..", "src", "widgets");
const scrollShellSource = readFileSync(join(componentsDir, "ScrollShell.tsx"), "utf8");

const scrollShellCode = scrollShellSource
  .replaceAll(/\/\*[\s\S]*?\*\//g, "")
  .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("ScrollShell is exported from the built internal components barrel", async () => {
  const dist: Record<string, any> = await import("../../dist/widgets/index.js");
  assert.equal(
    typeof dist.ScrollShell,
    "function",
    "ScrollShell must be exported from the internal components barrel",
  );
});

test("ScrollShellProps is a type-only export from the built components barrel", () => {
  const types = readFileSync(join(here, "../..", "dist", "widgets", "index.d.ts"), "utf8");
  assert.match(types, /ScrollShellProps/);
});

test("ScrollShell paints the surface and scrolls its inset column through ScrollRegion", () => {
  assert.match(scrollShellCode, /export type ScrollShellProps = \{\s+children: ReactNode;\s+\};/);
  // The dedupe rebuild composes ScreenShell — the shell that owns
  // the flex + surface paint — instead of re-painting its own
  // frame (cluster B9: one shell implementation).
  assert.match(scrollShellCode, /<ScreenShell>/);
  assert.equal(
    scrollShellCode.split("<ScrollRegion>").length - 1,
    1,
    "exactly one scroll region: the shell's single scroll",
  );
  assert.match(scrollShellCode, /<YStack\s+width="100%"/);
  assert.match(scrollShellCode, /padding="\$4"\s+gap="\$4"/);
  assert.ok(!scrollShellCode.includes("lineHeight"), "the shell must not set lineHeight");
});

test("ScrollShell caps and centers its column at the public column width (#473)", () => {
  // The cap moved here from the retired PublicFrameLayout: the
  // shell's column is at most 768px wide and centered, so the
  // public recipe sections keep their measure on desktop while
  // the footer (BigFooterShell's, outside this column) stays
  // uncapped.
  assert.match(scrollShellCode, /SCROLL_SHELL_COLUMN_MAX_WIDTH = 768/);
  assert.match(scrollShellCode, /maxWidth=\{SCROLL_SHELL_COLUMN_MAX_WIDTH\}/);
  assert.match(scrollShellCode, /alignSelf="center"/);
});
