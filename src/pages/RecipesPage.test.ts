import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

describe("recipesPageAccessory", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const pagesDir = join(here, "../..", "src", "pages");
  const source = readFileSync(join(pagesDir, "RecipesPage.tsx"), "utf8");
  // The MediaRow composition is page-local (bottom of the page
  // file); slice it out so the placement pins run against it.
  const mediaRow = source.slice(
    source.indexOf("const textBlockStyle"),
    source.indexOf("const STAR_STEPS"),
  );
  const stories = readFileSync(join(pagesDir, "RecipesPage.stories.tsx"), "utf8");

  // Strip block and line comments so documented patterns in prose
  // cannot pass the scan.
  const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

  test("the accessory slot prop is declared with the id-based signature", () => {
    assert.match(
      code,
      /renderRecipeAccessory\?: \(recipeId: string\) => ReactNode;/,
      "RecipesPageProps must declare renderRecipeAccessory?: (recipeId: string) => ReactNode",
    );
  });

  test("the slot is called once per row with the row id, only when provided", () => {
    assert.match(
      code,
      /const accessory = renderRecipeAccessory \? renderRecipeAccessory\(item\.id\) : null;/,
      "renderItem must resolve the row's accessory via renderRecipeAccessory(item.id), defaulting to null",
    );
    assert.equal(
      code.split("renderRecipeAccessory(item.id)").length - 1,
      1,
      "the slot must be called exactly once per row (a second call site could double-render app content)",
    );
  });

  test("a row with accessory content hides its Log cook button; other rows keep it", () => {
    assert.match(
      code,
      /const hasAccessory = accessory !== null && accessory !== undefined;/,
      "hasAccessory must be exactly the non-null/non-undefined check on the slot's return",
    );
    assert.match(
      code,
      /onLogCookPress && !hasAccessory/,
      "the row's onLogCookPress wiring must be withheld while its accessory renders",
    );
    assert.match(
      code,
      /onLogCookPress\(item\.id\)/,
      "when wired, the callback still fires with the row id, unchanged",
    );
  });

  test("the accessory renders under the row's card, inside the list item", () => {
    // Since the #119 recipes-list tranche the row is the page's
    // page-local MediaRow composition: the page hands the
    // accessory over only when it has content, and the under-card
    // placement is the composition's own.
    assert.match(
      code,
      /accessory=\{hasAccessory \? accessory : undefined\}/,
      "the page must pass the accessory to MediaRow only when it renders content",
    );
    const cardAt = mediaRow.indexOf("<Card variant=");
    const accessoryAt = mediaRow.indexOf("{accessory}");
    assert.ok(cardAt !== -1, "MediaRow must render its row card");
    assert.ok(accessoryAt > cardAt, "the accessory must render after (under) the row's card");
    assert.match(
      mediaRow,
      /\{accessory \? <YStack paddingBlockEnd="\$3">\{accessory\}<\/YStack> : null\}/,
      "the accessory must render in the under-card YStack only when it has content",
    );
  });

  test("a story exercises the slot so Chromatic captures the expanded layout", () => {
    assert.match(
      stories,
      /export const ExpandedAccessory/,
      "RecipesPage.stories.tsx must export an ExpandedAccessory story",
    );
    assert.match(
      stories,
      /renderRecipeAccessory: \(recipeId: string\) =>/,
      "the story must pass renderRecipeAccessory with per-row content",
    );
  });
});

