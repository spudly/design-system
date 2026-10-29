/**
 * Contract test for TextActionCardRow (spudly/design-system#119,
 * the meals & planning tranche): the card row extracted from
 * MealsHubPage's meal rows — an elevated card whose text block
 * is a link and whose trailing action is a text action.
 *
 * The pins hold the #248 semantics the page's contract
 * (test/mealPages.test.mjs) used to pin in the page source: the
 * row's Delete renders through TextAction (Stephen's ruling: an
 * action never renders in link form), the text block navigates
 * as a link on both platforms (a real anchor on web, a
 * LinkOverlay carrying the composed label over decorative
 * texts on native), and the row carries no separation of its
 * own (CardStack owns the rhythm between rows).
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "components", "TextActionCardRow.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("TextActionCardRow is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(
    typeof dist.TextActionCardRow,
    "function",
    "TextActionCardRow must be exported from @spudly/ui",
  );
});

test("the trailing action renders through TextAction, never a link (#248 ruling)", () => {
  // The action's accessible name composes the row's title (the
  // TagsPage convention — "Delete tag X"): in a list of rows,
  // a bare "Delete" does not say which row it acts on. The
  // visible text stays the bare action label.
  assert.match(
    code,
    /<TextAction accessibilityLabel=\{`\$\{actionLabel\} \$\{title\}`\} onPress=\{onActionPress\}>/,
  );
  assert.ok(!code.includes("TextLink"), "the row must not render a TextLink");
});

test("the contract is a discriminated content shape: an href link and a press action", () => {
  assert.match(code, /href: string;/);
  assert.match(code, /onActionPress: \(\) => void;/);
  assert.ok(!/\bonPress: \(\) => void;/.test(code), "the row itself never presses — it navigates");
});

test("web renders a real anchor carrying the link role and the title as its label", () => {
  assert.match(code, /<Anchor/);
  assert.match(code, /accessibilityRole: "link",\s+accessibilityLabel: title,/);
  assert.match(code, /display="web:flex"/);
});

test("native renders decorative texts under a LinkOverlay with the composed label", () => {
  assert.match(
    code,
    /importantForAccessibility=\{decorative \? "no-hide-descendants" : undefined\}/,
  );
  assert.match(code, /accessibilityLabel=\{subtitle \? `\$\{title\}, \$\{subtitle\}` : title\}/);
  assert.match(code, /accessibilityRole="link"/);
});

test("the frame is the elevated Card in row form; the row owns no outer separation", () => {
  assert.match(code, /<Card variant="elevated" flexDirection="row" alignItems="center" gap="\$3">/);
  assert.ok(!/paddingBlockEnd|margin/.test(code), "row separation belongs to CardStack (#119)");
});
