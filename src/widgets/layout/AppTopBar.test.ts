/**
 * Contract tests for AppTopBar (#564): the nav list must be
 * shrinkable within the bar. The nav list Row declares wrap,
 * but as a flex child of the bar's outer wrapping stack it
 * kept its full intrinsic width without shrink/minWidth,
 * so its own wrap never engaged — at 390px/430px viewports the
 * 6-item nav stayed on one line, the last item (Profile)
 * clipped off-viewport, and the page scrolled sideways.
 *
 * The pin: the nav list Row carries shrink and minWidth 0
 * alongside wrap, and a story renders the 6-item nav inside a
 * 390px frame showing the wrap. #746 (Option B): the nav list
 * and the web item's inner stack are Row/Col rendered at their
 * use sites — no styled roots — so the pins read the use sites.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../../..");

function codeOf(rel: string): string {
  const source = readFileSync(join(root, rel), "utf8");
  return source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const topBar = codeOf("src/widgets/layout/AppTopBar.tsx");
const stories = readFileSync(join(root, "src/widgets/layout/AppTopBar.stories.tsx"), "utf8");

test("the nav list can shrink below its intrinsic width so its wrap engages (#564)", () => {
  // #746: Row's wrap/shrink are flexWrap/flexShrink in the
  // subset's vocabulary; minWidth rides the passthrough.
  assert.match(topBar, /<Row\s+wrap\s+shrink\s+middle\s+gap="xs"\s+minWidth=\{0\}/);
});

test("the web nav item centers its glyph over its label in a column stack (#627)", () => {
  // The stack is a Col: `center` centers the cross axis (the
  // glyph over the label), `middle` the main axis.
  assert.match(topBar, /<Col center middle gap="xs">/);
  // The glyph and label render inside the stack, not as direct
  // children of the anchor (a raw text child lays out inline and
  // the glyph lands left of the label's center).
  assert.match(
    topBar,
    /<Col center middle gap="xs">\s*\{glyph\}\s*<Text[\s\S]*?\{item\.label\}[\s\S]*?<\/Col>/,
  );
});

test("a story demonstrates the 6-item nav at phone width (#564)", () => {
  assert.match(stories, /export const PhoneWidthNav/);
  assert.match(stories, /width=\{390\}/);
});

test("the phone-width stories cover 430px too and render full-bleed (#564)", () => {
  assert.match(stories, /export const PhoneWidthNav430/);
  assert.match(stories, /width=\{430\}/);
  assert.match(stories, /phoneWidthFrame: true/);
});
