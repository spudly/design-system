/**
 * Contract test for MainLandmark (spudly/design-system#366,
 * #473), the `main` landmark region: a flex column carrying the
 * web-only `main` role through the shared accessibility
 * translation, so a page whose outermost frame it is (the public
 * recipe surface after #473 retired PublicPageFrame) composes
 * its landmark without rendering a layout primitive or
 * spreading a role prop itself (#119).
 *
 * Source scan plus a dist export check, like the other
 * component contract tests. The dist import needs the harness's
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
const source = readFileSync(join(here, "../..", "src", "widgets", "MainLandmark.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("MainLandmark is exported from the built internal components barrel", async () => {
  const dist: Record<string, any> = await import("../../dist/widgets/index.js");
  assert.equal(
    typeof dist.MainLandmark,
    "function",
    "MainLandmark must be exported from the internal components barrel",
  );
});

test("MainLandmarkProps is a type-only export from the built components barrel", () => {
  const types = readFileSync(join(here, "../..", "dist", "widgets", "index.d.ts"), "utf8");
  assert.match(types, /MainLandmarkProps/);
});

test("MainLandmark fills its shell space and carries the web main role", () => {
  assert.match(code, /export type MainLandmarkProps = \{\s+children: ReactNode;\s+\};/);
  assert.match(code, /<YStack flex=\{1\} \{\.\.\.mainRoleProps\}>/);
  // #547: on web the column grows with its content instead of
  // flex:1's zero basis, which collapsed it inside the page
  // shell's unbounded column (PR #556 rendered audit).
  assert.match(code, /if \(isWeb\) \{/);
  assert.match(code, /<YStack flexGrow=\{1\} flexDirection="column" \{\.\.\.mainRoleProps\}>/);
  assert.ok(
    !code.includes("accessibilityRole"),
    "the landmark uses the web role prop, not accessibilityRole (not an RN role)",
  );
  assert.ok(!code.includes("lineHeight"), "the region must not set lineHeight");
});