describe("recipesPageBoundedList", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const pagesDir = join(here, "../..", "src", "pages");
  const code = readFileSync(join(pagesDir, "RecipesPage.tsx"), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
  const stories = readFileSync(join(pagesDir, "RecipesPage.stories.tsx"), "utf8");

  test("RecipesPage renders the fixed list shell, non-scrolling", () => {
    assert.match(
      code,
      /<ScreenContainer variant="list" scrollable=\{false\}>/,
      "RecipesPage must render ScreenContainer's list variant so the shell owns the fill",
    );
  });

  test("RecipesPage adopts BoundedList with its separator and inset (#119)", () => {
    assert.match(code, /import \{[\s\S]*?BoundedList[\s\S]*?\} from "\.\/BoundedList\.js";/);
    assert.match(code, /<BoundedList/);
    assert.match(
      code,
      /separator="none"/,
      "the rows space themselves (MediaRow's own padded wrapper) — no list separator, exactly the pre-adoption structure",
    );
    assert.match(
      code,
      /contentInset="page"/,
      "the page's 16px sides / 32px bottom inset is BoundedList's page inset",
    );
    assert.ok(
      !code.includes("FlatList"),
      "the page must not render its own list element — BoundedList owns it",
    );
    assert.ok(
      !code.includes("listStyle"),
      "the page must not carry the old listStyle constant — BoundedList owns the geometry",
    );
  });

  test("the list takes separating taps while the keyboard is open", () => {
    assert.match(
      code,
      /keyboardShouldPersistTaps="handled"/,
      "filter controls live in the list header — taps must land with the keyboard open",
    );
  });

  test("loading keeps the list mounted and shows the spinner as the section's own row", () => {
    // Since #415 the list's data is the unified row sequence: a
    // section's loading flag swaps only that section's rows for
    // its spinner row — the DATA is never emptied and the list
    // never unmounts, so the focused filter input survives a
    // filter edit mid-typing (the #188 rule, per-section now).
    assert.match(
      code,
      /data=\{rows\}/,
      "the list takes the unified row sequence, never a loading-emptied array",
    );
    assert.match(
      code,
      /case "loadingOwn":\s*return \(\s*<Center>\s*<Spinner label="Loading" \/>\s*<\/Center>\s*\);/,
      "the own section's spinner renders as that section's row in the list",
    );
    assert.match(
      code,
      /case "loadingDiscovery":\s*return \(\s*<Center>\s*<Spinner label="Loading" \/>\s*<\/Center>\s*\);/,
      "the discovery section's spinner renders as that section's row in the list",
    );
    assert.ok(
      !code.includes("ListEmptyComponent"),
      "there is no list-level empty state anymore — each section carries its own empty row (#415)",
    );
    assert.match(
      code,
      /ListHeaderComponent=\{\s*<CatalogFiltersBar/,
      "the filter bar renders once as the list header, so it scrolls with the recipes",
    );
  });

  test("rows render through MediaRow, standalone (no list-item wrapper)", () => {
    assert.match(code, /renderItem=\{\(\{ item: row \}\) => \{/);
    assert.match(code, /<MediaRow/);
    assert.ok(
      !code.includes('role="listitem"'),
      "rows must not be wrapped in a listitem element — each row is a standalone article",
    );
  });

  test("the list stories pin the bounded geometry (#188)", () => {
    assert.match(
      stories,
      /<View width=\{430\} maxWidth="100%" height=\{844\}>/,
      "the stories' Viewport bounds the list to a phone-height frame",
    );
    assert.match(stories, /export const Default/);
    assert.match(stories, /export const Empty/);
    assert.match(stories, /export const Loading/);
  });
});

describe("recipesPageCollapsedFilters", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const pagesDir = join(here, "../..", "src", "pages");
  const source = readFileSync(join(pagesDir, "RecipesPage.tsx"), "utf8");
  const stories = readFileSync(join(pagesDir, "RecipesPage.stories.tsx"), "utf8");

  const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

  test("the collapsed-filter contract props are declared", () => {
    assert.match(
      code,
      /export type RecipesPageFilterId = "status" \| "ingredient" \| "calories" \| "satiety" \| "sort";/,
      "RecipesPageFilterId must enumerate the five addable filters",
    );
    assert.match(code, /activeFilters\?: RecipesPageFilterId\[\];/);
    assert.match(code, /onActiveFiltersChange\?: \(filters: RecipesPageFilterId\[\]\) => void;/);
    assert.match(code, /filterChooserOpen\?: boolean;/);
    assert.match(code, /onFilterChooserOpenChange\?: \(open: boolean\) => void;/);
  });

  test("the page renders the shared CatalogFiltersBar with its search copy", () => {
    assert.match(code, /<CatalogFiltersBar/);
    assert.match(code, /searchPlaceholder="Search recipes…"/);
    assert.match(code, /filters=\{catalogFilters\}/);
    assert.match(code, /\{\.\.\.\(activeFilters \? \{ activeFilters \} : \{\}\)\}/);
    assert.match(code, /\{\.\.\.\(onActiveFiltersChange \? \{ onActiveFiltersChange \} : \{\}\)\}/);
    assert.match(
      code,
      /\{\.\.\.\(filterChooserOpen !== undefined \? \{ filterChooserOpen \} : \{\}\)\}/,
    );
    assert.match(
      code,
      /\{\.\.\.\(onFilterChooserOpenChange \? \{ onFilterChooserOpenChange \} : \{\}\)\}/,
    );
  });

  test("the page supplies its five filters as definitions, in chooser order", () => {
    // Status: a select over the page's option set, defaulting to
    // "all", joining only when the host wires it.
    assert.match(
      code,
      /showStatusFilter !== false &&\s*statusFilter !== undefined &&\s*onStatusFilterChange !== undefined/,
      "the status filter joins only when the host wires it (value + callback, not hidden)",
    );
    assert.match(code, /kind: "select",\s*id: "status",\s*label: "Status",/);
    assert.match(code, /options: STATUS_OPTIONS,/);
    assert.match(code, /defaultValue: "all",/);
    // Ingredient: free text with the page's placeholder.
    assert.match(code, /kind: "text",\s*id: "ingredient",\s*label: "Ingredient",/);
    assert.match(code, /placeholder: "e\.g\. chicken",/);
    assert.match(code, /defaultValue: "",/);
    // Calories and satiety: one range filter each, min/max labels.
    assert.match(code, /kind: "range",\s*id: "calories",\s*label: "Calories",/);
    assert.match(code, /minLabel: "Min cal",\s*maxLabel: "Max cal",/);
    assert.match(code, /kind: "range",\s*id: "satiety",\s*label: "Satiety",/);
    assert.match(code, /minLabel: "Min satiety",\s*maxLabel: "Max satiety",/);
    // Sort: the Sort by / Order pair with the page's defaults.
    assert.match(code, /kind: "sort",\s*id: "sort",\s*label: "Sort",/);
    assert.match(code, /sortLabel: "Sort by",/);
    assert.match(code, /sortOptions: SORT_OPTIONS,/);
    assert.match(code, /defaultSortValue: "newest",/);
    assert.match(code, /dirLabel: "Order",/);
    assert.match(code, /dirOptions: SORT_DIR_OPTIONS,/);
    assert.match(code, /defaultDirValue: "desc",/);
  });

  test("the page carries no filter-bar implementation of its own (#119 dedupe)", () => {
    for (const retired of [
      "RecipesFiltersBar",
      "NumberFilter",
      "FILTER_LABELS",
      "ALL_FILTER_IDS",
    ]) {
      assert.ok(
        !code.includes(retired),
        `${retired} was the in-page bar's machinery — the shared CatalogFiltersBar owns it now and it must not come back`,
      );
    }
  });

  test("stories cover the initial, chooser-open and filters-added states", () => {
    assert.match(stories, /export const Default/);
    assert.match(stories, /export const FilterChooserOpen/);
    assert.match(stories, /export const WithFiltersAdded/);
    assert.match(stories, /initialActiveFilters=\{\["status", "ingredient"\]\}/);
    assert.match(stories, /activeFilters=\{activeFilters\}/);
    assert.match(stories, /filterChooserOpen=\{filterChooserOpen\}/);
  });
});

describe("recipesPageRowA11y", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const page = readFileSync(join(here, "../..", "src", "pages", "RecipesPage.tsx"), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
  // The MediaRow composition is page-local (bottom of the page
  // file); slice it out so the row pins run against it alone.
  const mediaRow = page.slice(
    page.indexOf("const textBlockStyle"),
    page.indexOf("const STAR_STEPS"),
  );

  function count(code: string, literal: any) {
    return code.split(literal).length - 1;
  }

  test("both row links exist on both platforms, each carrying the row href", () => {
    assert.equal(
      count(mediaRow, 'accessibilityRole: "link"'),
      2,
      "the two web anchors declare the link role through the translator",
    );
    assert.equal(
      count(mediaRow, 'accessibilityRole="link"'),
      2,
      "the two native LinkOverlays declare the link role directly",
    );
    assert.equal(
      count(mediaRow, "href={href}"),
      4,
      "both web anchors and both native overlays carry the href",
    );
  });

  test("the media link is named by the title; the text link composes title, subtitle and badge", () => {
    assert.match(
      mediaRow,
      /const labelParts = \[title\];\s*if \(subtitle\) labelParts\.push\(subtitle\);\s*if \(badgeLabel\) labelParts\.push\(badgeLabel\);\s*const textLabel = labelParts\.join\(", "\);/,
      "the text link's label composes title, subtitle, and the caller-supplied badge (#415) with the comma separator, in that order",
    );
    assert.equal(count(mediaRow, "accessibilityLabel: title"), 1, "the web media anchor's label");
    assert.equal(
      count(mediaRow, "accessibilityLabel={title}"),
      1,
      "the native media overlay's label",
    );
    assert.equal(
      count(mediaRow, "accessibilityLabel: textLabel"),
      1,
      "the web text anchor's label",
    );
    assert.equal(
      count(mediaRow, "accessibilityLabel={textLabel}"),
      1,
      "the native text overlay's label",
    );
  });

  test("native hit testing falls through the decorative texts; the action keeps its presses", () => {
    // Three pointer-transparent natives: the title text, the
    // subtitle text, and the badge row (#415 — the badge is
    // display-only, so its row falls through like the texts).
    assert.equal(count(mediaRow, 'pointerEvents={native ? "none" : undefined}'), 3);
    assert.equal(count(mediaRow, 'pointerEvents={native ? "box-none" : undefined}'), 1);
  });

  test("the row is never a pressable card; the only press target is the caller's subtitle action", () => {
    assert.ok(!mediaRow.includes("onPress"), "MediaRow renders no press handler of its own");
    assert.ok(!mediaRow.includes("<Button"), "MediaRow renders no button");
    assert.ok(
      !page.includes("TouchableOpacity"),
      "the page renders no raw pressable — the log-cook control is RatingStars",
    );
  });

  test("the page wires the row href and fields through unchanged", () => {
    assert.match(page, /<MediaRow\s+href=\{item\.href\}\s+title=\{item\.title\}/);
    assert.match(page, /subtitle=\{item\.subtitle\}/);
    assert.match(page, /imageUrl=\{item\.imageUrl\}/);
  });
});

describe("recipesPageRowActions", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const code = readFileSync(join(here, "../..", "src", "pages", "RecipesPage.tsx"), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
  // The page-local compositions live at the bottom of the page
  // file; slice them out so page-level code cannot satisfy the
  // composition pins.
  const mediaRow = code.slice(
    code.indexOf("const textBlockStyle"),
    code.indexOf("const STAR_STEPS"),
  );
  const ratingStars = code.slice(code.indexOf("const STAR_STEPS"));
  const stories = readFileSync(
    join(here, "../..", "src", "pages", "RecipesPage.stories.tsx"),
    "utf8",
  );

  test("the log-cook callback is optional and keyed by recipe id", () => {
    assert.match(code, /onLogCookPress\?: \(recipeId: string\) => void;/);
    assert.match(code, /onLogCookPress\(item\.id\)/);
  });

  test("there is no delete affordance on the list", () => {
    assert.ok(!code.includes("onDelete"), "RecipesPage must not expose a delete callback");
    assert.ok(!code.includes("Delete"), "RecipesPage rows render no delete control");
  });

  test("rows place the RatingStars control in the subtitle flow, rated names carrying the rating", () => {
    const dollar = String.raw`\$`;
    assert.match(code, /<RatingStars/);
    assert.match(
      code,
      new RegExp(
        `\`Log a cook of ${dollar}{item\\.title}, rated ${dollar}{item\\.rating} out of 5 stars\``,
      ),
      "the rated control's name must carry the rating — the stars alone would mislead a screen reader",
    );
    assert.match(
      code,
      new RegExp(`\`Log a cook of ${dollar}{item\\.title}\``),
      "the unrated control's name is just the action and the title",
    );
    assert.match(
      code,
      /subtitleAction=\{/,
      "the control renders through MediaRow's subtitleAction slot",
    );
    assert.match(
      mediaRow,
      /flexWrap="wrap"\s+alignItems="center"\s+gap="\$1"\s+paddingTop="\$1"/,
      "MediaRow's subtitle flow is a wrapping inline row — the action sits in the subtitle's flow",
    );
    assert.match(mediaRow, /\{subtitleAction\}/);
  });

  test("RatingStars fills by rounding, in the DS star colors", () => {
    assert.match(
      ratingStars,
      /Math\.min\(5, Math\.max\(1, Math\.round\(rating\)\)\)/,
      "display averages fill by rounding to whole stars, clamped to 1–5",
    );
    assert.match(ratingStars, /tokens\.colors\.warning\.warning6/);
    assert.match(ratingStars, /tokens\.colors\.gray\.gray4/);
    assert.equal(
      ratingStars.split("★").length - 1,
      2,
      "two glyph literals: the star row's and the unrated button's single star",
    );
  });

  test("the pressable form cancels the click default before firing (the row's links must not also navigate)", () => {
    assert.match(ratingStars, /event\.preventDefault\(\);\s*onPress\(\);/);
    assert.match(ratingStars, /accessibilityRole: "button"/);
    assert.match(
      ratingStars,
      /if \(!props\.onPress\) \{\s*return <RatingStarRow rating=\{props\.rating\} \/>;/,
      "without onPress the stars are a static display, never a button",
    );
  });

  test("a per-item canLogCook opt-out suppresses the control (#518)", () => {
    assert.match(
      code,
      /canLogCook\?: boolean;/,
      "RecipesPageItem carries the optional canLogCook capability field",
    );
    assert.match(
      code,
      /onLogCookPress && !hasAccessory && item\.canLogCook !== false \? \(/,
      "the subtitleAction gate omits the control when canLogCook is false, in both rated and unrated states (the one render site)",
    );
    const gate = code.slice(code.indexOf("subtitleAction={"), code.indexOf("accessory={"));
    assert.ok(
      !gate.includes("badgeLabel"),
      "suppression is decoupled from badgeLabel — the badge is a display marker, not a capability",
    );
  });

  test("the stories suppress the control on the shared (badged) rows only", () => {
    assert.equal(
      stories.split("canLogCook: false").length - 1,
      2,
      "both shared-with-me fixture rows opt out of the log-cook control",
    );
    assert.match(stories, /badgeLabel: "Shared with you",\s+canLogCook: false,/);
  });

  test("the stories exercise the control across rated and unrated rows", () => {
    assert.match(stories, /onLogCookPress/);
    assert.match(stories, /rating: 5/);
    assert.match(stories, /rating: 4\.5/);
    assert.match(
      stories,
      /unrated rows \(Arroz con Pollo, Beef Chili\)/,
      "the fixture's unrated rows (rating omitted) render the icon-only button",
    );
  });
});

describe("recipesPageSharedConfig", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const pagesDir = join(here, "../..", "src", "pages");
  const source = readFileSync(join(pagesDir, "RecipesPage.tsx"), "utf8");
  const stories = readFileSync(join(pagesDir, "RecipesPage.stories.tsx"), "utf8");
  const index = readFileSync(join(pagesDir, "index.ts"), "utf8");

  // Strip block and line comments so documented patterns in prose
  // cannot pass the scan.
  const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

  test("SharedWithMePage is retired: no file, no stories, no export (#185)", () => {
    assert.ok(
      !existsSync(join(pagesDir, "SharedWithMePage.tsx")),
      "SharedWithMePage.tsx must not exist — RecipesPage is the single recipes browse page",
    );
    assert.ok(
      !existsSync(join(pagesDir, "SharedWithMePage.stories.tsx")),
      "SharedWithMePage.stories.tsx must not exist — shared-with-me lives in RecipesPage.stories.tsx",
    );
    assert.ok(
      !index.includes("SharedWithMePage"),
      "src/pages/index.ts must not export SharedWithMePage (#185)",
    );
  });

  test("there is no shared section: the row model is own + discovery only (#415)", () => {
    assert.ok(
      !code.includes('"shared'),
      "the row model must not grow a shared row kind — shared items are own-section items with a badge",
    );
    assert.ok(
      !stories.includes("SharedRecipesPageDemo"),
      "the #185 shared-configuration demo is retired — one demo drives the unified page",
    );
    for (const retired of ["SharedDefault", "SharedFiltered", "SharedEmpty", "SharedLoading"]) {
      assert.ok(
        !new RegExp(String.raw`export const ${retired}\b`).test(stories),
        `the ${retired} story belonged to the retired shared configuration and must not return`,
      );
    }
  });

  test("shared items are own-section items carrying the caller-supplied badge", () => {
    assert.match(
      code,
      /badgeLabel\?: string;/,
      "RecipesPageItem must declare the caller-supplied badgeLabel shared items carry",
    );
    assert.match(
      code,
      /badgeLabel=\{item\.badgeLabel\}/,
      "own rows must pass the item's badge through to the row",
    );
    const badged = (stories.match(/badgeLabel: "Shared with you"/g) ?? []).length;
    assert.ok(
      badged >= 2,
      `the stories must mark at least two own items as shared — found ${badged}`,
    );
  });

  test("the own empty state is per-host copy props with the Recipes default unchanged", () => {
    assert.match(code, /ownEmptyTitle\?: string;/, "RecipesPageProps must declare ownEmptyTitle");
    assert.match(code, /ownEmptyBody\?: string;/, "RecipesPageProps must declare ownEmptyBody");
    assert.match(
      code,
      /ownEmptyTitle = "No recipes found\."/,
      'the default own empty title must stay the Recipes screen\'s "No recipes found."',
    );
    assert.match(
      code,
      /title=\{ownEmptyTitle\}/,
      "the own empty row must render the ownEmptyTitle prop, not a hardcoded title",
    );
  });

  test("every story item carries its href — shared rows navigate by permalink (#248)", () => {
    assert.ok(
      !code.includes("onRecipePress"),
      "RecipesPage must not declare a row press callback at all (#248)",
    );
    const hrefCount =
      (stories.match(/href: "\/recipes\//g) ?? []).length +
      (stories.match(/href: "\/recipe\//g) ?? []).length;
    assert.ok(
      hrefCount >= 12,
      `every story item (own + discovery) must carry its href — found ${hrefCount}`,
    );
  });
});

describe("recipesPageUnified", () => {
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
  const mediaRow = code.slice(
    code.indexOf("const textBlockStyle"),
    code.indexOf("const STAR_STEPS"),
  );

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
    assert.ok(
      !/^\s+emptyTitle\?: string;/m.test(code),
      "the old `emptyTitle` prop must not return",
    );
  });

  test("the discovery section is host-optional (#512): omitted props produce no discovery rows and inert pagination", () => {
    // Presence is keyed off discoveryRecipes being supplied.
    assert.match(code, /const hasDiscovery = discoveryRecipes !== undefined;/);
    // Every discovery row is built only inside the presence guard.
    const guardAt = code.indexOf("if (discoveryRecipes !== undefined) {");
    const headingAt = code.indexOf(
      'rows.push({ kind: "discoveryHeading", title: discoveryTitle });',
    );
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
    assert.match(
      code,
      /if \(discoveryTitle\) \{\s*rows\.push\(\{ kind: "discoveryHeading", title: discoveryTitle \}\);/,
    );
    // Pagination stays inert when the section is absent.
    assert.match(
      code,
      /itemCount: discoveryRecipes !== undefined \? discoveryRecipes\.length : 0,/,
    );
    assert.match(
      code,
      /hasDiscovery && !loadingOwn && !loadingDiscovery && !discoveryErrorMessage/,
    );
    // The OwnOnly story proves the omission path: it passes no discovery props.
    assert.match(
      stories,
      /export const OwnOnly: Story = \{\s*\/\/[^\n]*\n(?:\s*\/\/[^\n]*\n)*\s*render: \(\) => <RecipesPageDemo omitDiscovery \/>/,
    );
  });

  test("one row sequence: the own section precedes the discovery section in the one list", () => {
    assert.match(code, /const rows: RecipesPageRow\[\] = \[\{ kind: "ownHeading" \}\];/);
    const ownAt = code.indexOf('rows.push({ kind: "ownRecipe", item });');
    const discoveryHeadingAt = code.indexOf(
      'rows.push({ kind: "discoveryHeading", title: discoveryTitle });',
    );
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
    assert.match(code, /<SectionHeading>\{row\.title\}<\/SectionHeading>/);
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
    assert.match(
      code,
      /title=\{ownEmptyTitle\}/,
      "the own empty row carries the caller's own copy",
    );
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
});
