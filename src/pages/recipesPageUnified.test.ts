/**
 * Contract test for the unified RecipesPage
 * (spudly/design-system#415, companion to eciperay #409).
 *
 * The unified "Recipes" browse replaces the pre-#415
 * RecipesPage contract (major): one page renders the user's
 * own material (created + shared-with-me) with preferred
 * placement, then public discovery content, on one scroll
 * surface. Stephen's approved plan decisions pinned here:
 * 1. One list, own section first: the page builds ONE row
 *    sequence for its one BoundedList — the own section's
 *    heading and rows precede the discovery section's heading
 *    and rows — and renders it in the fixed `list` shell.
 * 2. ONE search field and ONE filter set: exactly one
 *    CatalogFiltersBar renders (as the list header), with the
 *    filter-id set both predecessor pages already shared; the
 *    page declares no second search/filter surface and does no
 *    searching/filtering computation (both sections' data
 *    arrive already filtered from the caller).
 * 3. Shared-with-me surfaces inside the own section: an item's
 *    caller-supplied `badgeLabel` renders as a Badge on the
 *    own row (MediaRow) and joins the row's accessible name;
 *    created items omit it. There is no separate shared
 *    section, tab, or page.
 * 4. Section states are independent: each section contributes
 *    exactly one of its loading / error / empty / recipe rows
 *    to the sequence, keyed off its OWN props — a discovery
 *    failure or empty result cannot hide own recipes and vice
 *    versa. Section titles and empty-state copy are
 *    caller-supplied props; the own section collapses to its
 *    empty state instead of disappearing.
 * 5. Discovery rows render through DiscoveryCard with the
 *    host-built permalink href (a real link, #248), and the
 *    discovery view-model is DiscoverPage's item type, reused.
 * 6. Pagination is the discovery section's continuation,
 *    riding the shared catalog pattern gated on both sections'
 *    first loads and the discovery error state.
 * 7. Stories cover the unified states: populated (Default),
 *    own-only, discovery-only, empty, loading — plus the
 *    discovery-error independence state.
 * 8. DiscoverPage is untouched by the replacement: it stays
 *    exported from the pages barrel (removal is a follow-up).
 *
 * This is a source scan, not a render test, for the same reason
 * as the sibling recipesPage*.test.ts suites: the repo has no
 * JS renderer for page components (they import react-native),
 * and the invariants are per-literal properties of the source.
 * Comments are stripped before scanning so prose cannot
 * satisfy the patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pagesDir = join(here, "../..", "src", "pages");
const source = readFileSync(join(pagesDir, "RecipesPage.tsx"), "utf8");
const stories = readFileSync(join(pagesDir, "RecipesPage.stories.tsx"), "utf8");
const index = readFileSync(join(pagesDir, "index.ts"), "utf8");

// Strip block and line comments so documented patterns in prose
// cannot pass the scan.
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
// The MediaRow composition is page-local (bottom of the page
// file); slice it out so the badge pins run against it.
const mediaRow = code.slice(code.indexOf("const textBlockStyle"), code.indexOf("const STAR_STEPS"));

function count(haystack: string, literal: string) {
  return haystack.split(literal).length - 1;
}

test("the contract is sectioned: caller-supplied titles, data, and per-section states", () => {
  assert.match(code, /ownTitle: string;/, "the own section's title is caller-supplied");
  assert.match(code, /ownRecipes: RecipesPageItem\[\];/);
  assert.match(code, /loadingOwn: boolean;/);
  assert.match(code, /ownErrorMessage\?: string \| null;/);
  assert.match(code, /ownEmptyTitle\?: string;/);
  assert.match(code, /ownEmptyBody\?: string;/);
  assert.match(
    code,
    /discoveryTitle\?: string;/,
    "the discovery section's title is caller-supplied",
  );
  assert.match(code, /discoveryRecipes\?: RecipesPageDiscoveryItem\[\];/);
  assert.match(code, /loadingDiscovery\?: boolean;/);
  assert.match(code, /discoveryErrorMessage\?: string \| null;/);
  assert.match(code, /discoveryEmptyTitle\?: string;/);
  assert.match(code, /discoveryEmptyBody\?: string;/);
  assert.match(
    code,
    /ownEmptyTitle = "No recipes found\."/,
    "the own empty title keeps the Recipes screen's default copy",
  );
  assert.match(
    code,
    /discoveryEmptyTitle = "No public recipes match your search\."/,
    "the discovery empty title keeps the public catalog's default copy",
  );
  // The old single-list contract is gone — the replacement is
  // what makes this a major changeset.
  assert.ok(
    !/^\s+recipes: RecipesPageItem\[\];/m.test(code),
    "the old `recipes` prop must not return",
  );
  assert.ok(!/^\s+loading: boolean;/m.test(code), "the old `loading` prop must not return");
  assert.ok(!/^\s+emptyTitle\?: string;/m.test(code), "the old `emptyTitle` prop must not return");
});

test("the discovery section is host-optional (#512): omitted props produce no discovery rows and inert pagination", () => {
  // Presence is keyed off discoveryRecipes being supplied.
  assert.match(code, /const hasDiscovery = discoveryRecipes !== undefined;/);
  // Every discovery row is built only inside the presence guard.
  const guardAt = code.indexOf("if (discoveryRecipes !== undefined) {");
  const headingAt = code.indexOf('rows.push({ kind: "discoveryHeading" });');
  const emptyAt = code.indexOf('rows.push({ kind: "discoveryEmpty" });');
  assert.ok(
    guardAt !== -1 && headingAt > guardAt,
    "the discovery heading is built only when the section is supplied",
  );
  assert.ok(
    emptyAt > guardAt,
    "the discovery empty row is built only when the section is supplied",
  );
  // The heading itself renders only when the host supplies a title.
  assert.match(code, /if \(discoveryTitle\) \{\s*rows\.push\(\{ kind: "discoveryHeading" \}\);/);
  // Pagination stays inert when the section is absent.
  assert.match(code, /itemCount: discoveryRecipes !== undefined \? discoveryRecipes\.length : 0,/);
  assert.match(code, /hasDiscovery && !loadingOwn && !loadingDiscovery && !discoveryErrorMessage/);
  // The OwnOnly story proves the omission path: it passes no discovery props.
  assert.match(
    stories,
    /export const OwnOnly: Story = \{\s*\/\/[^\n]*\n(?:\s*\/\/[^\n]*\n)*\s*render: \(\) => <RecipesPageDemo omitDiscovery \/>/,
  );
});

test("one row sequence: the own section precedes the discovery section in the one list", () => {
  assert.match(code, /const rows: RecipesPageRow\[\] = \[\{ kind: "ownHeading" \}\];/);
  const ownAt = code.indexOf('rows.push({ kind: "ownRecipe", item });');
  const discoveryHeadingAt = code.indexOf('rows.push({ kind: "discoveryHeading" });');
  const discoveryAt = code.indexOf('rows.push({ kind: "discoveryRecipe", item });');
  assert.ok(
    ownAt !== -1 && discoveryHeadingAt > ownAt,
    "own rows are built before the discovery heading",
  );
  assert.ok(discoveryAt > discoveryHeadingAt, "discovery rows follow their heading");
  assert.equal(
    count(code, "<BoundedList"),
    1,
    "the page renders exactly one list (one scroll surface)",
  );
  assert.match(code, /data=\{rows\}/, "the one list takes the unified row sequence");
  assert.match(code, /<SectionHeading>\{ownTitle\}<\/SectionHeading>/);
  assert.match(code, /<SectionHeading>\{discoveryTitle \?\? ""\}<\/SectionHeading>/);
});

test("recipe row keys live in their own namespace, never colliding with heading/state keys", () => {
  // A recipe id like "heading", "loading", "error" or "empty" must
  // not produce the section heading's or a state row's key.
  assert.match(code, /return `own-recipe-\$\{row\.item\.id\}`;/);
  assert.match(code, /return `discovery-recipe-\$\{row\.item\.id\}`;/);
  assert.ok(
    !code.includes("return `own-${row.item.id}`;"),
    "bare own- recipe keys collide with own-heading/own-loading/own-error/own-empty",
  );
  assert.ok(
    !code.includes("return `discovery-${row.item.id}`;"),
    "bare discovery- recipe keys collide with the discovery heading/state keys",
  );
});

test("exactly one search/filter bar covers the unified collection", () => {
  assert.equal(
    count(code, "<CatalogFiltersBar"),
    1,
    "exactly one CatalogFiltersBar may render — a second bar is the two-surface problem #415 removes",
  );
  assert.equal(
    count(code, "CatalogFiltersBar"),
    3,
    "the name appears only as the import, its module path, and the one render — no second bar composition",
  );
  assert.match(
    code,
    /export type RecipesPageFilterId = "status" \| "ingredient" \| "calories" \| "satiety" \| "sort";/,
    "the filter-id set is the one both predecessor pages shared",
  );
  assert.match(code, /searchPlaceholder="Search recipes…"/);
});

test("shared items carry their caller-supplied badge inside the own section", () => {
  assert.match(
    code,
    /badgeLabel\?: string;/,
    "RecipesPageItem must declare the caller-supplied badgeLabel",
  );
  assert.match(
    code,
    /badgeLabel=\{item\.badgeLabel\}/,
    "own rows pass the item's badge to MediaRow",
  );
  assert.match(
    mediaRow,
    /badgeLabel\?: string \| undefined;/,
    "MediaRow must declare the badge prop",
  );
  assert.match(
    mediaRow,
    /<Badge tone="info">\{badgeLabel\}<\/Badge>/,
    "the badge renders through the shared Badge component",
  );
  assert.match(
    mediaRow,
    /if \(badgeLabel\) labelParts\.push\(badgeLabel\);/,
    "the badge joins the row's accessible name — it is announced, not decoration",
  );
  assert.match(
    stories,
    /badgeLabel: "Shared with you"/,
    "the stories mark shared items with the caller-supplied badge",
  );
});

test("section states are independent: each section's state keys off its own props only", () => {
  // The own section's state chain reads only own props, in
  // loading → error → empty → rows order.
  assert.match(
    code,
    /if \(loadingOwn\) \{\s*rows\.push\(\{ kind: "loadingOwn" \}\);\s*\} else if \(ownErrorMessage\) \{\s*rows\.push\(\{ kind: "ownError", message: ownErrorMessage \}\);\s*\} else if \(ownRecipes\.length === 0\) \{\s*rows\.push\(\{ kind: "ownEmpty" \}\);/,
    "the own section's state chain must key off the own props only",
  );
  assert.match(
    code,
    /if \(loadingDiscovery\) \{\s*rows\.push\(\{ kind: "loadingDiscovery" \}\);\s*\} else if \(discoveryErrorMessage\) \{\s*rows\.push\(\{ kind: "discoveryError", message: discoveryErrorMessage \}\);\s*\} else if \(discoveryRecipes\.length === 0\) \{\s*rows\.push\(\{ kind: "discoveryEmpty" \}\);/,
    "the discovery section's state chain must key off the discovery props only",
  );
  // Each state renders as its own section's row.
  assert.match(
    code,
    /case "ownError":\s*return <Alert severity="error">\{row\.message\}<\/Alert>;/,
  );
  assert.match(
    code,
    /case "discoveryError":\s*return <Alert severity="error">\{row\.message\}<\/Alert>;/,
  );
  assert.match(code, /case "ownEmpty":/);
  assert.match(code, /title=\{ownEmptyTitle\}/, "the own empty row carries the caller's own copy");
  assert.match(code, /case "discoveryEmpty":/);
  assert.match(
    code,
    /title=\{discoveryEmptyTitle\}/,
    "the discovery empty row carries the caller's discovery copy",
  );
  assert.equal(
    count(code, '<Spinner label="Loading" />'),
    4,
    "four spinner renders: the two sections' loading rows, the own section's load-more row (#438 Part 3), and the loading-more footer",
  );
});

test("discovery rows are permalink DiscoveryCards; the view-model is DiscoverPage's item", () => {
  assert.match(
    code,
    /export type RecipesPageDiscoveryItem = DiscoverPageItem;/,
    "the discovery view-model reuses DiscoverPage's item type so the public rows cannot drift",
  );
  assert.match(code, /import type \{ DiscoverPageItem \} from "\.\/DiscoverPage\.js";/);
  assert.match(code, /<DiscoveryCard/);
  assert.match(code, /href=\{item\.href\}/, "discovery cards carry the host-built permalink");
  assert.ok(!code.includes("onRecipePress"), "no press callback may replace the permalink");
});

test("pagination is the discovery continuation, gated on both loads and the discovery error", () => {
  assert.match(
    code,
    /itemCount: discoveryRecipes !== undefined \? discoveryRecipes\.length : 0,\s*canPaginate:\s*hasDiscovery && !loadingOwn && !loadingDiscovery && !discoveryErrorMessage,/,
    "the shared pattern counts discovery rows and gates on both first loads + the discovery error — and on the section being supplied at all (#512)",
  );
});

test("DiscoverPage stays in place and both pages stay exported (#415 follow-up owns its removal)", () => {
  assert.match(index, /export \{\s*DiscoverPage,/);
  assert.match(index, /type RecipesPageDiscoveryItem,/);
  assert.match(index, /export \{\s*RecipesPage,/);
});

test("stories cover the unified states", () => {
  for (const story of [
    "Default",
    "OwnOnly",
    "DiscoveryOnly",
    "Empty",
    "Loading",
    "DiscoveryError",
  ]) {
    assert.ok(
      new RegExp(String.raw`export const ${story}\b`).test(stories),
      `RecipesPage.stories.tsx must export a ${story} story`,
    );
  }
  assert.match(stories, /ownTitle="Your recipes"/, "the demo supplies the own section's title");
  assert.match(
    stories,
    /discoveryTitle: "Discover"/,
    "the demo supplies the discovery section's title (spread in unless the story omits the section, #512)",
  );
  // The demo's one search filters both sections — the honest
  // stand-in for the app's unified server-side filtering.
  assert.match(stories, /const visibleOwn = ownRecipes\.filter\(/);
  assert.match(stories, /const visibleDiscovery = discoveryRecipes\.filter\(/);
});
