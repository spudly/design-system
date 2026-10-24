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
 * 2. The SearchField glyph renders inside its own fixed box
 *    (`SpudlySearchFieldGlyphBox`: `height: 44`, `overflow: "hidden"`),
 *    so a mis-measured glyph clips there instead of stretching the
 *    row. The row container itself keeps `minHeight: 44` and no fixed
 *    height: SearchField forwards input props via ...rest, so a
 *    caller-sized input must still be able to grow the row.
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
  // Suffix checks below compare against forward-slash paths; join()
  // produces backslashes on Windows, so keep a normalized twin.
  posixPath: path.replaceAll("\\", "/"),
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
    switch (state) {
      case "code": {
        if (ch === "/" && next === "/") state = "line";
        else if (ch === "/" && next === "*") state = "block";
        else {
          switch (ch) {
            case "'": {
              state = "single";
              break;
            }
            case '"': {
              state = "double";
              break;
            }
            case "`": {
              state = "template";
              break;
            }
            default: {
              break;
            }
          }
        }
        out += state === "line" || state === "block" ? " " : ch;
        if (state === "line" || state === "block") {
          out += " ";
          i += 1;
        }
        break;
      }
      case "line": {
        if (ch === "\n") {
          state = "code";
          out += ch;
        } else out += " ";
        break;
      }
      case "block": {
        if (ch === "*" && next === "/") {
          state = "code";
          out += "  ";
          i += 1;
        } else out += ch === "\n" ? "\n" : " ";
        break;
      }
      default: {
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
 * The value expression starting at `start`, walked across lines until
 * a `,`, `;`, or closing bracket at nesting depth 0. Brackets and
 * template literals are tracked so a multiline ternary or call does
 * not terminate the capture early (a first-newline cutoff would let a
 * multiline fontSize-derived expression slip past the scan).
 *
 * A value that STARTS with a quoted literal (the JSX attribute form,
 * `lineHeight="$3"`) is just that literal unless an operator follows
 * it (concatenation, ternary, member access): nothing else terminates
 * a plain value inside a JSX tag, so walking on would consume the
 * NEXT attribute and blame its fontSize on this lineHeight.
 */
function valueExpression(text, start) {
  const quote = text[start];
  if (quote === '"' || quote === "'") {
    let end = start + 1;
    while (end < text.length && text[end] !== quote) {
      if (text[end] === "\\") end += 1;
      end += 1;
    }
    end += 1; // past the closing quote
    let next = end;
    while (next < text.length && /\s/.test(text[next])) next += 1;
    if (!"+?:|&.".includes(text[next] ?? "")) return text.slice(start, end);
    return text.slice(start, end) + valueExpression(text, next);
  }
  let depth = 0;
  let i = start;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "`") {
      // Skip a template literal (its ${} braces are not nesting here).
      i += 1;
      while (i < text.length && text[i] !== "`") {
        if (text[i] === "\\") i += 1;
        i += 1;
      }
      i += 1;
      continue;
    }
    if (ch === "{" || ch === "(" || ch === "[") depth += 1;
    else if (ch === "}" || ch === ")" || ch === "]") {
      if (depth === 0) break;
      depth -= 1;
    } else if ((ch === "," || ch === ";") && depth === 0) break;
    i += 1;
  }
  return text.slice(start, i);
}

/**
 * Every fontSize-derived lineHeight in comment-stripped source, as
 * human-readable violation strings. What follows the separator decides
 * the form: a `{ ... }` after `:` is a scale definition (never a
 * value — but a `fontSize` reference inside its block still counts);
 * a `{ ... }` after `=` is a JSX expression container, whose whole
 * block is the value; anything else is a plain value expression,
 * captured across lines by valueExpression.
 */
function lineHeightViolations(rawText) {
  const text = stripComments(rawText);
  const violations = [];
  const pattern = /lineHeight\s*(:|=)\s*/g;
  for (const match of text.matchAll(pattern)) {
    const separator = match[1];
    const valueStart = match.index + match[0].length;
    if (text[valueStart] === "{") {
      const block = balancedBlock(text, valueStart);
      if (block.includes("fontSize")) {
        violations.push(
          separator === ":"
            ? `lineHeight scale block references fontSize: ${block.slice(0, 80)}…`
            : `lineHeight expression references fontSize: ${block.slice(0, 80)}…`,
        );
      }
      continue;
    }
    const value = valueExpression(text, valueStart);
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
    // eslint-disable-next-line no-template-curly-in-string -- fixture source text intentionally contains a template literal
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
  // A multiline JSX expression container: the capture must not stop
  // at the first newline and miss the fontSize-derived branches.
  assert.equal(
    lineHeightViolations(
      // eslint-disable-next-line no-template-curly-in-string -- fixture source text intentionally contains a template literal
      'const e = <Text lineHeight={\n  isWeb\n    ? `${tokens.typography.fontSize["4xl"]}px`\n    : tokens.typography.fontSize["4xl"]\n} />;',
    ).length,
    1,
  );
  // A multiline plain value with no fontSize reference passes.
  assert.deepEqual(lineHeightViolations("const f = { lineHeight:\n  isWeb ? 36 : 36 };"), []);
  // A QUOTED value is a complete value (the JSX attribute form): the
  // walker must not run on into the following attribute and blame
  // its fontSize on this lineHeight — same line or across lines.
  assert.deepEqual(
    lineHeightViolations(
      'const h = <Text lineHeight="$3" fontSize={tokens.typography.fontSize.md} />;',
    ),
    [],
  );
  assert.deepEqual(
    lineHeightViolations(
      'const i = <Text lineHeight="$3"\n  fontSize={tokens.typography.fontSize.md} />;',
    ),
    [],
  );
  assert.deepEqual(lineHeightViolations("const j = <Text lineHeight={'$3'} fontSize={36} />;"), []);
  // But a quoted literal CONCATENATED with a fontSize value is still
  // a fontSize-derived lineHeight and must flag.
  assert.equal(
    lineHeightViolations('const k = { lineHeight: "$" + tokens.typography.fontSize.md };').length,
    1,
  );
});

