/**
 * Contract test for shared-with-me surfacing in RecipesPage
 * (spudly/design-system#185, reshaped by #415).
 *
 * History: SharedWithMePage — the #49 sibling port of
 * Eciperay's Shared-with-me screen — was consolidated into
 * RecipesPage in #185 as a second configuration of the same
 * component (shared-only data, its own empty copy, link-only
 * rows). The unified browse (#415) retires that configuration:
 * there is one browse page and one contract, and shared-with-me
 * lives inside it. What must survive, pinned here:
 * 1. SharedWithMePage stays gone: no component file, no stories
 *    file, and no export from src/pages/index.ts — RecipesPage
 *    is the single recipes browse page.
 * 2. Shared recipes render inside the own section (the section
 *    the caller fills with created + shared items), in the
 *    caller's order — not as a separate section, tab, or page:
 *    the page's row model has exactly two sections (own,
 *    discovery) and no shared row kind.
 * 3. A shared item is distinguishable by its caller-supplied
 *    `badgeLabel` on the item view-model, rendered as a badge
 *    on the row (the unified test pins the rendering and the
 *    accessible-name composition in detail).
 * 4. The shared screen's empty-state copy survives as caller
 *    data: the own section's empty copy is per-host props
 *    (`ownEmptyTitle` / `ownEmptyBody`) whose defaults are the
 *    Recipes screen's ("No recipes found.", no body) — a host
 *    showing a shared-only list can still pass the app's
 *    shared-with-me message verbatim through them.
 * 5. The stories exercise shared items the way the unified
 *    page presents them: badged rows inside Default's own
 *    section, carrying their permalink hrefs.
 *
 * This is a source scan, not a render test, for the same reason
 * as test/recipesPageBoundedList.test.ts: the failures it
 * guards happen in native layout, which no JS renderer in this
 * repo performs, and the invariant is a per-literal property of
 * the source. Comments are stripped before scanning so prose
 * cannot satisfy the patterns.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
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
