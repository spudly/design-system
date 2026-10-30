/**
 * Contract test for spudly/design-system#263: eight DS pages rendered
 * their standalone page title with the `subheading` Text variant, so
 * after #261 gave heading variants real web heading semantics their
 * titles were exposed as level-2 headings and the pages had no
 * level-1 heading at all — screen-reader users could not navigate to
 * the page title as the page's top heading.
 *
 * The contract now:
 * 1. One of the eight pages (AddRecipeMenuPage) still renders
 *    its title with `variant="heading"` (level 1 on web) — exactly
 *    once, so the page gains no second level-1 heading — and no
 *    `subheading` usage remains in that file (its only subheading
 *    was the title). Every other page's title has moved to the
 *    `title` variant (items 6 and 7).
 * 2. Its title keeps its explicit `fontSize` xl / `fontWeight`
 *    bold overrides, so the visual rendering is unchanged (the
 *    `heading` variant's own defaults are 3xl/bold; the overrides
 *    pin xl/bold).
 * 3. HomePage is the pinned exception that proves the sweep is
 *    title-only: its page title was already `heading`, and its
 *    section title correctly stays `subheading` (level 2).
 * 4. Composition: MealsHubPage renders MealPlansPage inside its
 *    plans tab, under the hub's own title — the one page-in-page
 *    composition in the DS. MealPlansPage therefore takes a
 *    `titleLevel` prop: standalone it defaults to level 1, and
 *    MealsHubPage passes 2 for the nested render, so each hub tab
 *    still exposes exactly one level-1 heading. The SSR tests below
 *    count rendered headings per tab (a source-level count cannot
 *    see the nested heading).
 * 5. Section headings sit UNDER the page title (#317): the
 *    shared SectionHeading component states its heading level
 *    explicitly — the header role at level 2 on its subheading
 *    Text — so a detail page's sections are level-2 headings
 *    beneath the title's level 1, and no page gains a second
 *    level-1 heading from its sections.
 * 6. MealPlanDetailPage is the pinned exception since #119
 *    tranche 2: its title was the `heading` variant plus xl/bold
 *    styling overrides — the overrides are exactly what #119 bans
 *    in pages — so the title now takes Text's `title` variant,
 *    which IS xl bold at heading level 1. Rendering and heading
 *    semantics are unchanged; the size/weight are owned by the
 *    variant (pinned against Text.tsx below) instead of the page.
 * 7. The #119 meals & planning tranche applies the same move to
 *    MealDetailPage, MealsHubPage, ShoppingListPage, and
 *    TagsPage: their titles take the `title` variant (exactly
 *    once; no `heading` or `subheading` usage remains), so the
 *    SSR composition contract under 4 is unchanged — each hub
 *    tab still exposes exactly one level-1 heading.
 *    FeedbackPage and ProfilePage joined it in the #119 auth
 *    tranche: same shape (heading + xl/bold overrides), same move
 *    to the `title` variant, pinned by their own test below.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readCode(rel) {
  return readFileSync(join(root, rel), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const TITLE_PAGES = ["AddRecipeMenuPage"];

// The #119 meals & planning tranche's pages: their titles moved
// to the `title` variant (the MealPlanDetailPage pattern, item 6).
const TITLE_VARIANT_PAGES = ["MealDetailPage", "MealsHubPage", "ShoppingListPage", "TagsPage"];

function countOccurrences(code, needle) {
  return code.split(needle).length - 1;
}

test("page titles use the heading variant exactly once, with no subheading left (#263)", () => {
  for (const page of TITLE_PAGES) {
    const code = readCode(`src/pages/${page}.tsx`);
    assert.equal(
      countOccurrences(code, 'variant="heading"'),
      1,
      `${page} must render exactly one heading-variant Text (its title)`,
    );
    assert.equal(
      countOccurrences(code, 'variant="subheading"'),
      0,
      `${page} must not keep a subheading usage — its only one was the page title`,
    );
  }
});

test("page titles keep their xl/bold overrides so rendering is unchanged (#263)", () => {
  for (const page of TITLE_PAGES) {
    const code = readCode(`src/pages/${page}.tsx`);
    const variantAt = code.indexOf('variant="heading"');
    const openAt = code.lastIndexOf("<Text", variantAt);
    const closeAt = code.indexOf(">", variantAt);
    const attrs = code.slice(openAt, closeAt);
    assert.match(
      attrs,
      /fontSize=\{tokens\.typography\.fontSize\.xl\}/,
      `${page} title must keep its fontSize xl override`,
    );
    assert.match(
      attrs,
      /fontWeight=\{tokens\.typography\.fontWeight\.bold\}/,
      `${page} title must keep its fontWeight bold override`,
    );
  }
});

test("the #119 meals tranche's page titles take the title variant — xl bold at level 1 (#263, #119)", () => {
  for (const page of TITLE_VARIANT_PAGES) {
    const code = readCode(`src/pages/${page}.tsx`);
    assert.equal(
      countOccurrences(code, 'variant="title"'),
      1,
      `${page} must render exactly one title-variant Text (its title)`,
    );
    assert.equal(
      countOccurrences(code, 'variant="heading"'),
      0,
      `${page}'s title must not use the heading variant (its 3xl default is not the app's title size)`,
    );
    assert.equal(
      countOccurrences(code, 'variant="subheading"'),
      0,
      `${page} must not keep a subheading usage`,
    );
  }
});

test("MealPlanDetailPage's title takes the title variant — xl bold at level 1 (#263, #119)", () => {
  const code = readCode("src/pages/MealPlanDetailPage.tsx");
  assert.equal(
    countOccurrences(code, 'variant="title"'),
    1,
    "MealPlanDetailPage must render exactly one title-variant Text (its title)",
  );
  assert.equal(
    countOccurrences(code, 'variant="heading"'),
    0,
    "MealPlanDetailPage's title must not use the heading variant (its 3xl default is not the app's title size)",
  );
  assert.equal(
    countOccurrences(code, 'variant="subheading"'),
    0,
    "MealPlanDetailPage must not keep a subheading usage",
  );
  const text = readCode("src/components/Text.tsx");
  assert.match(
    text,
    /title: \{\s+fontSize: tokens\.typography\.fontSize\.xl,\s+fontWeight: tokens\.typography\.fontWeight\.bold,\s+\}/,
    "Text's title variant must carry the xl/bold treatment the page title rendered with",
  );
});

test("FeedbackPage and ProfilePage titles take the title variant — xl bold at level 1 (#263, #119)", () => {
  for (const page of ["FeedbackPage", "ProfilePage"]) {
    const code = readCode(`src/pages/${page}.tsx`);
    assert.equal(
      countOccurrences(code, 'variant="title"'),
      1,
      `${page} must render exactly one title-variant Text (its title)`,
    );
    assert.equal(
      countOccurrences(code, 'variant="heading"'),
      0,
      `${page}'s title must not use the heading variant (its 3xl default is not the app's title size)`,
    );
    assert.equal(
      countOccurrences(code, 'variant="subheading"'),
      0,
      `${page} must not keep a subheading usage`,
    );
  }
});

test("SectionHeading is a level-2 heading under the page title (#317)", () => {
  const code = readCode("src/components/SectionHeading.tsx");
  assert.match(
    code,
    /<Text\s+variant="subheading"\s+accessibilityRole="header"\s+aria-level=\{2\}\s*>/,
    "SectionHeading must state the header role at level 2 explicitly (#317)",
  );
  assert.doesNotMatch(
    code,
    /aria-level=\{1\}/,
    "SectionHeading must never render at level 1 — that is the page title's level (#263)",
  );
});

test("HomePage stays the exception: heading title, subheading section title (#263)", () => {
  const code = readCode("src/pages/HomePage.tsx");
  assert.equal(
    countOccurrences(code, 'variant="heading"'),
    1,
    "HomePage must keep exactly one heading-variant Text (its page title)",
  );
  assert.ok(
    countOccurrences(code, 'variant="subheading"') >= 1,
    "HomePage's section title must stay subheading (a genuine level-2 usage)",
  );
});

test("the MealsHub composition demotes the nested MealPlansPage title (#263)", () => {
  const plansCode = readCode("src/pages/MealPlansPage.tsx");
  assert.match(
    plansCode,
    /titleLevel\?:\s*1 \| 2/,
    "MealPlansPage must accept an optional titleLevel prop",
  );
  assert.match(
    plansCode,
    /<Text variant="heading" aria-level=\{titleLevel\}>/,
    "MealPlansPage's title must forward titleLevel as the heading level",
  );
  const hubCode = readCode("src/pages/MealsHubPage.tsx");
  assert.match(
    hubCode,
    /<MealPlansPage[\s\S]*?titleLevel=\{2\}/,
    "MealsHubPage must render its nested MealPlansPage with titleLevel 2",
  );
});

// Runtime imports are lazy (inside the SSR tests) so the source-scan
// tests above still run and report when the build output is missing
// or broken, instead of the whole file failing at import time.
let runtimePromise;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider } = await import("tamagui");
    const dist = await import("../dist/index.js");
    // The pages barrel is not Node-importable (some pages import
    // react-native), so the two pages under test are loaded from
    // their own modules — both are plain component compositions.
    const { MealPlansPage } = await import("../dist/pages/MealPlansPage.js");
    const { MealsHubPage } = await import("../dist/pages/MealsHubPage.js");
    return { React, renderToString, TamaguiProvider, ...dist, MealPlansPage, MealsHubPage };
  })();
  return runtimePromise;
}

async function renderToHtml(element) {
  const { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme } =
    await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  const html = renderToString(
    React.createElement(TamaguiProvider, { config, defaultTheme: "light" }, element),
  );
  const styleEnd = html.lastIndexOf("</style>");
  return styleEnd === -1 ? html : html.slice(styleEnd + "</style>".length);
}

// [{ level, text }] for every rendered heading, in document order.
function renderedHeadings(html) {
  const headings = [];
  const pattern = /<[a-zA-Z][^>]*role="heading"[^>]*>([^<]*)/g;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    const tag = match[0].slice(0, match[0].indexOf(">") + 1);
    const level = /aria-level="(\d)"/.exec(tag);
    headings.push({ level: level ? Number(level[1]) : null, text: match[1].trim() });
  }
  return headings;
}

const noop = () => null;
const hubPlan = { id: "plan-1", title: "Weeknight plan" };

function hubProps(React, MealsHubPage, activeTab) {
  return React.createElement(MealsHubPage, {
    activeTab,
    onSelectTab: noop,
    meals: [],
    plans: [hubPlan],
    isLoading: false,
    onCreateMeal: noop,
    onCreatePlan: noop,
    onMealPress: noop,
    onPlanPress: noop,
    onDeleteMeal: noop,
    onDeletePlan: noop,
  });
}

test("SSR: each MealsHubPage tab renders exactly one level-1 heading (#263)", async () => {
  const { React, MealsHubPage } = await loadRuntime();
  for (const tab of ["meals", "plans"]) {
    const html = await renderToHtml(hubProps(React, MealsHubPage, tab));
    const headings = renderedHeadings(html);
    assert.deepEqual(
      headings.filter((h) => h.level === 1).map((h) => h.text),
      ["Meals"],
      `${tab} tab must expose only the hub title as a level-1 heading`,
    );
  }
  const plansHtml = await renderToHtml(hubProps(React, MealsHubPage, "plans"));
  assert.deepEqual(
    renderedHeadings(plansHtml).find((h) => h.text === "Meal plans"),
    { level: 2, text: "Meal plans" },
    "the nested MealPlansPage title must render at level 2 in the plans tab",
  );
});

test("SSR: standalone MealPlansPage keeps its title at level 1 (#263)", async () => {
  const { React, MealPlansPage } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(MealPlansPage, {
      plans: [hubPlan],
      isLoading: false,
      onPlanPress: noop,
      onCreatePlan: noop,
    }),
  );
  assert.deepEqual(
    renderedHeadings(html).find((h) => h.text === "Meal plans"),
    { level: 1, text: "Meal plans" },
    "the standalone MealPlansPage title must render at level 1",
  );
});
