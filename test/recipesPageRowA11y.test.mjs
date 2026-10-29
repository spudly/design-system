/**
 * RecipesPage row link accessibility (follow-up to #248 stage 2):
 * each row exposes two links (thumbnail and text) to the recipe,
 * and both must announce the row. The thumbnail target wraps only
 * an image (or an empty placeholder), so its accessible name is
 * the title alone; the text target's name also carries the
 * subtitle ("Title, Subtitle") — a title-only label would
 * override the name React Native derives from its Text children
 * and drop the subtitle's announcement (the count and nutrition
 * summary). On web both are real anchors with the labels routed
 * through the accessibility translator; on native the childless
 * stretched LinkOverlays carry the same labels while the visible
 * texts are decorative (that pairing is pinned in
 * nativeLinkDecorative.test.mjs) and pointer-transparent, so hit
 * testing falls through them to the text frame's overlay beneath
 * — while the subtitle action keeps its own presses inside the
 * box-none flow.
 *
 * Since the #119 recipes-list tranche the row is the MediaRow
 * component; the pins run against it. Comments are stripped
 * before scanning so prose cannot satisfy the patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const mediaRow = readFileSync(join(here, "..", "src", "components", "MediaRow.tsx"), "utf8")
  .replaceAll(/\/\*[\s\S]*?\*\//g, "")
  .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
const page = readFileSync(join(here, "..", "src", "pages", "RecipesPage.tsx"), "utf8")
  .replaceAll(/\/\*[\s\S]*?\*\//g, "")
  .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

function count(code, literal) {
  return code.split(literal).length - 1;
}

test("both row links exist on both platforms, each carrying the row href", () => {
  assert.equal(
    count(mediaRow, 'accessibilityRole: "link"'),
    2,
    "the two web anchors declare the link role through the translator",
  );
  assert.equal(
    count(mediaRow, 'accessibilityRole="link"'),
    2,
    "the two native LinkOverlays declare the link role directly",
  );
  assert.equal(
    count(mediaRow, "href={href}"),
    4,
    "both web anchors and both native overlays carry the href",
  );
});

test("the media link is named by the title; the text link composes title and subtitle", () => {
  assert.match(
    mediaRow,
    /const textLabel = subtitle \? `\$\{title\}, \$\{subtitle\}` : title;/,
    "the text link's label composes title and subtitle with the comma separator",
  );
  assert.equal(count(mediaRow, "accessibilityLabel: title"), 1, "the web media anchor's label");
  assert.equal(
    count(mediaRow, "accessibilityLabel={title}"),
    1,
    "the native media overlay's label",
  );
  assert.equal(count(mediaRow, "accessibilityLabel: textLabel"), 1, "the web text anchor's label");
  assert.equal(
    count(mediaRow, "accessibilityLabel={textLabel}"),
    1,
    "the native text overlay's label",
  );
});

test("native hit testing falls through the decorative texts; the action keeps its presses", () => {
  assert.equal(count(mediaRow, 'pointerEvents={native ? "none" : undefined}'), 2);
  assert.equal(count(mediaRow, 'pointerEvents={native ? "box-none" : undefined}'), 1);
});

test("the row is never a pressable card; the only press target is the caller's subtitle action", () => {
  assert.ok(!mediaRow.includes("onPress"), "MediaRow renders no press handler of its own");
  assert.ok(!mediaRow.includes("<Button"), "MediaRow renders no button");
  assert.ok(
    !page.includes("TouchableOpacity"),
    "the page renders no raw pressable — the log-cook control is RatingStars",
  );
});

test("the page wires the row href and fields through unchanged", () => {
  assert.match(page, /<MediaRow\s+href=\{item\.href\}\s+title=\{item\.title\}/);
  assert.match(page, /subtitle=\{item\.subtitle\}/);
  assert.match(page, /imageUrl=\{item\.imageUrl\}/);
});
