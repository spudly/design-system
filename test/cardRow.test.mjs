/**
 * Contract test for CardRow (spudly/design-system#119), the
 * generic titled card row for lists: an elevated card whose text
 * block — title over an optional meta line — is the press target,
 * with an optional trailing action button when the action's label
 * and callback are wired.
 *
 * Extracted from MealPlansPage in tranche 2 and generalized the
 * same day at Stephen's direction: components extracted under
 * #119 must be reusable across sites/apps, so the row carries no
 * app domain in its name or API — title, meta line, and action
 * label are caller-supplied content, and the action's treatment
 * is a tone (`neutral` / `danger`), not a baked-in Delete. The
 * pins hold the shape: the card treatment, the div-button
 * pressable pattern (the OptionCard pattern: a Tamagui view, not
 * a Pressable, so web keeps the layout), the keyboard activation,
 * and the action guard.
 *
 * Source scan plus a dist export check, like the other component
 * contract tests. The dist import needs the harness's
 * react-native-svg stub registered first, so this file imports
 * registerSvgStub.mjs before anything else.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const componentsDir = join(here, "..", "src", "components");
const cardRowSource = readFileSync(join(componentsDir, "CardRow.tsx"), "utf8");

const cardRowCode = cardRowSource
  .replaceAll(/\/\*[\s\S]*?\*\//g, "")
  .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("CardRow is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(typeof dist.CardRow, "function", "CardRow must be exported from @spudly/ui");
});

test("CardRowProps is a type-only export from the built components barrel", () => {
  const types = readFileSync(join(here, "..", "dist", "components", "index.d.ts"), "utf8");
  assert.match(types, /CardRowProps/);
});

test("CardRow's contract is title, optional subtitle, press, and an optional labeled action", () => {
  assert.match(cardRowCode, /title: string;/);
  assert.match(cardRowCode, /subtitle\?: string;/);
  assert.match(cardRowCode, /onPress: \(\) => void;/);
  assert.match(cardRowCode, /actionLabel\?: string;/);
  assert.match(cardRowCode, /onActionPress\?: \(\) => void;/);
  assert.match(cardRowCode, /actionTone\?: "danger" \| "neutral";/);
});

test("CardRow keeps the elevated card and the div-button pressable pattern", () => {
  assert.match(
    cardRowCode,
    /<Card variant="elevated" flexDirection="row" alignItems="center" gap="\$3">/,
  );
  assert.match(
    cardRowCode,
    /\{\.\.\.platformAccessibilityProps\(\{ accessibilityRole: "button" \}\)\}/,
  );
  assert.match(cardRowCode, /onPress=\{onPress\}/);
  assert.match(cardRowCode, /tabIndex=\{0\}/);
  assert.match(cardRowCode, /cursor="web:pointer"/);
  assert.match(cardRowCode, /event\.key === "Enter" \|\| event\.key === " "/);
  // The row carries no spacing outside its card: separation between
  // rows is the composing stack's gap (CardStack's 8px rhythm),
  // never the row's own padding.
  assert.doesNotMatch(cardRowCode, /paddingBlockEnd/);
});

test("CardRow's title takes the md semibold treatment and the subtitle the hint variant", () => {
  assert.match(
    cardRowCode,
    /fontSize=\{tokens\.typography\.fontSize\.md\}\s+fontWeight=\{tokens\.typography\.fontWeight\.semibold\}/,
  );
  assert.match(cardRowCode, /\{subtitle \? <Text variant="hint">\{subtitle\}<\/Text> : null\}/);
});

test("CardRow's action renders only when its label and callback are both wired", () => {
  assert.match(cardRowCode, /\{onActionPress && actionLabel \? \(/);
  assert.match(cardRowCode, /variant="secondary"/);
  assert.match(cardRowCode, /size="sm"/);
  assert.match(cardRowCode, /actionTone === "danger"/);
  assert.match(cardRowCode, /backgroundColor: tokens\.colors\.danger\.danger1,/);
  assert.match(cardRowCode, /color: tokens\.colors\.danger\.danger8,/);
  assert.match(cardRowCode, /onPress=\{onActionPress\}/);
  assert.match(cardRowCode, /\{actionLabel\}/);
});
