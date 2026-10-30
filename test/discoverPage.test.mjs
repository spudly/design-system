/**
 * Contract test for DiscoverPage and DiscoveryCard
 * (spudly/design-system#168), the design-system port of Eciperay's
 * public recipe catalog (the web `/discover` route).
 *
 * Stephen's contract decisions (2026-10-28) and what they pin:
 * 1. Card navigation is a real href, not a press callback (the
 *    navigation rule: a control that navigates is a link with an
 *    href). Items carry the host-built permalink; the page
 *    declares no `onRecipePress`; the standalone DiscoveryCard
 *    renders a real anchor on web (SSR-verified below).
 * 2. The filter bar is the collapsed add-filter chooser
 *    (RecipesPage's #96 bar, mirrored): search + Filters button
 *    initially, a filter's control only once added, removal
 *    clearing values through the change callbacks. The public
 *    catalog's search placeholder is a prop (its copy differs
 *    from RecipesPage's). The bar is definition-driven
 *    (Stephen's ruling on PR #311): the filter/filter-sorter
 *    lists are the page's data, passed in as definitions — the
 *    bar owns the control shapes only.
 * 3. The error state exists: `errorMessage: string | null`
 *    renders an error alert as the list's empty state — the
 *    retired web view never read the query error and spun
 *    forever. Loading (spinner) and empty (`emptyMessage`) are
 *    the other two mutually exclusive empty states.
 * 4. The discovery card is a standalone widget exported from the
 *    root barrel; the page is exported from the pages barrel.
 * 5. Stories cover populated / filtered / empty / loading /
 *    error / loading-more / chooser-open / filters-added in the
 *    Warm Harvest theme.
 *
 * The source scans follow test/recipesPageCollapsedFilters
 * .test.mjs: the repo has no JS renderer for page components
 * (they import react-native), and the invariants are per-literal
 * properties of the source. Comments are stripped before
 * scanning so prose cannot satisfy the patterns. The card is a
 * root-exported widget with no react-native import, so its
 * anchor is verified at runtime against the built output, like
 * test/textHeadingSemantics.test.mjs.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const pagesDir = join(root, "src", "pages");
const componentsDir = join(root, "src", "components");

function readCode(path) {
  return readFileSync(path, "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const page = readCode(join(pagesDir, "DiscoverPage.tsx"));
const pageStories = readCode(join(pagesDir, "DiscoverPage.stories.tsx"));
// The page's internals moved into shared components in the #119
// de-styling tranche, canonized in the #320 dedupe: the filter
// bar is CatalogFiltersBar, the list header is CatalogHeader,
// and the list's loading state is ListLoadingState; the error
// state renders Alert directly (the ListErrorState middleman was
// removed in #320 — Stephen's no-middleman ruling). The scans
// below follow the code — the bar's decisions pin against the
// bar, the heading against the header, the states against the
// page's own composition — while the page-level pins (contract,
// pagination wiring, composition) stay on the page.
const bar = readCode(join(componentsDir, "CatalogFiltersBar.tsx"));
const catalogHeader = readCode(join(componentsDir, "CatalogHeader.tsx"));
const loadingState = readCode(join(componentsDir, "ListLoadingState.tsx"));
const card = readCode(join(componentsDir, "DiscoveryCard.tsx"));
const cardStories = readCode(join(componentsDir, "DiscoveryCard.stories.tsx"));
const pagesBarrel = readCode(join(pagesDir, "index.ts"));
const componentsBarrel = readCode(join(componentsDir, "index.ts"));

test("the page contract carries copy in and the error state (decision 3)", () => {
  assert.match(page, /title: string;/);
  assert.match(page, /searchPlaceholder: string;/);
  assert.match(page, /emptyMessage: string;/);
  assert.match(page, /errorMessage: string \| null;/);
  assert.match(
    page,
    /<Alert severity="error">\{errorMessage\}<\/Alert>/,
    "the error state renders errorMessage as an error alert, directly (no middleman state component)",
  );
  assert.match(
    page,
    /<EmptyState title=\{emptyMessage\} \/>/,
    "the empty state must carry emptyMessage",
  );
  assert.match(
    page,
    /<ListLoadingState label="Loading" \/>/,
    "loading renders the spinner empty state",
  );
  assert.match(
    loadingState,
    /<Spinner label=\{label\} \/>/,
    "the loading state renders the spinner",
  );
});

test("card navigation is an href, never a press callback (decision 1)", () => {
  assert.match(page, /href: string;/, "items must carry the host-built permalink");
  assert.ok(!page.includes("onRecipePress"), "the page must not declare an onRecipePress callback");
  assert.match(
    page,
    /<DiscoveryCard/,
    "rows must render through the standalone DiscoveryCard widget (decision 4)",
  );
  assert.match(card, /href: string;/, "the card's permalink is a required prop");
  assert.ok(!card.includes("onPress"), "the card must not take or fire a press callback");
  assert.match(card, /<Anchor href=\{href\}/, "on web the card must render a real anchor");
  assert.match(card, /if \(isWeb\)/, "the anchor render is the web branch of the platform split");
});

test("the collapsed-filter contract props are declared (decision 2)", () => {
  assert.match(
    page,
    /export type DiscoverPageFilterId = "status" \| "ingredient" \| "calories" \| "satiety" \| "sort";/,
    "DiscoverPageFilterId must enumerate the five addable filters",
  );
  assert.match(page, /activeFilters\?: DiscoverPageFilterId\[\];/);
  assert.match(page, /onActiveFiltersChange\?: \(filters: DiscoverPageFilterId\[\]\) => void;/);
  assert.match(page, /filterChooserOpen\?: boolean;/);
  assert.match(page, /onFilterChooserOpenChange\?: \(open: boolean\) => void;/);
});

test("search (with the page's own placeholder) and the Filters button are the initial render", () => {
  assert.match(
    bar,
    /placeholder=\{searchPlaceholder\}/,
    "the search field takes the placeholder prop",
  );
  assert.match(bar, /accessibilityLabel="Add a filter"/, "the Filters button must be named");
  assert.match(bar, />\s*Filters\s*<\/Button>/, "the button label is Filters");
  const searchAt = bar.indexOf("<SearchField");
  const buttonAt = bar.indexOf('accessibilityLabel="Add a filter"');
  assert.ok(searchAt !== -1 && buttonAt > searchAt, "search renders before the Filters button");
});

test("each filter control renders only when its filter is added", () => {
  assert.match(
    bar,
    /const added = filters\.filter\(\(definition\) => active\.includes\(definition\.id\)\);/,
    "controls render from the added definitions only",
  );
  assert.match(bar, /\{added\.map\(\(definition\) => \(/);
  assert.match(bar, /<FilterControl definition=\{definition\} \/>/);
  assert.match(
    page,
    /filters=\{catalogFilters\}/,
    "the page passes its filter definitions into the bar",
  );
  // The option sets are the page's data (PR #311): they live in
  // the page and reach the bar inside the definitions.
  assert.match(page, /const STATUS_OPTIONS: SelectOption\[\] = \[/);
  assert.match(page, /options: STATUS_OPTIONS,/);
  assert.match(page, /sortOptions: SORT_OPTIONS,/);
  assert.match(page, /dirOptions: SORT_DIR_OPTIONS,/);
});

test("the chooser offers exactly the filters not yet added, and adding closes it", () => {
  assert.match(
    bar,
    /const addable = filters\.filter\(\(definition\) => !active\.includes\(definition\.id\)\);/,
  );
  assert.match(bar, /accessibilityLabel=\{`Add \$\{definition\.label\} filter`\}/);
  assert.match(bar, /setActive\(\[\.\.\.active, id\]\);\s*setChooserOpen\(false\);/);
});

test("removing a filter clears its values through the change callbacks", () => {
  assert.match(bar, /definition\.onChange\(definition\.defaultValue\);/);
  assert.match(bar, /definition\.onMinChange\(""\);\s*definition\.onMaxChange\(""\);/);
  assert.match(
    bar,
    /definition\.onSortChange\(definition\.defaultSortValue\);\s*definition\.onDirChange\(definition\.defaultDirValue\);/,
  );
  assert.match(
    bar,
    /removeAccessibilityLabel=\{`Remove \$\{definition\.label\} filter`\}/,
    "the added filter's remove control is a RemovableField naming the filter",
  );
});

test("the title renders as the page heading and pagination rides the shared catalog pattern", () => {
  assert.match(
    catalogHeader,
    /<Text variant="heading">\{title\}<\/Text>/,
    "the list header renders the title as the heading",
  );
  assert.match(
    page,
    /<CatalogHeader title=\{title\}>/,
    "the page renders its title through the list header",
  );
  // Pagination is the shared catalog pattern (#285): the page
  // wires useCatalogPagination — the same hook RecipesPage
  // uses — with this page's mount gate (first load + error
  // state) as canPaginate, and the list takes the hook's
  // handler verbatim. The hook's contract suite
  // (test/catalogPagination.test.mjs) pins the guard, the
  // mount gate, and the fetch-completion re-arm itself. No
  // recipes.length gate may appear in the wiring: an empty
  // page with a live continuation still paginates.
  assert.match(
    page,
    /const \{ onEndReached, onScroll, onEndReachedThreshold \} = useCatalogPagination\(\{\s*onLoadMore,\s*isFetchingNextPage,\s*itemCount: recipes\.length,\s*canPaginate: !isLoading && !errorMessage,\s*\}\);/,
  );
  assert.match(page, /onEndReached=\{onEndReached\}/);
  assert.match(page, /onScroll=\{onScroll\}/);
  assert.match(page, /onEndReachedThreshold=\{onEndReachedThreshold\}/);
  assert.ok(
    !page.includes("handleEndReached"),
    "the page must not keep a local end-reached handler — the pattern is shared (#285)",
  );
  assert.match(
    page,
    /isFetchingNextPage \? <ListLoadingState label="Loading" \/>/,
    "the loading-more footer keys off isFetchingNextPage",
  );
});

test("no app imports in the page or the card", () => {
  for (const [name, source] of [
    ["DiscoverPage", page],
    ["DiscoveryCard", card],
  ]) {
    const specifiers = [...source.matchAll(/from\s+"([^"]+)"/g)].map((m) => m[1]);
    assert.ok(specifiers.length > 0, `expected import specifiers to scan in ${name}`);
    for (const specifier of specifiers) {
      assert.ok(
        specifier === "react" ||
          specifier === "react-native" ||
          specifier === "tamagui" ||
          specifier.startsWith("../tokens/") ||
          specifier.startsWith("../components/") ||
          specifier.startsWith("./"),
        `${name} must not import "${specifier}" — app logic stays app-side`,
      );
    }
  }
});

test("both components are exported from their barrels (decision 4)", () => {
  assert.match(pagesBarrel, /export \{\s*DiscoverPage,/);
  assert.match(pagesBarrel, /type DiscoverPageProps,/);
  assert.match(pagesBarrel, /type DiscoverPageItem,/);
  assert.match(componentsBarrel, /export \{ DiscoveryCard, type DiscoveryCardProps \}/);
});

test("stories cover the contract states in Warm Harvest", () => {
  assert.match(pageStories, /title: "Pages\/Eciperay\/DiscoverPage"/);
  assert.match(pageStories, /theme: "light_warmHarvest"/);
  for (const story of [
    "Default",
    "Filtered",
    "Empty",
    "Loading",
    "ErrorState",
    "LoadingMore",
    "FilterChooserOpen",
    "WithFiltersAdded",
  ]) {
    assert.ok(
      new RegExp(String.raw`export const ${story}\b`).test(pageStories),
      `DiscoverPage.stories.tsx must export a ${story} story`,
    );
  }
  assert.match(cardStories, /title: "Components\/DiscoveryCard"/);
  assert.match(cardStories, /export const Default/);
  assert.match(cardStories, /export const WithoutSubtitle/);
});

// Runtime imports are lazy, like textHeadingSemantics.test.mjs,
// so the source-scan tests above still run when the build output
// is missing.
let runtimePromise;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider } = await import("tamagui");
    const dist = await import("../dist/index.js");
    return { React, renderToString, TamaguiProvider, ...dist };
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

test("SSR: DiscoveryCard renders a real anchor carrying the permalink", async () => {
  const { React, DiscoveryCard } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(DiscoveryCard, {
      title: "Beef Chili",
      subtitle: "By Sam · ★ 4 · Satiety 75",
      href: "/recipe/beef-chili/beef-chili",
    }),
  );
  assert.ok(
    /<a [^>]*href="\/recipe\/beef-chili\/beef-chili"/.test(html),
    `expected a real <a href> in: ${html.slice(0, 400)}`,
  );
  assert.ok(html.includes('role="link"'), "the anchor carries the link role");
  assert.ok(html.includes("Beef Chili"), "the title renders inside the anchor");
  assert.ok(html.includes("By Sam · ★ 4 · Satiety 75"), "the subtitle renders inside the anchor");
  assert.ok(!/accessibilityrole/i.test(html), "accessibilityrole must not leak to the DOM");
  assert.ok(!html.includes("[object Object]"), "no stringified object in the DOM");
});

test("SSR: DiscoveryCard without a subtitle renders the title alone", async () => {
  const { React, DiscoveryCard } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(DiscoveryCard, {
      title: "Arroz con Pollo",
      href: "/recipe/arroz-con-pollo/arroz-con-pollo",
    }),
  );
  assert.ok(/<a [^>]*href="\/recipe\/arroz-con-pollo\/arroz-con-pollo"/.test(html));
  assert.ok(html.includes("Arroz con Pollo"));
});
