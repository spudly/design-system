/**
 * Contract test for the Button ghost PROP
 * (spudly/design-system#463, Stephen's 2026-11-05 Storybook review,
 * adjusted by Stephen 2026-11-06).
 *
 * Ghost is a boolean prop that composes with the real variants —
 * not a variant itself: the background becomes transparent, any
 * border is removed, and the label/glyph ink matches the variant
 * (primary $primary, secondary gray10, danger danger7). The ghost
 * VARIANT is deprecated, not removed: it keeps rendering for hosts
 * that still spell it (with its legacy $link ink) until those
 * hosts migrate, and no in-repo call site may use it.
 *
 * Source scan like this repo's other contract tests (comments
 * stripped first, so the assertions pin the styling code itself).
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function readCode(rel: string) {
  return readFileSync(join(root, rel), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const button = readCode("src/widgets/Button.tsx");

test("the frame carries a boolean ghost treatment: transparent, borderless (#463)", () => {
  const ghostBoolean =
    /ghost: \{\s*true: \{\s*backgroundColor: "transparent",\s*borderWidth: 0,/.exec(button);
  assert.ok(
    ghostBoolean,
    "buttonFrameConfig must define ghost.true as transparent + borderWidth 0",
  );
});

test("the ghost prop inks per variant: primary $primary, secondary gray10, danger danger7 (#463)", () => {
  const map = /const ghostLabelColors = \{([^}]*)\}/.exec(button);
  assert.ok(map, "the ghostLabelColors map must exist");
  assert.match(map[1], /primary: "\$primary"/);
  assert.match(map[1], /secondary: tokens\.colors\.gray\.gray10/);
  assert.match(map[1], /danger: tokens\.colors\.danger\.danger7/);
});

test("the deprecated ghost variant still renders for hosts that spell it (#463)", () => {
  // Deprecation, not removal (Stephen's 2026-11-06 adjustment):
  // the variant block and its legacy $link label color stay until
  // the host repos' usages are removed.
  assert.match(button, /ghost: "\$link"/);
});

test("no in-repo call site spells the deprecated ghost variant (#463)", () => {
  const srcFiles = readdirSync(join(root, "src"), { recursive: true })
    .map((entry) => String(entry))
    .filter(
      (entry) => (entry.endsWith(".ts") || entry.endsWith(".tsx")) && !entry.endsWith(".test.ts"),
    );
  assert.ok(srcFiles.length > 100, "the scan must cover the source tree");
  for (const rel of srcFiles) {
    const code = readCode(join("src", rel));
    assert.ok(
      !code.includes('variant="ghost"') && !code.includes('variant: "ghost"'),
      `${rel} must use the ghost prop, not the deprecated ghost variant`,
    );
  }
});
