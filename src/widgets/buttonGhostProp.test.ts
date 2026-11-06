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

/**
 * Strip comments without touching string literals: a `//` inside
 * a URL (or any quoted string) is data, not a comment — eating the
 * rest of that line could hide a real call site from the scan
 * below (CodeRabbit round on PR #502).
 */
function stripComments(code: string) {
  let out = "";
  let quote: string | null = null;
  for (let i = 0; i < code.length; i += 1) {
    const ch = code[i] ?? "";
    const next = code[i + 1] ?? "";
    if (quote !== null) {
      out += ch;
      if (ch === "\\") {
        out += next;
        i += 1;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      out += ch;
      continue;
    }
    if (ch === "/" && next === "/") {
      while (i < code.length && code[i] !== "\n") i += 1;
      out += "\n";
      continue;
    }
    if (ch === "/" && next === "*") {
      i += 2;
      while (i < code.length && !(code[i] === "*" && code[i + 1] === "/")) i += 1;
      i += 1;
      continue;
    }
    out += ch;
  }
  return out;
}

function readCode(rel: string) {
  return stripComments(readFileSync(join(root, rel), "utf8"));
}

// Every spelling of the deprecated value, as patterns so quote
// style and whitespace cannot slip a call site past the scan:
// the JSX attribute form, the JSX expression form, and the
// object-property form (story args, quoted key included).
const spellings = [
  /\bvariant\s*=\s*(["'])ghost\1/,
  /\bvariant\s*=\s*\{\s*(["'])ghost\1\s*\}/,
  /(?:\bvariant|["']variant["'])\s*:\s*(["'])ghost\1/,
];

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
  // the host repos' usages are removed. The variant's own frame
  // stays transparent and borderless (the first `ghost:` block in
  // the frame config is the variant's, ahead of the boolean
  // treatment), so a host still spelling it renders unchanged.
  assert.match(button, /ghost: "\$link"/);
  const variantBlock = /ghost: \{([^}]*)\}/.exec(button);
  assert.ok(variantBlock, "the deprecated ghost variant block must exist in the frame config");
  assert.match(variantBlock[1], /backgroundColor: "transparent"/);
  assert.match(variantBlock[1], /borderWidth: 0/);
});

test("both Button forms forward the ghost prop to their frames (#463)", () => {
  // If either frame stopped receiving `ghost`, the config checks
  // above would still pass while the button kept its fill/border —
  // so pin the wiring itself, the same both-forms count pattern
  // the #459 border contract uses. (Rendered-frame assertions are
  // Storybook/Chromatic QA's layer; every Button contract in this
  // repo is a source scan like this one.)
  const applications = button.match(/\{\.\.\.\(ghost \? \{ ghost: true \} : null\)\}/g);
  assert.equal(
    applications?.length,
    2,
    "the button form and the href form must both pass ghost to their frames",
  );
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
    for (const spelling of spellings) {
      assert.ok(
        !spelling.test(code),
        `${rel} must use the ghost prop, not the deprecated ghost variant (${spelling})`,
      );
    }
  }
});

test("the scan's comment stripping preserves string literals (PR #502 round)", () => {
  // A `//` inside a URL string must not eat the rest of the line:
  // a deprecated spelling after it on the same line stays visible.
  const line = 'const u = "https://example.com//a"; <Button variant="ghost" />;';
  const stripped = stripComments(line);
  assert.ok(
    spellings.some((spelling) => spelling.test(stripped)),
    "the spelling after the URL must be detected",
  );
  // A real line comment still strips.
  assert.ok(!stripComments('// <Button variant="ghost" />').includes("variant"));
});

test("the scan detects a quoted object key for the deprecated variant (PR #502 round)", () => {
  assert.ok(spellings.some((spelling) => spelling.test('{ "variant": "ghost" }')));
  assert.ok(spellings.some((spelling) => spelling.test("{ 'variant': 'ghost' }")));
  assert.ok(spellings.some((spelling) => spelling.test('{ variant: "ghost" }')));
});
