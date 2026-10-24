/**
 * Contract test for BackLink (spudly/design-system#95).
 *
 * Stephen, reviewing the PR #91 Android VR baselines, found the
 * back link's arrow sitting at the bottom of the text line instead
 * of vertically centered against the label. Pages rendered the
 * affordance inline as a ghost Button carrying the "←" text glyph,
 * whose ink is not centered inside its own em box — on Android the
 * fallback font shifts it further, so it rode at the line's bottom.
 * It is the same glyph bug class as the SearchField search icon
 * (#45): no font size centers asymmetric ink, and an explicit
 * lineHeight is the banned eciperay#162 mechanism.
 *
 * The contract now:
 * 1. The arrow is drawn, not a glyph: BackLink defines a BackArrow
 *    drawn from fixed-dimension shapes in a fixed 20x20 box (the
 *    SearchGlyph pattern), and the "←" character appears nowhere
 *    in the component's rendered code.
 * 2. The row centers by construction: an XStack with
 *    `alignItems: "center"` lays the arrow box and the label side
 *    by side, so flex centering — not font metrics — decides where
 *    the arrow sits.
 * 3. The label defaults to "Back" (the apps' back-link copy) and
 *    renders through the DS Text primitive in the $link role.
 * 4. BackLink is exported from the components index and has
 *    stories, so Chromatic and the Android VR capture it.
 *
 * This is a source scan, not a render test: the failure happens in
 * Android's text layout, which no JS renderer in this repo
 * performs, and the invariant is a per-literal property of the
 * source (same rationale as test/glyph-line-height.test.mjs).
 * Comments are stripped before scanning so prose cannot satisfy —
 * or accidentally trip — the patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const componentsDir = join(here, "..", "src", "components");
const source = readFileSync(join(componentsDir, "BackLink.tsx"), "utf8");
const stories = readFileSync(join(componentsDir, "BackLink.stories.tsx"), "utf8");
const index = readFileSync(join(componentsDir, "index.ts"), "utf8");

// Strip block and line comments so documented patterns in prose
// cannot pass the scan.
const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

test("BackLink source is readable and non-trivial", () => {
  assert.ok(code.length > 500, "expected the full BackLink source");
  assert.match(code, /export function BackLink/);
});

test("the arrow is drawn shapes in a fixed box, not the ← text glyph (#95)", () => {
  assert.ok(
    !code.includes("←"),
    "BackLink still renders the ← text glyph — its ink cannot center vertically on Android (#95); draw the arrow from fixed-dimension shapes instead",
  );
  assert.match(
    code,
    /function BackArrow\(\)/,
    "BackLink must define the BackArrow drawn-icon component",
  );
  const arrowFn = code.slice(code.indexOf("function BackArrow()"));
  assert.ok(
    /width=\{20\}/.test(arrowFn) && /height=\{20\}/.test(arrowFn),
    "BackArrow's box must be fixed at 20x20 so the row's flex centering centers the icon itself",
  );
  assert.ok(
    /rotate="-45deg"/.test(arrowFn) && /rotate="45deg"/.test(arrowFn),
    "the arrowhead is two bars rotated ±45° (the SearchGlyph drawn-icon pattern)",
  );
});

test("the row centers the arrow against the label by construction", () => {
  assert.match(code, /<XStack/, "the arrow and label lay out as one row");
  assert.match(
    code,
    /alignItems="center"/,
    "flex centering — not font metrics — centers the arrow",
  );
  assert.match(code, /minHeight=\{44\}/, "the press target keeps a 44px minimum height");
  assert.match(
    code,
    /accessibilityRole="link"/,
    "the back link exposes link semantics (an RN-supported role)",
  );
});

test("the label defaults to Back and renders in the link role color", () => {
  assert.match(code, /label = "Back"/, "the default label is the apps' back-link copy");
  assert.match(
    code,
    /color="\$link"/,
    "the label renders in the $link role, like the ghost label it replaces",
  );
});

test("BackLink is exported from the components index and has stories", () => {
  assert.match(index, /export \{ BackLink, type BackLinkProps \} from "\.\/BackLink\.js";/);
  assert.match(stories, /title: "Components\/BackLink"/);
  assert.match(stories, /export const Default/);
});
