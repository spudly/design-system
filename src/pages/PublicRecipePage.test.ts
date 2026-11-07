import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pagesDir = join(here, "../..", "src", "pages");
const componentsDir = join(here, "../..", "src", "widgets");
const source = readFileSync(join(pagesDir, "PublicRecipePage.tsx"), "utf8");
const index = readFileSync(join(pagesDir, "index.ts"), "utf8");
const ratingsSource = readFileSync(join(componentsDir, "RatingsCard.tsx"), "utf8");
const scrollShellSource = readFileSync(join(componentsDir, "ScrollShell.tsx"), "utf8");

// Strip block and line comments so documented patterns in prose
// cannot pass the scan.
const strip = (text: string) =>
  text.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
const code = strip(source);
// The recipe sections are the shared library panels (see the
// header), so the section scans read the panel sources; the
// page source hosts the wiring pins (render order, status map).
const overviewCode = strip(readFileSync(join(componentsDir, "RecipeOverviewPanel.tsx"), "utf8"));
const ingredientsCode = strip(
  readFileSync(join(componentsDir, "RecipeIngredientsPanel.tsx"), "utf8"),
);
const ratingsCode = strip(ratingsSource);
const scrollShellCode = strip(scrollShellSource);

test("PublicRecipePage is exported from the pages barrel; PublicPageFrame is retired (#473)", () => {
  assert.match(index, /PublicRecipePage,/, "index.ts must export PublicRecipePage");
  assert.match(
    index,
    /from "\.\/PublicRecipePage\.js"/,
    "the export must come from ./PublicRecipePage.js",
  );
  assert.ok(
    !index.includes("PublicPageFrame"),
    "PublicPageFrame must no longer be exported (#473)",
  );
  assert.match(code, /export function PublicRecipePage/);
});

test("the view imports no app package and runs no data hooks", () => {
  assert.ok(!code.includes("@eciperay"), "PublicRecipePage must not import an app package");
  assert.ok(!code.includes("useQuery"), "PublicRecipePage must not fetch (queries stay app-side)");
  assert.ok(
    !code.includes("useMutation"),
    "PublicRecipePage must not mutate (mutations stay app-side)",
  );
  assert.ok(!code.includes("@tanstack"), "no react-query in PublicRecipePage");
});

test("error states live inside the props union, branched before the ready render", () => {
  assert.match(
    code,
    /export type PublicRecipePageProps =\s*\| \{ state: "loading"; footer\?: BigFooterData \}\s*\| \{ state: "notFound"; footer\?: BigFooterData \}\s*\| \{ state: "unavailable"; footer\?: BigFooterData \}\s*\| PublicRecipePageReadyProps;/,
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
    /<Center fill>\s*<Spinner label="Loading recipe" \/>\s*<\/Center>/,
    "the loading state renders a centered DS Spinner (Center + Spinner)",
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
    "<OverviewSection",
    "<SectionHeading>Ingredients</SectionHeading>",
    "<IngredientsSection",
    "<SectionHeading>Instructions</SectionHeading>",
    "<InstructionsSection",
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
      new RegExp(key.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)),
      `the CTA buttons carry stable per-action keys (${key})`,
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
  assert.match(overviewCode, /\{tags\.length > 0 \?/, "the tag row renders only with tags");
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
    /<TagList tags=\{tags\} \/>/,
    "tags render through TagList (Badge's color form)",
  );
  assert.ok(!code.includes("{tag.color}22"), "the page must not re-implement the tag tint inline");
  assert.ok(
    !overviewCode.includes("{tag.color}22"),
    "the overview panel must not re-implement the tag tint inline",
  );
});

test("the status badge map is page-owned with the idea fallback", () => {
  for (const [status, label] of [
    ["idea", "Idea"],
    ["evolving", "Evolving"],
    ["perfected", "Perfected"],
    ["abandoned", "Abandoned"],
  ]) {
    assert.ok(
      code.includes(`${status}: { label: "${label}"`),
      `STATUS_BADGES must map ${status} to ${label}`,
    );
  }
  assert.match(code, /STATUS_BADGES\[overview\.status\] \?\? STATUS_BADGES\.idea/);
  assert.match(code, /statusTone=\{statusBadge\?\.tone \?\? "neutral"\}/);
  assert.match(code, /statusLabel=\{statusBadge\?\.label \?\? "Idea"\}/);
});

test("no explicit lineHeight anywhere in the new files (#162)", () => {
  assert.ok(!code.includes("lineHeight"), "the page must not set lineHeight");
  for (const [name, text] of [
    ["the overview section", overviewCode],
    ["the ingredients section", ingredientsCode],
    ["RatingsCard", ratingsCode],
    ["ScrollShell", scrollShellCode],
  ]) {
    assert.ok(!text.includes("lineHeight"), `${name} must not set lineHeight`);
  }
});

describe("publicRecipePageAdoption", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const pagesDir = join(here, "../..", "src", "pages");
  const source = readFileSync(join(pagesDir, "PublicRecipePage.tsx"), "utf8");
  const stories = readFileSync(join(pagesDir, "PublicRecipePage.stories.tsx"), "utf8");

  // Strip block and line comments so documented patterns in prose
  // cannot pass the scan.
  const strip = (text: string) =>
    text.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
  const code = strip(source);
  const storiesCode = strip(stories);

  test("the CTA sizing and message shell are the shared components' (#341)", () => {
    assert.ok(
      code.includes('import { ButtonRow } from "../widgets/ButtonRow.js";'),
      "the page imports the library ButtonRow",
    );
    assert.ok(
      code.includes('import { MessageCard } from "../widgets/MessageCard.js";'),
      "the page imports the library MessageCard",
    );
    assert.match(
      code,
      /<ButtonRow equal>\{buttons\}<\/ButtonRow>/,
      "the CTA bar passes its buttons to ButtonRow with `equal`, which owns their equal sizing",
    );
    assert.ok(
      !code.includes("cloneElement"),
      "the page must not size its own buttons (ButtonRow owns the cloneElement sizing)",
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
        code.includes(`import { ${panel} } from "../widgets/${panel}.js";`),
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
        new RegExp(`<PublicRecipePage[^>]*state="${state}"[^>]*/>`),
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
});
