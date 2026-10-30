/**
 * PublicRecipePage's adoption pins: the #341 extraction set
 * (EqualButtonRow + MessageCard), the #331 library panels, and
 * the stories coverage.
 *
 * Split out of publicRecipePage.test.mjs, which sits at the
 * repo's max-lines cap; the assertions scan the same stripped
 * page and stories sources. The #119 review of this page found
 * its CTA bar sizing its own buttons (a raw stack plus
 * per-button cloneElement flex/minWidth) and its message states
 * styling their own shell — treatments the no-page-styling rule
 * reserves to library components. The component-only change
 * (#341) extracted both treatments; these pins keep the page
 * from growing them back: the bar passes its buttons to
 * EqualButtonRow, the message states render MessageCard, and
 * no tamagui import remains in the page at all.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pagesDir = join(here, "..", "src", "pages");
const source = readFileSync(join(pagesDir, "PublicRecipePage.tsx"), "utf8");
const stories = readFileSync(join(pagesDir, "PublicRecipePage.stories.tsx"), "utf8");

// Strip block and line comments so documented patterns in prose
// cannot pass the scan.
const strip = (text) =>
  text.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
const code = strip(source);
const storiesCode = strip(stories);

test("the CTA sizing and message shell are the shared components' (#341)", () => {
  assert.ok(
    code.includes('import { EqualButtonRow } from "../components/EqualButtonRow.js";'),
    "the page imports the library EqualButtonRow",
  );
  assert.ok(
    code.includes('import { MessageCard } from "../components/MessageCard.js";'),
    "the page imports the library MessageCard",
  );
  assert.match(
    code,
    /<EqualButtonRow>\{buttons\}<\/EqualButtonRow>/,
    "the CTA bar passes its buttons to EqualButtonRow, which owns their equal sizing",
  );
  assert.ok(
    !code.includes("cloneElement"),
    "the page must not size its own buttons (EqualButtonRow owns the cloneElement sizing)",
  );
  assert.ok(
    !code.includes('from "tamagui"'),
    "the page imports no tamagui primitives: every treatment it renders is a DS component's",
  );
});

test("the sections render through the shared library panels (#331)", () => {
  for (const panel of [
    "RecipeOverviewPanel",
    "RecipeIngredientsPanel",
    "RecipeInstructionsPanel",
  ]) {
    assert.ok(
      code.includes(`import { ${panel} } from "../components/${panel}.js";`),
      `the page imports the library ${panel}`,
    );
  }
  // The view-models pass into the panels unchanged (the shared shapes).
  assert.match(code, /<RecipeIngredientsPanel ingredients=\{ingredients\} \/>/);
  assert.match(code, /<RecipeInstructionsPanel instructions=\{instructions\} \/>/);
});

test("stories exercise every union state and both CTA variants", () => {
  for (const name of [
    "Default",
    "SignedIn",
    "ClonePending",
    "Minimal",
    "Loading",
    "NotFound",
    "Unavailable",
    "Ingredients",
  ]) {
    assert.match(
      storiesCode,
      new RegExp(`export const ${name}: Story`),
      `PublicRecipePage.stories.tsx must export a ${name} story`,
    );
  }
  for (const state of ["loading", "notFound", "unavailable"]) {
    assert.match(
      storiesCode,
      new RegExp(`<PublicRecipePage state="${state}" />`),
      `a story must render the ${state} union member`,
    );
  }
  assert.match(storiesCode, /variant: "signedIn"/, "a story must exercise the signed-in CTA bar");
  assert.match(
    storiesCode,
    /isClonePending: clonePending/,
    "a story must exercise the pending clone",
  );
  assert.match(
    storiesCode,
    /renderComments: \(\) =>/,
    "a story must pass the comments slot with stand-in content",
  );
});
