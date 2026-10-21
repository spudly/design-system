/**
 * Regression test for spudly/eciperay#162 (Android: the Recipes and
 * Shared-with-me screens render one giant empty box instead of the
 * filter bar and list).
 *
 * An on-device uiautomator dump (Pixel 8a, app 1.25.0) identified the
 * stretched element as this package's SearchField: its container was
 * 980x1826px — the full content height — and its leading ⌕ glyph's host
 * view was stretched identically, while every sibling control and the
 * recipe list were absent from the layout entirely. The glyph carried
 * `lineHeight` equal to its font size (36), on the theory that web
 * needed a "36px" string (a unitless lineHeight is read by CSS as a
 * multiplier: 36 at a 36px font is a 1296px line box) while React
 * Native "takes the plain number". The dump disproves the native half:
 * Tamagui's style engine resolves the numeric lineHeight the same
 * multiplying way on Android, so the row exploded there too.
 * CheckboxField's ✓ glyph carried the identical pattern (14 at 14px).
 *
 * The contract now:
 * 1. No component passes a lineHeight derived from a font size. The
 *    `glyphLineHeight` construction is banned outright, and any
 *    lineHeight whose value expression references `fontSize` fails.
 * 2. The SearchField row is hard-capped: its styled container declares
 *    a fixed `height: 44` and `overflow: "hidden"`, so a mis-measured
 *    child clips inside the row instead of stretching it.
 * 3. The CheckboxField box clips its glyph the same way
 *    (`overflow: "hidden"` on the fixed 24px box).
 *
 * This is a source scan, not a render test: the failure happens in
 * Android's Yoga layout, which no JS renderer in this repo performs,
 * and the invariant is a per-literal property of the source (same
 * rationale as test/accessibility-roles.test.mjs). The scan fails
 * loudly on forms it cannot classify rather than passing vacuously.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const srcDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src");

function* sourceFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* sourceFiles(path);
    else if (/\.(ts|tsx)$/.test(entry.name)) yield path;
  }
}

const sources = [...sourceFiles(srcDir)].map((path) => ({
  path,
  text: readFileSync(path, "utf8"),
}));

/** Extract the styled() block that follows a component `name:` marker. */
function styledBlock(text, name) {
  const marker = text.indexOf(`name: "${name}"`);
  assert.notEqual(marker, -1, `styled block for ${name} not found`);
  const end = text.indexOf("});", marker);
  assert.notEqual(end, -1, `styled block for ${name} has no terminator`);
  return text.slice(marker, end);
}

test("no glyphLineHeight construction survives anywhere in src", () => {
  for (const { path, text } of sources) {
    assert.ok(
      !text.includes("glyphLineHeight"),
      `${path} still references glyphLineHeight (the fontSize-valued lineHeight banned by eciperay#162)`,
    );
  }
});

test("no lineHeight value is derived from a font size", () => {
  // Every `lineHeight` occurrence, with the value expression that
  // follows it on the same statement (up to the next , } or newline).
  const pattern = /lineHeight\s*(?::|=)\s*\{?\s*([^,}\n]+)/g;
  let found = 0;
  for (const { path, text } of sources) {
    for (const match of text.matchAll(pattern)) {
      found += 1;
      const value = match[1];
      assert.ok(
        !value.includes("fontSize"),
        `${path}: lineHeight value "${value.trim()}" is derived from a font size — Tamagui resolves that as a multiplier and the row explodes (eciperay#162)`,
      );
    }
  }
  assert.ok(
    found > 0,
    "scan found no lineHeight occurrences at all — the pattern is broken, not the tree clean",
  );
});

test("SearchField row is hard-capped at a fixed 44px height with hidden overflow", () => {
  const file = sources.find(({ path }) => path.endsWith("components/SearchField.tsx"));
  assert.ok(file, "src/components/SearchField.tsx not found");
  const block = styledBlock(file.text, "SpudlySearchField");
  assert.ok(/height:\s*44/.test(block), "SpudlySearchField container must declare height: 44");
  assert.ok(
    !/minHeight\s*:/.test(block),
    "SpudlySearchField container must not declare minHeight — a min-height row can still be stretched by a mis-measured child",
  );
  assert.ok(
    /overflow:\s*"hidden"/.test(block),
    'SpudlySearchField container must declare overflow: "hidden" so an exploding child clips inside the row',
  );
});

test("CheckboxField box clips its glyph with hidden overflow", () => {
  const file = sources.find(({ path }) => path.endsWith("components/CheckboxField.tsx"));
  assert.ok(file, "src/components/CheckboxField.tsx not found");
  const block = styledBlock(file.text, "SpudlyCheckboxBox");
  assert.ok(
    /overflow:\s*"hidden"/.test(block),
    'SpudlyCheckboxBox must declare overflow: "hidden" so its glyph cannot paint or measure outside the 24px box',
  );
});
