/**
 * Contract test for PublicRecipePage + PublicPageFrame
 * (spudly/design-system#169): Eciperay's public (signed-out, SEO)
 * recipe surface as a controlled DS page component, following the
 * RecipeDetailPage precedent, plus the public chrome as a DS
 * building block the other public surfaces (#168/#170/#171) reuse.
 *
 * The invariants pinned here are the ones the Eciperay web rewire
 * will depend on, and the decisions Stephen resolved on #169
 * (2026-10-28):
 * 1. Both components are exported from the pages subpath index,
 *    and the views import nothing from an app package and run no
 *    queries or mutations — business logic stays app-side.
 * 2. Error states live inside the props union: loading, notFound,
 *    and unavailable are union members alongside ready, each
 *    non-ready state branches before the ready render, and the
 *    error copy is the web surface's verbatim copy.
 * 3. Single scroll, no tabs: exactly one scroll region in the
 *    page — owned by ScrollShell since the #119 de-styling moved
 *    the page's hand-rolled ScrollView into it — no tab state in
 *    the contract, and the sections render in tab order (CTA bar,
 *    overview, ingredients, instructions, engagement) so every
 *    section stays in the document.
 * 4. The CTA bar's variant is chosen by the host's auth state:
 *    signed-out shows the three navigation intents with their
 *    verbatim labels; signed-in shows the clone button (with its
 *    "Saving…" pending label and disabled state) and get-the-app.
 * 5. Engagement is in v1: the ratings view-model is the detail
 *    page's, reused by type alias (no second shape to drift), the
 *    viewer's star input hides when the viewer is null (the
 *    signed-out case), and the comments slot renders in the
 *    engagement stack after the ratings card.
 * 6. The shared section shapes (ingredients, instructions) are
 *    likewise reused from RecipeDetailPage by alias; the servings
 *    stepper and scale option set match the detail page's.
 * 7. The frame owns the public chrome: brand + Sign in header,
 *    the wide (max-w-3xl) centered column, the footer note and
 *    legal links — with navigation leaving through intent
 *    callbacks only, and no scroll view of its own (the page
 *    inside owns the scroll). (Pinned in
 *    test/publicPageFrame.test.mjs.)
 * 8. Optional content is omitted cleanly: no image, description,
 *    prep/cook stats, tags row, ratings card, or comments appear
 *    unless their data/callback is provided.
 * 9. No explicit lineHeight anywhere (the #162 rule), and tags
 *    render through Badge's color form (#211).
 * 10. Stories exercise every union state and both CTA variants,
 *     so Chromatic captures them.
 *
 * This is a source scan, not a render test, for the same reason as
 * test/recipeDetailPage.test.mjs: the repo has no JS renderer for
 * these components (Chromatic screenshots in CI), and the
 * invariant is a per-literal property of the source. Comments are
 * stripped before scanning so prose cannot satisfy the patterns.
 *
 * The #119 de-styling extracted the page's four sections into
 * shared components (RecipeOverviewPanel, RecipeIngredientsPanel,
 * RecipeInstructionsPanel, RatingsCard) and its shells into
 * ScrollShell / LoadingGate / MessageCard; pins for invariants
 * that live inside a section now scan that component's source,
 * while the page-level pins (union, CTA contract, section order,
 * slot) scan the page.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pagesDir = join(here, "..", "src", "pages");
const componentsDir = join(here, "..", "src", "components");
const source = readFileSync(join(pagesDir, "PublicRecipePage.tsx"), "utf8");
const frameSource = readFileSync(join(pagesDir, "PublicPageFrame.tsx"), "utf8");
const stories = readFileSync(join(pagesDir, "PublicRecipePage.stories.tsx"), "utf8");
const index = readFileSync(join(pagesDir, "index.ts"), "utf8");
const overviewSource = readFileSync(join(componentsDir, "RecipeOverviewPanel.tsx"), "utf8");
const ingredientsSource = readFileSync(join(componentsDir, "RecipeIngredientsPanel.tsx"), "utf8");
const ratingsSource = readFileSync(join(componentsDir, "RatingsCard.tsx"), "utf8");
const scrollShellSource = readFileSync(join(componentsDir, "ScrollShell.tsx"), "utf8");

// Strip block and line comments so documented patterns in prose
// cannot pass the scan.
const strip = (text) =>
  text.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
const code = strip(source);
const frameCode = strip(frameSource);
const storiesCode = strip(stories);
const overviewCode = strip(overviewSource);
const ingredientsCode = strip(ingredientsSource);
const ratingsCode = strip(ratingsSource);
const scrollShellCode = strip(scrollShellSource);

test("PublicRecipePage and PublicPageFrame are exported from the pages subpath", () => {
  assert.match(index, /PublicRecipePage,/, "index.ts must export PublicRecipePage");
  assert.match(
    index,
    /from "\.\/PublicRecipePage\.js"/,
    "the export must come from ./PublicRecipePage.js",
  );
  assert.match(index, /PublicPageFrame,/, "index.ts must export PublicPageFrame");
  assert.match(
    index,
    /from "\.\/PublicPageFrame\.js"/,
    "the frame export must come from ./PublicPageFrame.js",
  );
  assert.match(code, /export function PublicRecipePage/);
  assert.match(frameCode, /export function PublicPageFrame/);
});

test("the views import no app package and run no data hooks", () => {
  for (const [name, text] of [
    ["PublicRecipePage", code],
    ["PublicPageFrame", frameCode],
  ]) {
    assert.ok(!text.includes("@eciperay"), `${name} must not import an app package`);
    assert.ok(!text.includes("useQuery"), `${name} must not fetch (queries stay app-side)`);
    assert.ok(!text.includes("useMutation"), `${name} must not mutate (mutations stay app-side)`);
    assert.ok(!text.includes("@tanstack"), `no react-query in ${name}`);
  }
});

test("error states live inside the props union, branched before the ready render", () => {
  assert.match(
    code,
    /export type PublicRecipePageProps =\s*\| \{ state: "loading" \}\s*\| \{ state: "notFound" \}\s*\| \{ state: "unavailable" \}\s*\| PublicRecipePageReadyProps;/,
    "the props must be the loading | notFound | unavailable | ready union",
  );
  const readyAt = code.indexOf("<CtaBar");
  for (const state of ["loading", "notFound", "unavailable"]) {
    const branchAt = code.indexOf(`props.state === "${state}"`);
    assert.ok(branchAt !== -1, `the component must branch on the ${state} state`);
    assert.ok(branchAt < readyAt, `the ${state} branch must come before the ready render`);
  }
  assert.match(
    code,
    /<LoadingGate label="Loading recipe" \/>/,
    "the loading state renders the DS LoadingGate",
  );
  assert.match(code, /<MessageCard title=\{NOT_FOUND_TITLE\} message=\{NOT_FOUND_MESSAGE\} \/>/);
  assert.match(
    code,
    /<MessageCard title=\{UNAVAILABLE_TITLE\} message=\{UNAVAILABLE_MESSAGE\} \/>/,
  );
});

test("the error copy is the web surface's verbatim copy", () => {
  for (const copy of [
    'NOT_FOUND_TITLE = "Recipe not found"',
    'NOT_FOUND_MESSAGE = "This recipe may be private or no longer available."',
    'UNAVAILABLE_TITLE = "Recipe unavailable"',
    'UNAVAILABLE_MESSAGE = "This recipe link is invalid or has expired."',
  ]) {
    assert.ok(code.includes(copy), `the page must carry ${copy}`);
  }
});

test("single scroll, no tabs: the sections render in tab order inside one ScrollShell", () => {
  assert.equal(
    code.split("<ScrollView").length - 1,
    0,
    "the page renders no ScrollView of its own: ScrollShell owns the page's single scroll",
  );
  assert.equal(
    code.split("<ScrollShell").length - 1,
    1,
    "exactly one ScrollShell: the page's single section scroll",
  );
  assert.match(
    scrollShellCode,
    /<ScrollRegion>/,
    "the shell's scroll is ScrollRegion (which persists handled taps, so slotted comments keep their presses)",
  );
  assert.ok(!code.includes("<Tabs"), "the page must not render a tab bar");
  assert.ok(!code.includes("activeTab"), "the tab state left the contract");
  assert.ok(!code.includes("onTabChange"), "the tab-change callback left the contract");
  const sequence = [
    "<CtaBar",
    "<RecipeOverviewPanel",
    "<SectionHeading>Ingredients</SectionHeading>",
    "<RecipeIngredientsPanel",
    "<SectionHeading>Instructions</SectionHeading>",
    "<RecipeInstructionsPanel",
    "<RatingsCard",
    "{comments}",
  ];
  let lastAt = -1;
  for (const marker of sequence) {
    const at = code.indexOf(marker);
    assert.ok(at > lastAt, `sections must render in tab order: ${marker} after the previous one`);
    lastAt = at;
  }
  const scrollAt = code.indexOf("<ScrollShell");
  assert.ok(code.indexOf("<CtaBar") > scrollAt, "the sections render inside the scroll shell");
});

test("the CTA bar switches on the auth-state variant with verbatim labels", () => {
  assert.match(
    code,
    /export type PublicRecipePageCtas =\s*\{ variant: "signedOut" \} \| \{ variant: "signedIn"; isClonePending\?: boolean \};/,
    "the CTAs are the signedOut | signedIn union, signed-in carrying the clone pending state",
  );
  for (const copy of [
    'SIGN_UP_LABEL = "Sign up free"',
    'CLONE_LABEL = "Clone this recipe"',
    'SAVE_COPY_LABEL = "Save a copy"',
    'SAVE_COPY_PENDING_LABEL = "Saving…"',
    'GET_APP_LABEL = "Get the mobile app"',
  ]) {
    assert.ok(code.includes(copy), `the page must carry ${copy}`);
  }
  assert.match(code, /ctas\.variant === "signedOut" \? \(/, "the bar branches on the variant");
  assert.match(
    code,
    /disabled=\{ctas\.isClonePending \?\? false\}/,
    "the signed-in clone button disables while the clone is pending",
  );
  assert.match(
    code,
    /ctas\.isClonePending \? SAVE_COPY_PENDING_LABEL : SAVE_COPY_LABEL/,
    "the signed-in clone button reads Saving… while pending",
  );
  for (const intent of ["onSignUpPress", "onClonePress", "onGetAppPress"]) {
    assert.match(
      code,
      new RegExp(String.raw`${intent}: \(\) => void;`),
      `the ${intent} intent is a plain callback out`,
    );
  }
  for (const key of ['key="sign-up"', 'key="clone"', 'key="get-app"']) {
    assert.match(
      code,
      new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      `the CTA buttons carry stable per-action keys (${key}), so a variant switch never reuses one action's button for another`,
    );
  }
});

test("engagement is in v1: ratings reuse the detail page's view-model, comments take the slot", () => {
  assert.match(
    code,
    /export type PublicRecipePageRatings = RecipeDetailPageRatings;/,
    "the ratings view-model is reused from RecipeDetailPage by alias, not re-declared",
  );
  assert.match(
    code,
    /ratings\?: PublicRecipePageRatings \| null;/,
    "ratings are optional on ready",
  );
  assert.match(
    code,
    /renderComments\?: \(\) => ReactNode;/,
    "comments enter through the render slot, as on RecipeDetailPage",
  );
  assert.match(
    code,
    /const comments = renderComments \? renderComments\(\) : null;/,
    "the slot is called once per render, only when provided",
  );
  assert.match(
    ratingsCode,
    /\{ratings\.viewer \? \(/,
    "the viewer star input renders only with a viewer (signed out hides it)",
  );
  assert.match(code, /onViewerRatingChange\?: \(stars: number \| null\) => void;/);
});

test("the shared section shapes are reused from RecipeDetailPage by alias", () => {
  assert.match(
    code,
    /export type PublicRecipePageIngredientsProps = RecipeDetailPageIngredientsProps;/,
  );
  assert.match(
    code,
    /export type PublicRecipePageInstructionsProps = RecipeDetailPageInstructionsProps;/,
  );
  assert.match(code, /export type PublicRecipePageTag = RecipeDetailPageTag;/);
  for (const [value, label] of [
    ["0.5", "½×"],
    ["1", "1×"],
    ["2", "2×"],
    ["3", "3×"],
  ]) {
    assert.ok(
      ingredientsCode.includes(`{ value: "${value}", label: "${label}" }`),
      `SCALE_OPTIONS must include ${value} / ${label}, as on the detail page`,
    );
  }
  assert.match(
    ingredientsCode,
    /<NumberStepper\s+label="Servings"\s+layout="inline"\s+value=\{view\.servings\}\s+min=\{1\}/,
    "the servings stepper mirrors the detail page's (label Servings, floor of 1, inline layout)",
  );
});

test("optional content is omitted cleanly, never rendered as a shell", () => {
  assert.match(overviewCode, /\{imageUrl \? \(/, "the hero image renders only with an imageUrl");
  assert.match(overviewCode, /\{description \? \(/, "the description renders only when present");
  assert.match(
    overviewCode,
    /\{prepTimeLabel \? <StatCard label="Prep"/,
    "the Prep stat needs a prep time",
  );
  assert.match(
    overviewCode,
    /\{cookTimeLabel \? <StatCard label="Cook"/,
    "the Cook stat needs a cook time",
  );
  assert.match(overviewCode, /\{tags\.length > 0 \? \(/, "the tag row renders only with tags");
  assert.match(code, /\{ratings \? \(/, "the ratings card renders only with ratings");
  assert.match(
    code,
    /\{comments\}/,
    "the comments slot renders its content directly (no shell when the slot is empty)",
  );
  assert.match(
    ingredientsCode,
    /view\.substitutions && view\.substitutions\.length > 0/,
    "the substitutions panel renders only with substitutions",
  );
});

test("tags render through Badge's color form, not an inline pill (#211)", () => {
  assert.match(
    overviewCode,
    /<Badge key=\{tag\.id\} color=\{tag\.color\}>/,
    "tags render as Badge",
  );
  assert.ok(!code.includes("{tag.color}22"), "the page must not re-implement the tag tint inline");
  assert.ok(
    !overviewCode.includes("{tag.color}22"),
    "the overview panel must not re-implement the tag tint inline",
  );
});

test("no explicit lineHeight anywhere in the new files (#162)", () => {
  assert.ok(!code.includes("lineHeight"), "the page must not set lineHeight");
  assert.ok(!frameCode.includes("lineHeight"), "the frame must not set lineHeight");
  for (const [name, text] of [
    ["RecipeOverviewPanel", overviewCode],
    ["RecipeIngredientsPanel", ingredientsCode],
    ["RatingsCard", ratingsCode],
    ["ScrollShell", scrollShellCode],
  ]) {
    assert.ok(!text.includes("lineHeight"), `${name} must not set lineHeight`);
  }
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
