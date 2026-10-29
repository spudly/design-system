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
const scrollShellSource = readFileSync(join(componentsDir, "ScrollShell.tsx"), "utf8");

const scrollShellCode = scrollShellSource
  .replaceAll(/\/\*[\s\S]*?\*\//g, "")
  .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("ScrollShell is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(typeof dist.ScrollShell, "function", "ScrollShell must be exported from @spudly/ui");
});

test("ScrollShellProps is a type-only export from the built components barrel", () => {
  const types = readFileSync(join(here, "..", "dist", "components", "index.d.ts"), "utf8");
  assert.match(types, /ScrollShellProps/);
});

test("ScrollShell paints the surface and scrolls its inset column through ScrollRegion", () => {
  assert.match(scrollShellCode, /export type ScrollShellProps = \{\s+children: ReactNode;\s+\};/);
  assert.match(scrollShellCode, /<YStack flex=\{1\} backgroundColor="\$surface">/);
  assert.equal(
    scrollShellCode.split("<ScrollRegion>").length - 1,
    1,
    "exactly one scroll region: the shell's single scroll",
  );
  assert.match(scrollShellCode, /<YStack padding="\$4" gap="\$4">/);
  assert.ok(!scrollShellCode.includes("lineHeight"), "the shell must not set lineHeight");
});
