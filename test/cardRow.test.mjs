/**
 * Contract test for CardRow (spudly/design-system#119), the
 * generic titled card row for lists: an elevated card whose text
 * block — title over an optional meta line — is the activation
 * target, with an optional trailing action button when the
 * action's label and callback are wired.
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
 * and the action guard. Since #248's navigation rule the row
 * also ships a link form (the Button pattern: `href`
 * discriminates it from `onPress`) — a real anchor on web, a
 * frame + LinkOverlay on native, with the texts marked decorative
 * and the composed title-and-subtitle label as the row's one
 * accessibility stop — so a navigating list row stays a link.
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

test("CardRow's keyboard activation ignores held-key repeats (#313)", () => {
  assert.match(cardRowCode, /repeat\?: boolean/, "the key handler types the repeat flag");
  assert.match(
    cardRowCode,
    /if \(!event\.repeat\) \{\s+onPress\?\.\(\);\s+\}/,
    "only the first keydown of a held key presses",
  );
  // preventDefault still runs for repeat events, before the guard,
  // so a held Space key does not scroll the page.
  const handler = cardRowCode.slice(cardRowCode.indexOf("handleKeyDown"));
  assert.ok(handler.includes("event.preventDefault()"), "the key handler calls preventDefault");
  assert.ok(
    handler.indexOf("event.preventDefault()") < handler.indexOf("!event.repeat"),
    "preventDefault runs before the repeat guard",
  );
});

test("CardRow's title takes the md semibold treatment and the subtitle the hint variant", () => {
  assert.match(
    cardRowCode,
    /fontSize=\{tokens\.typography\.fontSize\.md\}\s+fontWeight=\{tokens\.typography\.fontWeight\.semibold\}/,
  );
  assert.match(cardRowCode, /\{subtitle \? \(/, "the subtitle renders only when provided");
  assert.match(
    cardRowCode,
    /<Text\s+variant="hint"\s+accessible=\{decorative \? false : undefined\}/,
    "the subtitle takes the hint variant and the decorative flag (the native link form hides it behind the overlay's composed label)",
  );
});

test("CardRow's link form renders an anchor on web and a LinkOverlay on native (#248)", () => {
  assert.match(cardRowCode, /href: string;/, "the link form's discriminant is the href");
  assert.match(cardRowCode, /onPress\?: never/, "the two forms are mutually exclusive");
  assert.match(
    cardRowCode,
    /<Anchor\s+flex=\{1\}\s+minWidth=\{0\}\s+gap="\$1"\s+href=\{href\}/,
    "the web link form is an anchor carrying the href, in the press block's structural frame",
  );
  assert.match(
    cardRowCode,
    /<LinkOverlay\s+href=\{href\}/,
    "the native link form's overlay carries the href",
  );
  assert.match(
    cardRowCode,
    /accessibilityLabel=\{subtitle \? `\$\{title\}, \$\{subtitle\}` : title\}/,
    "the overlay's label composes the title and the subtitle — the visible texts are decorative in this form",
  );
  assert.match(
    cardRowCode,
    /accessible=\{decorative \? false : undefined\}/,
    "the native link form marks its visible texts decorative",
  );
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