test("no lineHeight value is derived from a font size", () => {
  // The scan must actually reach the files that define the lineHeight
  // scales — an empty or misrooted walk fails here, not vacuously.
  assert.ok(sources.length > 10, `scan visited only ${sources.length} source files`);
  for (const suffix of ["tamagui.config.ts", "tokens/typography.ts"]) {
    assert.ok(
      sources.some(({ posixPath }) => posixPath.endsWith(suffix)),
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

test("SearchField glyph is capped in its own fixed box; the row keeps minHeight", () => {
  const file = sources.find(({ posixPath }) => posixPath.endsWith("components/SearchField.tsx"));
  assert.ok(file, "src/components/SearchField.tsx not found");
  // Declarations are checked on comment-stripped text so prose in the
  // block's comments can neither satisfy nor trip them.
  const stripped = stripComments(file.text);
  const glyphBox = styledBlock(stripped, "SpudlySearchFieldGlyphBox");
  assert.ok(/height:\s*44/.test(glyphBox), "SpudlySearchFieldGlyphBox must declare height: 44");
  assert.ok(
    /overflow:\s*"hidden"/.test(glyphBox),
    'SpudlySearchFieldGlyphBox must declare overflow: "hidden" so an exploding glyph clips inside its own box',
  );
  const row = styledBlock(stripped, "SpudlySearchField");
  assert.ok(/minHeight:\s*44/.test(row), "SpudlySearchField container must declare minHeight: 44");
  assert.ok(
    !/^\s*height\s*:/m.test(row),
    "SpudlySearchField container must not declare a fixed height — SearchField forwards input props via ...rest, and a caller-sized input must still be able to grow the row",
  );
});

test("SearchField search icon is drawn shapes, not a text glyph, so it centers by construction (#45)", () => {
  const file = sources.find(({ posixPath }) => posixPath.endsWith("components/SearchField.tsx"));
  assert.ok(file, "src/components/SearchField.tsx not found");
  const stripped = stripComments(file.text);
  // The ⌕ character (U+2315) must not survive as rendered content:
  // its ink is asymmetric inside its em box, so no font size centers
  // it — 36px rode high (line box 54px > the 44px box) and 24px still
  // rode high on Stephen's 2026-10-22 on-device check. (Prose mentions
  // in comments are stripped before this scan.)
  assert.ok(
    !stripped.includes("⌕"),
    "SearchField still renders the ⌕ text glyph — its ink cannot center vertically on Android (design-system#45); draw the icon from fixed-dimension shapes instead",
  );
  // The replacement icon is fixed-geometry: a SearchGlyph component
  // rendering a fixed 24px box. If someone swaps it back to a font
  // glyph, this fails loudly rather than passing vacuously.
  assert.ok(
    /function SearchGlyph\(\)/.test(stripped),
    "SearchField must define the SearchGlyph drawn-icon component (design-system#45)",
  );
  const glyphFn = stripped.slice(stripped.indexOf("function SearchGlyph()"));
  assert.ok(
    /width=\{24\}/.test(glyphFn) && /height=\{24\}/.test(glyphFn),
    "SearchGlyph's box must be fixed at 24x24 so StyledGlyphBox's flex centering centers the icon itself (design-system#45)",
  );
});

test("CheckboxField box clips its glyph with hidden overflow", () => {
  const file = sources.find(({ posixPath }) => posixPath.endsWith("components/CheckboxField.tsx"));
  assert.ok(file, "src/components/CheckboxField.tsx not found");
  const block = styledBlock(stripComments(file.text), "SpudlyCheckboxBox");
  assert.ok(
    /overflow:\s*"hidden"/.test(block),
    'SpudlyCheckboxBox must declare overflow: "hidden" so its glyph cannot paint or measure outside the 24px box',
  );
});
