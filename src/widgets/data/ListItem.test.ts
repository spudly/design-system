/**
 * Contract test for ListItem (spudly/design-system#119), the
 * generic hairline list row: a title line — an optional
 * caller-supplied prefix, the title, an optional caller-supplied
 * suffix — over an optional meta line, with a hairline below.
 *
 * Extracted from MealPlanDetailPage's entry rows in tranche 2
 * and generalized the same day at Stephen's direction:
 * components extracted under #119 must be reusable across
 * sites/apps, so the row carries no app domain in its name or
 * API — the entry kind's "Meal · " / "Recipe · " lead-in crosses
 * as a caller-supplied `prefix`, the "(unavailable)" text as a
 * caller-supplied `titleSuffix`, and the recipe-access state as
 * a generic `isDisabled` treatment (no press, no focus, marked
 * disabled). The page composes only its kind prefix and passes
 * each entry's href through to the row's link form. The pins
 * hold the shape, including the disabled treatment and the
 * link form.
 *
 * Source scan plus a dist export check, like the other component
 * contract tests. The dist import needs the harness's
 * react-native-svg stub registered first, so this file imports
 * registerSvgStub.ts before anything else.
 */
import "../../../test/registerSvgStub.js";
import { loadInternalDist } from "../../../test/internalDist.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const componentsDir = join(here, "../../..", "src", "widgets");
const listRowSource = readFileSync(join(componentsDir, "data/ListItem.tsx"), "utf8");

const listRowCode = listRowSource
  .replaceAll(/\/\*[\s\S]*?\*\//g, "")
  .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

// Since #587 phase 3 the subtitle line lives in the shared
// RowSubtitleText in RowTextContent.tsx (also composed by
// RowTextContent for the card rows); the subtitle pins below
// read that source, and ListItem's own pins hold that it
// delegates to the shared component.
const rowTextSource = readFileSync(join(componentsDir, "data/RowTextContent.tsx"), "utf8");
const rowTextCode = rowTextSource
  .replaceAll(/\/\*[\s\S]*?\*\//g, "")
  .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("ListItem is exported from the built internal components barrel", async () => {
  const dist: Record<string, any> = await loadInternalDist();
  assert.equal(
    typeof dist.ListItem,
    "function",
    "ListItem must be exported from the internal components barrel",
  );
});

test("ListItemProps is a type-only export from the built components barrel", () => {
  const types = readFileSync(join(here, "../../..", "dist", "widgets", "index.d.ts"), "utf8");
  assert.match(types, /ListItemProps/);
});

test("ListItem's contract is caller-supplied content plus a disabled flag and a press", () => {
  assert.match(listRowCode, /prefix\?: string;/);
  assert.match(listRowCode, /title: string;/);
  assert.match(listRowCode, /titleSuffix\?: string;/);
  assert.match(listRowCode, /subtitle\?: string;/);
  assert.match(listRowCode, /isDisabled\?: boolean;/);
  assert.match(listRowCode, /onPress: \(\) => void;/);
});

test("ListItem keeps the hairline row and composes the title line from its parts", () => {
  assert.match(
    listRowCode,
    /<YStack borderBottomWidth=\{1\} borderBottomColor=\{tokens\.colors\.gray\.gray2\}>/,
  );
  assert.match(listRowCode, /paddingVertical="\$3"/);
  assert.match(
    listRowCode,
    /fontSize=\{tokens\.typography\.fontSize\.md\}\s+fontWeight=\{tokens\.typography\.fontWeight\.medium\}/,
  );
  assert.match(listRowCode, /\{prefix\}\s+\{title\}\s+\{titleSuffix\}/);
  assert.match(
    listRowCode,
    /import \{ RowSubtitleText \} from "\.\/RowTextContent\.js";/,
    "ListItem imports the shared RowSubtitleText (#587 phase 3)",
  );
  assert.match(
    listRowCode,
    /\{subtitle \? <RowSubtitleText subtitle=\{subtitle\} decorative=\{decorative\} \/> : null\}/,
    "the subtitle renders only when provided, through the shared RowSubtitleText",
  );
  assert.match(
    rowTextCode,
    /export function RowSubtitleText\(\{\s+subtitle,\s+decorative = false,/,
    "the shared RowSubtitleText carries the subtitle line (#587 phase 3)",
  );
  assert.match(
    rowTextCode,
    /<Text\s+variant="hint"\s+accessible=\{decorative \? false : undefined\}\s+importantForAccessibility=\{decorative \? "no-hide-descendants" : undefined\}/,
    "the subtitle takes the hint variant and the decorative flag (the native link form hides it behind the overlay's composed label)",
  );
  assert.match(
    rowTextCode,
    /variant="hint"[\s\S]*?>\s+\{subtitle\}\s+<\/Text>/,
    "RowSubtitleText renders the subtitle text itself",
  );
});

test("ListItem's link form renders an anchor on web and a LinkOverlay on native; a disabled row renders no link (#248)", () => {
  assert.match(listRowCode, /href: string;/, "the link form's discriminant is the href");
  assert.match(listRowCode, /onPress\?: never/, "the two forms are mutually exclusive");
  assert.match(
    listRowCode,
    /href !== undefined && !isDisabled/,
    "the link rendering is gated on the href form and the row being enabled — a disabled row falls through to the plain disabled rendering",
  );
  assert.match(
    listRowCode,
    /<Anchor\s+href=\{href\}/,
    "the web link form is an anchor carrying the href",
  );
  assert.match(
    listRowCode,
    /<LinkOverlay\s+href=\{href\}/,
    "the native link form's overlay carries the href",
  );
  assert.match(
    listRowCode,
    /subtitle \? `, \$\{subtitle\}` : ""/,
    "the overlay's label composes the title line and the subtitle when present — the visible texts are decorative in this form",
  );
});

test("ListItem's enabled row is a keyboard-operable button; the disabled row is marked disabled", () => {
  assert.match(
    listRowCode,
    /platformAccessibilityProps\(\{ accessibilityState: \{ disabled: true \} \}\)/,
  );
  assert.match(
    listRowCode,
    /\.\.\.platformAccessibilityProps\(\{ accessibilityRole: "button" \}\)/,
  );
  assert.match(listRowCode, /tabIndex: 0,/);
  assert.match(listRowCode, /cursor: "web:pointer",/);
  assert.match(listRowCode, /event\.key === "Enter" \|\| event\.key === " "/);
});
