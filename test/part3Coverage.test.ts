import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

/**
 * Contract tests for #438 Part 3 (page/frame coverage for the
 * audited widget uses): the Part 0 audit dispositioned 18
 * widget specifiers COVERAGE — hosts imported them directly
 * because no page or view composed the surface. Part 3
 * composes those surfaces in the design system:
 *
 * - 11 new views (src/views, internal — never root-exported)
 *   carrying the profile sections, the recipe sharing /
 *   comments sections, the confirmation dialog, the two
 *   banners, and the cooking ingredients panel;
 * - 5 new pages (CookingModePage, PayPage,
 *   ConsentPreferencesPage, AuthConfirmationPage,
 *   RouteErrorPage) on the public pages surface;
 * - additive data props on RecipeDetailPage (sharing /
 *   comments sections + three confirmation dialogs),
 *   ProfilePage (four typed sections), ImportImagePage (the
 *   import-anyway intent), and RecipesPage (own-section
 *   load-more rows);
 * - StepOverlay's accessory slot, which places the cooking
 *   ingredients panel between the step label and the body.
 *
 * Source-scan style, like the other contract tests.
 */

const read = (rel: string) => readFileSync(rel, "utf8");

const NEW_VIEWS = [
  "AccountDataView",
  "ConfirmActionView",
  "ConsentBannerView",
  "FeedbackPreferenceView",
  "InstallBannerView",
  "RecipeCommentsView",
  "RecipeExportPickerView",
  "RecipeSharingView",
  "ScaledIngredientsView",
  "SubscriptionView",
  "TransferRecipesView",
] as const;

const NEW_PAGES = [
  "AuthConfirmationPage",
  "ConsentPreferencesPage",
  "CookingModePage",
  "PayPage",
  "RouteErrorPage",
] as const;

test("Part 3 views are exported from the views barrel and stay off the public surface", () => {
  const viewsBarrel = read("src/views/index.ts");
  const pagesBarrel = read("src/pages/index.ts");
  const root = read("src/index.ts");
  for (const name of NEW_VIEWS) {
    assert.match(
      viewsBarrel,
      new RegExp(`export \\{[^}]*\\b${name}\\b[^}]*\\} from "\\./${name}\\.js"`),
      `${name} is exported from src/views/index.ts`,
    );
    assert.equal(existsSync(`src/views/${name}.tsx`), true, `${name}.tsx exists`);
    assert.equal(existsSync(`src/views/${name}.stories.tsx`), true, `${name} has stories`);
    assert.doesNotMatch(pagesBarrel, new RegExp(`\\b${name}\\b`), `${name} is not a page export`);
    assert.doesNotMatch(root, new RegExp(`\\b${name}\\b`), `${name} is not root-exported`);
  }
});

test("Part 3 pages are exported from the pages barrel, with stories", () => {
  const pagesBarrel = read("src/pages/index.ts");
  for (const name of NEW_PAGES) {
    assert.match(
      pagesBarrel,
      new RegExp(`export \\{[^}]*\\b${name}\\b[^}]*\\} from "\\./${name}\\.js"`),
      `${name} is exported from src/pages/index.ts`,
    );
    assert.equal(existsSync(`src/pages/${name}.tsx`), true, `${name}.tsx exists`);
    assert.equal(existsSync(`src/pages/${name}.stories.tsx`), true, `${name} has stories`);
  }
});

test("RecipeDetailPage renders the sharing / comments views and the confirmation dialogs from data props", () => {
  const source = read("src/pages/RecipeDetailPage.tsx");
  assert.match(source, /sharing\?: RecipeDetailPageSharing \| null/);
  assert.match(source, /comments\?: RecipeDetailPageComments \| null/);
  assert.match(source, /<RecipeSharingView \{\.\.\.sharing\} \/>/);
  assert.match(source, /<RecipeCommentsView \{\.\.\.commentsData\} \/>/);
  // The render slots remain as the fallback for unmigrated hosts.
  assert.match(source, /renderSharingControls\?: \(\) => ReactNode/);
  assert.match(source, /renderComments\?: \(\) => ReactNode/);
  assert.match(source, /recipeDeleteConfirmation\?: RecipeDetailPageConfirmation \| null/);
  assert.match(source, /cookLogDeleteConfirmation\?: RecipeDetailPageConfirmation \| null/);
  assert.match(source, /nutritionNotice\?: RecipeDetailPageConfirmation \| null/);
  assert.match(source, /<ConfirmActionView \{\.\.\.props\.recipeDeleteConfirmation\} \/>/);
  assert.match(source, /<ConfirmActionView \{\.\.\.props\.cookLogDeleteConfirmation\} \/>/);
  assert.match(source, /<ConfirmActionView \{\.\.\.props\.nutritionNotice\} \/>/);
});

test("ProfilePage renders its four covered sections from typed data props", () => {
  const source = read("src/pages/ProfilePage.tsx");
  assert.match(source, /subscription\?: ProfilePageSubscription/);
  assert.match(source, /feedbackPreferenceSection\?: ProfilePageFeedbackPreference/);
  assert.match(source, /transfer\?: ProfilePageTransfer/);
  assert.match(source, /accountData\?: ProfilePageAccountData/);
  assert.match(source, /<SubscriptionView \{\.\.\.subscription\} \/>/);
  assert.match(source, /<FeedbackPreferenceView \{\.\.\.feedbackPreferenceSection\} \/>/);
  assert.match(source, /<TransferRecipesView \{\.\.\.transfer\} \/>/);
  assert.match(source, /<AccountDataView \{\.\.\.accountData\} \/>/);
});

test("ImportImagePage renders the import-anyway override inside the page", () => {
  const source = read("src/pages/ImportImagePage.tsx");
  assert.match(source, /onImportAnyway\?: \(\) => void/);
  assert.match(source, /Import anyway/);
});

test("RecipesPage carries the own-section load-more rows", () => {
  const source = read("src/pages/RecipesPage.tsx");
  assert.match(source, /isFetchingNextOwnPage\?: boolean/);
  assert.match(source, /ownLoadMoreErrorMessage\?: string \| null/);
  assert.match(source, /onOwnLoadMoreRetry\?: \(\) => void/);
  assert.match(source, /kind: "loadingOwnMore"/);
  assert.match(source, /kind: "ownLoadMoreError"/);
});

test("CookingModePage composes StepOverlay with the ingredients accessory; StepOverlay renders it before the body", () => {
  const page = read("src/pages/CookingModePage.tsx");
  assert.match(page, /<StepOverlay/);
  assert.match(page, /accessory=\{/);
  assert.match(page, /<ScaledIngredientsView/);
  assert.match(page, /<StepDots/);
  assert.match(page, /<PrevNextNav/);
  const overlay = read("src/components/StepOverlay.tsx");
  assert.match(overlay, /accessory\?: ReactNode/);
  const accessoryAt = overlay.indexOf("{accessory ?");
  const bodyAt = overlay.indexOf('fontSize={tokens.typography.fontSize["2xl"]}');
  assert.ok(accessoryAt >= 0 && bodyAt > accessoryAt, "the accessory renders above the body");
});

test("ConfirmActionView locks dismissal while pending", () => {
  const source = read("src/views/ConfirmActionView.tsx");
  assert.match(source, /if \(!next && pending\)/);
  assert.match(source, /confirmTone = "danger"/);
});
