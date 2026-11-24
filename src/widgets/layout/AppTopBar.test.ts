/**
 * Contract tests for AppTopBar (#564): the nav list must be
 * shrinkable within the bar. StyledNavList declares flexWrap,
 * but as a flex child of the bar's outer wrapping stack it
 * kept its full intrinsic width without flexShrink/minWidth,
 * so its own wrap never engaged — at 390px/430px viewports the
 * 6-item nav stayed on one line, the last item (Profile)
 * clipped off-viewport, and the page scrolled sideways.
 *
 * The pin: the styled nav list carries flexShrink: 1 and
 * minWidth: 0 alongside flexWrap: "wrap", and a story renders
 * the 6-item nav inside a 390px frame showing the wrap.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");

function codeOf(rel: string): string {
  const source = readFileSync(join(root, rel), "utf8");
  return source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const topBar = codeOf("src/widgets/layout/AppTopBar.tsx");
const stories = readFileSync(join(root, "src/widgets/layout/AppTopBar.stories.tsx"), "utf8");

function styledBlock(source: string, name: string): string {
  const match = new RegExp(`const ${name} = styled\\([\\s\\S]*?\\}\\);`).exec(source);
  assert.ok(match, `${name} styled block found`);
  return match[0];
}

test("the nav list can shrink below its intrinsic width so its wrap engages (#564)", () => {
  const navList = styledBlock(topBar, "StyledNavList");
  assert.match(navList, /flexWrap: "wrap"/);
  assert.match(navList, /flexShrink: 1/);
  assert.match(navList, /minWidth: 0/);
});

test("the web nav item centers its glyph over its label in a column stack (#627)", () => {
  const stack = styledBlock(topBar, "StyledNavItemStack");
  assert.match(stack, /alignItems: "center"/);
  assert.match(stack, /justifyContent: "center"/);
  // The glyph and label render inside the stack, not as direct
  // children of the anchor (a raw text child lays out inline and
  // the glyph lands left of the label's center).
  assert.match(
    topBar,
    /<StyledNavItemStack>\s*\{glyph\}\s*<Text[\s\S]*?\{item\.label\}[\s\S]*?<\/StyledNavItemStack>/,
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
