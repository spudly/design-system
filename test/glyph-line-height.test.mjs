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
 *    Scale definitions (`lineHeight: { ... }` in the token scale and
 *    the Tamagui font config) are not values: they are checked for
 *    `fontSize` references inside the block instead of being captured
 *    as a value, and comments are stripped before scanning so prose
 *    cannot satisfy or trip the scan. The extractor is self-tested
 *    against fixtures below, so a broken scan fails loudly instead of
 *    passing on a vacuous match count.
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

/**
 * Strip // and block comments, preserving string/template contents and
 * newlines. (Template `${}` nesting is not tracked; a `//` inside a
 * template expression would be misread — no such form exists in src,
 * and the self-test below pins the behavior the scan relies on.)
 */
function stripComments(text) {
  let out = "";
  let state = "code"; // code | single | double | template | line | block
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1] ?? "";
    if (state === "code") {
      if (ch === "/" && next === "/") state = "line";
      else if (ch === "/" && next === "*") state = "block";
      else if (ch === "'") state = "single";
      else if (ch === '"') state = "double";
      else if (ch === "`") state = "template";
      out += state === "line" || state === "block" ? " " : ch;
      if (state === "line" || state === "block") {
        out += " ";
        i += 1;
      }
    } else if (state === "line") {
      if (ch === "\n") {
        state = "code";
        out += ch;
      } else out += " ";
    } else if (state === "block") {
      if (ch === "*" && next === "/") {
        state = "code";
        out += "  ";
        i += 1;
      } else out += ch === "\n" ? "\n" : " ";
    } else {
      // Inside a string or template literal: copy verbatim.
      out += ch;
      if (ch === "\\") {
        out += next;
        i += 1;
      } else if (
        (state === "single" && ch === "'") ||
        (state === "double" && ch === '"') ||
        (state === "template" && ch === "`")
      ) {
        state = "code";
      }
    }
  }
  return out;
}

/** The balanced `{ ... }` block starting at `start` (which must be `{`). */
function balancedBlock(text, start) {
  let depth = 0;
  for (let i = start; i < text.length; i += 1) {
    if (text[i] === "{") depth += 1;
    else if (text[i] === "}") {
      depth -= 1;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return text.slice(start);
}

/**
 * Every fontSize-derived lineHeight in comment-stripped source, as
 * human-readable violation strings. A `lineHeight: { ... }` object is
 * a scale definition, not a value: it is never captured as a value,
 * but a `fontSize` reference inside its block is still a violation.
 */
function lineHeightViolations(rawText) {
  const text = stripComments(rawText);
  const violations = [];
  const pattern = /lineHeight\s*(?::|=)\s*/g;
  for (const match of text.matchAll(pattern)) {
    const valueStart = match.index + match[0].length;
    if (text[valueStart] === "{") {
      const block = balancedBlock(text, valueStart);
      if (block.includes("fontSize")) {
        violations.push(`lineHeight scale block references fontSize: ${block.slice(0, 80)}…`);
      }
      continue;
    }
    const value = /[^,}\n]+/.exec(text.slice(valueStart))?.[0] ?? "";
    if (value.includes("fontSize")) {
      violations.push(`lineHeight value "${value.trim()}" references fontSize`);
    }
  }
  return violations;
}

test("lineHeight extractor flags the defect form and ignores scale definitions (self-test)", () => {
  assert.deepEqual(
    lineHeightViolations("const a = { lineHeight: tokens.typography.fontSize.md };"),
    ['lineHeight value "tokens.typography.fontSize.md" references fontSize'],
  );
  assert.equal(
    lineHeightViolations('const b = { lineHeight: `${tokens.typography.fontSize["4xl"]}px` };')
      .length,
    1,
  );
  assert.deepEqual(lineHeightViolations("lineHeight: { 1: 18, 2: 21 }"), []);
  assert.equal(
    lineHeightViolations('lineHeight: { 8: tokens.typography.fontSize["4xl"] }').length,
    1,
  );
  assert.deepEqual(
    lineHeightViolations("// lineHeight: tokens.typography.fontSize.md\nconst c = 1;"),
    [],
  );
  assert.deepEqual(
    lineHeightViolations("const d = { lineHeight: tokens.typography.lineHeight.normal };"),
    [],
  );
});

test("no lineHeight value is derived from a font size", () => {
  // The scan must actually reach the files that define the lineHeight
  // scales — an empty or misrooted walk fails here, not vacuously.
  assert.ok(sources.length > 10, `scan visited only ${sources.length} source files`);
  for (const suffix of ["tamagui.config.ts", "tokens/typography.ts"]) {
    assert.ok(
      sources.some(({ path }) => path.endsWith(suffix)),
      `scan did not visit ${suffix} — the walk is broken, not the tree clean`,
    );
  }
  for (const { path, text } of sources) {
    assert.deepEqual(
      lineHeightViolations(text),
      [],
      `${path}: fontSize-derived lineHeight — Tamagui resolves that as a multiplier and the row explodes (eciperay#162)`,
    );
  }
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
