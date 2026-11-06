/**
 * Contract test for PublicPageFrame (spudly/design-system#169):
 * the public chrome as a DS building block the public surfaces
 * (#168/#170/#171) reuse, split out of
 * test/publicRecipePage.test.ts (the page contract stays there).
 *
 * The invariants pinned here are Stephen's decisions on #169
 * (2026-10-28):
 * 1. The frame is exported from the pages barrel index, imports
 *    nothing from an app package, and runs no queries or
 *    mutations — business logic stays app-side.
 * 2. The frame owns the public chrome: brand + Sign in header,
 *    the wide (max-w-3xl) centered column, the footer note and
 *    legal links — with navigation leaving as hrefs throughout:
 *    every control here navigates (the wordmark home, Sign in to
 *    the login route, Privacy/Terms to the legal routes), so each
 *    destination crosses as an href and renders as a real link,
 *    never as an intent callback (#248's navigation rule;
 *    Stephen's rulings on PR #311 and the #320 dedupe, which
 *    canonized the shared bands this frame composes on the href
 *    contract). The frame has no scroll view of its own for its
 *    content (the page inside owns that scroll); the one
 *    exception is PublicFrameLayout's native footer-only scroll
 *    region (PR #413), which wraps only the footer slot.
 * 3. No explicit lineHeight (the #162 rule).
 * 4. Stories exercise the frame around real page content and a
 *    stand-in, at desktop and phone widths, so Chromatic
 *    captures them. The phone-width story is named
 *    NarrowViewport, never Narrow: a "Narrow" story's baseline
 *    file would end in "-narrow.png", the suffix the VR pipeline
 *    reserves for narrow-viewport variant captures.
 *
 * This is a source scan, not a render test, for the same reason
 * as test/recipeDetailPage.test.ts: the repo has no JS renderer
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
const pagesDir = join(here, "../..", "src", "pages");
const componentsDir = join(here, "../..", "src", "widgets");
const frameSource = readFileSync(join(pagesDir, "PublicPageFrame.tsx"), "utf8");
const frameStories = readFileSync(join(pagesDir, "PublicPageFrame.stories.tsx"), "utf8");
const index = readFileSync(join(pagesDir, "index.ts"), "utf8");

// Strip block and line comments so documented patterns in prose
// cannot pass the scan.
const strip = (text: string) =>
  text.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
// The frame's internals are the shared components canonized in
// the #320 dedupe — PublicFrameLayout owns the shell and the
// column, PublicFrameHeader / PublicFrameFooter own the bands,
// BrandLink owns the wordmark — so the frame's source for these
// scans is the page plus the components it composes. The page
// itself keeps the contract: the navigation crossings (the
// hrefs) and the DS-owned copy constants.
const frameCode = strip(
  [
    frameSource,
    readFileSync(join(componentsDir, "PublicFrameLayout.tsx"), "utf8"),
    readFileSync(join(componentsDir, "PublicFrameHeader.tsx"), "utf8"),
    readFileSync(join(componentsDir, "BigFooter.tsx"), "utf8"),
    readFileSync(join(componentsDir, "BrandLink.tsx"), "utf8"),
  ].join("\n"),
);
const pageCode = strip(frameSource);
const frameStoriesCode = strip(frameStories);

test("PublicPageFrame is exported from the pages barrel", () => {
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

test("the frame owns the public chrome: href navigation throughout, no scroll of its own", () => {
  for (const hrefProp of ["brandHref", "signInHref", "privacyHref", "termsHref"]) {
    assert.match(
      pageCode,
      new RegExp(`${hrefProp}: string;`),
      `the frame's ${hrefProp} destination crosses as an href, not a callback`,
    );
  }
  for (const intent of ["onBrandPress", "onSignInPress", "onPrivacyPress", "onTermsPress"]) {
    assert.ok(
      !pageCode.includes(intent),
      `the frame has no ${intent} callback — navigation renders as real links (#248)`,
    );
  }
  assert.ok(
    !pageCode.includes("() => void"),
    "the frame's contract carries no callbacks at all — hrefs only",
  );
  assert.match(
    pageCode,
    /signInHref=\{signInHref\}/,
    "the frame passes the sign-in href into the shared header band",
  );
  assert.match(
    pageCode,
    /\{ label: PRIVACY_LABEL, href: privacyHref \}/,
    "the frame builds the footer's Privacy link as {label, href} data",
  );
  assert.match(
    pageCode,
    /\{ label: TERMS_LABEL, href: termsHref \}/,
    "the frame builds the footer's Terms link as {label, href} data",
  );
  for (const copy of [
    'BRAND_LABEL = "Eciperay"',
    'SIGN_IN_LABEL = "Sign in"',
    'LEGAL_COLUMN_TITLE = "Legal"',
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
  // The frame must not scroll — the page inside owns its scroll.
  // The scan covers what the frame actually renders: its own
  // sources plus the BigFooter COMPONENT. BigFooterShell shares
  // BigFooter.tsx but is page chrome the frame never renders (a
  // page nested in the frame gets no footer from the shell), and
  // since the PR #413 native tall-footer fix the shell owns a
  // footer-only ScrollView — that scroll region is the shell's,
  // not the frame's, so only the component segment of
  // BigFooter.tsx is scanned here; test/bigFooter.test.ts pins
  // the shell's footer region.
  //
  // The frame's OWN footer-only exception (PR #413 review):
  // PublicFrameLayout renders the frame's footer through
  // BigFooter directly, not through BigFooterShell, and
  // BigFooter has no internal scroll region — so on native the
  // layout gives the footer the same footer-only bounded scroll
  // region the shell uses, or a tall footer is clipped with no
  // scroll path. That region wraps ONLY the footer slot: the
  // page, the header, and the content column never scroll here.
  const bigFooterStripped = strip(readFileSync(join(componentsDir, "BigFooter.tsx"), "utf8"));
  const bigFooterComponent = bigFooterStripped.slice(
    bigFooterStripped.indexOf("export function BigFooter("),
    bigFooterStripped.indexOf("export type BigFooterShellProps"),
  );
  assert.ok(
    bigFooterComponent.length > 0,
    "the BigFooter component segment is found for the frame scroll scan",
  );
  const layoutCode = strip(readFileSync(join(componentsDir, "PublicFrameLayout.tsx"), "utf8"));
  const frameScrollScan = [
    pageCode,
    strip(readFileSync(join(componentsDir, "PublicFrameHeader.tsx"), "utf8")),
    strip(readFileSync(join(componentsDir, "BrandLink.tsx"), "utf8")),
    bigFooterComponent,
  ].join("\n");
  assert.ok(
    !frameScrollScan.includes("<ScrollView"),
    "apart from the layout's footer region, the frame must not scroll — the page inside owns its scroll",
  );
  assert.equal(
    (layoutCode.match(/<ScrollView/g) ?? []).length,
    1,
    "PublicFrameLayout's only ScrollView is the native footer region",
  );
  assert.match(
    layoutCode,
    /isWeb \? \(\s*footer\s*\) : \(\s*<ScrollView flexGrow=\{0\} flexShrink=\{1\} keyboardShouldPersistTaps="handled">\s*\{footer\}\s*<\/ScrollView>\s*\)/,
    "on native the layout's footer renders inside its own bounded scroll region; on web it renders bare",
  );
  assert.ok(
    !/<ScrollView[^>]*>\s*\{(children|header)\}/.test(layoutCode),
    "the layout's scroll region wraps only the footer — never the page or the header",
  );
  assert.match(
    frameCode,
    /<BrandLink label=\{brandLabel\} href=\{brandHref\} \/>/,
    "the wordmark renders as BrandLink, a real link",
  );
  assert.match(
    frameCode,
    /<TextLink[^>]*href=\{signInHref\}/,
    "Sign in renders as a TextLink with the href",
  );
  assert.match(
    frameCode,
    /<TextLink[^>]*href=\{link\.href\}/,
    "the footer's legal links render as TextLinks with the caller's hrefs",
  );
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
    /<PublicPageFrame[^>]*\{\.\.\.frameProps\}>/,
    "the frame stories render the real frame",
  );
});
