/**
 * Contract test for PublicPageFrame (spudly/design-system#169):
 * the public chrome as a DS building block the public surfaces
 * (#168/#170/#171) reuse, split out of
 * test/publicRecipePage.test.mjs (the page contract stays there).
 *
 * The invariants pinned here are Stephen's decisions on #169
 * (2026-10-28):
 * 1. The frame is exported from the pages subpath index, imports
 *    nothing from an app package, and runs no queries or
 *    mutations — business logic stays app-side.
 * 2. The frame owns the public chrome: brand + Sign in header,
 *    the wide (max-w-3xl) centered column, the footer note and
 *    legal links — with navigation leaving through intent
 *    callbacks only, and no scroll view of its own (the page
 *    inside owns the scroll).
 * 3. No explicit lineHeight (the #162 rule).
 * 4. Stories exercise the frame around real page content and a
 *    stand-in, at desktop and phone widths, so Chromatic
 *    captures them. The phone-width story is named
 *    NarrowViewport, never Narrow: a "Narrow" story's baseline
 *    file would end in "-narrow.png", the suffix the VR pipeline
 *    reserves for narrow-viewport variant captures.
 *
 * This is a source scan, not a render test, for the same reason
 * as test/recipeDetailPage.test.mjs: the repo has no JS renderer
 * for these components (Chromatic screenshots in CI), and the
 * invariant is a per-literal property of the source. Comments are
 * stripped before scanning so prose cannot satisfy the patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pagesDir = join(here, "..", "src", "pages");
const componentsDir = join(here, "..", "src", "components");
const frameSource = readFileSync(join(pagesDir, "PublicPageFrame.tsx"), "utf8");
const frameStories = readFileSync(join(pagesDir, "PublicPageFrame.stories.tsx"), "utf8");
const index = readFileSync(join(pagesDir, "index.ts"), "utf8");

// Strip block and line comments so documented patterns in prose
// cannot pass the scan.
const strip = (text) =>
  text.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
// The frame's internals moved into shared components in the #119
// de-styling tranche — PublicFrameLayout owns the shell and the
// column, PublicFrameHeader / PublicFrameFooter own the bands,
// BrandLink owns the wordmark — so the frame's source for these
// scans is the page plus the components it composes. The page
// itself keeps the contract: the intent callbacks and the
// DS-owned copy constants.
const frameCode = strip(
  [
    frameSource,
    readFileSync(join(componentsDir, "PublicFrameLayout.tsx"), "utf8"),
    readFileSync(join(componentsDir, "PublicFrameHeader.tsx"), "utf8"),
    readFileSync(join(componentsDir, "PublicFrameFooter.tsx"), "utf8"),
    readFileSync(join(componentsDir, "BrandLink.tsx"), "utf8"),
  ].join("\n"),
);
const pageCode = strip(frameSource);
const frameStoriesCode = strip(frameStories);

test("PublicPageFrame is exported from the pages subpath", () => {
  assert.match(index, /PublicPageFrame,/, "index.ts must export PublicPageFrame");
  assert.match(
    index,
    /from "\.\/PublicPageFrame\.js"/,
    "the frame export must come from ./PublicPageFrame.js",
  );
  assert.match(pageCode, /export function PublicPageFrame/);
});

test("the frame imports no app package and runs no data hooks", () => {
  assert.ok(!frameCode.includes("@eciperay"), "the frame must not import an app package");
  assert.ok(!frameCode.includes("useQuery"), "the frame must not fetch (queries stay app-side)");
  assert.ok(
    !frameCode.includes("useMutation"),
    "the frame must not mutate (mutations stay app-side)",
  );
  assert.ok(!frameCode.includes("@tanstack"), "no react-query in the frame");
});

test("the frame owns the public chrome with intent callbacks and no scroll of its own", () => {
  for (const intent of ["onBrandPress", "onSignInPress", "onPrivacyPress", "onTermsPress"]) {
    assert.match(
      pageCode,
      new RegExp(String.raw`${intent}: \(\) => void;`),
      `the frame's ${intent} intent is a plain callback out`,
    );
  }
  for (const copy of [
    'BRAND_LABEL = "Eciperay"',
    'SIGN_IN_LABEL = "Sign in"',
    'FOOTER_NOTE = "Recipes shared on Eciperay may be viewed without an account."',
    'PRIVACY_LABEL = "Privacy Policy"',
    'TERMS_LABEL = "Terms of Service"',
  ]) {
    assert.ok(pageCode.includes(copy), `the frame must carry ${copy}`);
  }
  assert.ok(
    frameCode.includes("COLUMN_MAX_WIDTH = 768"),
    "the frame must carry COLUMN_MAX_WIDTH = 768 (PublicFrameLayout owns the column)",
  );
  assert.match(
    frameCode,
    /maxWidth=\{COLUMN_MAX_WIDTH\}/,
    "the header, column, and footer share the wide public column",
  );
  assert.ok(
    !frameCode.includes("<ScrollView"),
    "the frame must not scroll — the page inside owns its scroll",
  );
  assert.match(frameCode, /<TextLink[^>]*onPress=\{onSignInPress\}/, "Sign in is a link intent");
  assert.match(frameCode, /<TextLink[^>]*onPress=\{onPrivacyPress\}/, "Privacy is a link intent");
  assert.match(frameCode, /<TextLink[^>]*onPress=\{onTermsPress\}/, "Terms is a link intent");
});

test("no explicit lineHeight in the frame (#162)", () => {
  assert.ok(!frameCode.includes("lineHeight"), "the frame must not set lineHeight");
});

test("frame stories exercise the frame at desktop and phone widths", () => {
  for (const name of ["Default", "Content", "NarrowViewport"]) {
    assert.match(
      frameStoriesCode,
      new RegExp(`export const ${name}: Story`),
      `PublicPageFrame.stories.tsx must export a ${name} story`,
    );
  }
  assert.match(
    frameStoriesCode,
    /<PublicPageFrame \{\.\.\.frameProps\}>/,
    "the frame stories render the real frame",
  );
});
