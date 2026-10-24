/**
 * Contract test for MemorizeReviewPage (spudly/design-system#49).
 *
 * MemorizeReviewPage is the design-system port of the Memorize
 * app's Review screen (ReviewScreen in spudly/memorize
 * packages/app), and its structure is the contract this test
 * guards in source:
 * 1. The naming audit: the #49 inventory calls this item
 *    "Progress", after the #44 demo of that name — but the app
 *    has no progress screen and no aggregate stats anywhere
 *    (no mastered counts, no streaks, no drill accuracy, no
 *    per-passage percents; its data model carries none of
 *    those). The component ports the real Review screen and
 *    is named for it; the demo's invented dashboard UI
 *    (StatCard, ProgressBar) is pinned absent.
 * 2. The heading carries the due count from the list itself
 *    ("Review (N due)"), and the empty list renders the bare
 *    "Review" heading over the app's nothing-due empty state,
 *    copy verbatim.
 * 3. The shell is the fixed ScreenContainer (the app's tab
 *    screens share App's non-scrolling shell) with the
 *    FlatList bounded by `flex: 1` — the #188 geometry.
 * 4. The actions are exactly the app screen's two review
 *    outcomes, as two named callbacks reporting the verse id.
 *    There is deliberately no Drill or Remove callback —
 *    those are the Verses screen's row actions — and no
 *    status badge on the rows: review cards carry none.
 * 5. No loading member: the app gates store readiness above
 *    the tab shell, so the screen has no loading state and
 *    the component renders no Spinner.
 * 6. There is no render slot: the app's rows render only DS
 *    primitives over per-verse data, so the contract is
 *    callbacks-only and the absence is pinned.
 * 7. The component is exported from the pages subpath index,
 *    and stories exercise the Default and Empty states in
 *    the Quiet Dawn theme so Chromatic captures them.
 *
 * This is a source scan, not a render test: the repo has no JS
 * renderer for these components (Chromatic screenshots in
 * CI), and the invariant is a per-literal property of the
 * source (same rationale as test/mealPlanDetailPage.test.mjs).
 * Comments are stripped before scanning so prose cannot
 * satisfy — or, for the pinned absences, accidentally trip —
 * the patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pagesDir = join(here, "..", "src", "pages");
const source = readFileSync(join(pagesDir, "MemorizeReviewPage.tsx"), "utf8");
const stories = readFileSync(join(pagesDir, "MemorizeReviewPage.stories.tsx"), "utf8");
const index = readFileSync(join(pagesDir, "index.ts"), "utf8");

// Strip block and line comments so documented patterns in prose
// cannot pass the scan.
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("MemorizeReviewPage source is readable and non-trivial", () => {
  assert.ok(code.length > 1000, "expected the full MemorizeReviewPage source");
  assert.match(code, /export function MemorizeReviewPage/);
});

test("the invented demo dashboard is absent — no stats, no percent bars", () => {
  assert.doesNotMatch(
    code,
    /StatCard|ProgressBar/,
    "the #44 Progress demo's StatCards and percent bars are invented UI — the app has neither",
  );
  assert.doesNotMatch(
    code,
    /streak|accuracy|percent/i,
    "the app's data model carries no streak, accuracy, or percent — the contract must not invent them",
  );
  assert.doesNotMatch(
    code,
    /totalMemorized|memorizedCount|dueCount/,
    "no aggregate-count props: the only count is the due list's own length, as in the app",
  );
});

test("the heading carries the due count; the empty state matches the app verbatim", () => {
  assert.match(
    code,
    /`Review \(\$\{verses\.length\} due\)`/,
    "the heading must compose the due count from the list length, as the app does",
  );
  assert.match(code, /"Review"/, "the empty branch must render the bare Review heading");
  assert.match(
    code,
    /<EmptyState title="Nothing due" body="Nice work\." \/>/,
    "the nothing-due empty state copy must match the app's verbatim",
  );
});

test("the shell is the fixed ScreenContainer with the FlatList bounded by flex: 1", () => {
  assert.match(
    code,
    /<ScreenContainer scrollable=\{false\}>/,
    "the tab screens share the app's non-scrolling shell",
  );
  assert.match(code, /<FlatList/, "the due list must be the app's FlatList");
  assert.match(
    code,
    /const listStyle = \{ flex: 1 \} as const;/,
    "the list must be bounded to the shell (#188)",
  );
  assert.match(code, /style=\{listStyle\}/, "the FlatList must carry the bounding style");
});

test("the view-model and callback contract matches the declared props", () => {
  assert.match(code, /verses: MemorizeReviewPageVerse\[\];/);
  assert.match(code, /reference: string;/);
  assert.match(code, /text: string;/);
  assert.match(code, /onRememberedPress: \(verseId: string\) => void;/);
  assert.match(code, /onForgotPress: \(verseId: string\) => void;/);
});

test("the actions are exactly the app screen's two review outcomes", () => {
  assert.match(
    code,
    />\s*I remembered it\s*<\/Button>/,
    "the primary outcome must match the app's",
  );
  assert.match(code, />\s*I forgot it\s*<\/Button>/, "the secondary outcome must match the app's");
  assert.match(code, /onRememberedPress\(item\.id\)/, "remembered must report the row's verse id");
  assert.match(code, /onForgotPress\(item\.id\)/, "forgot must report the row's verse id");
  assert.doesNotMatch(
    code,
    /onDrill|onRemove|onDelete/,
    "Drill and Remove are the Verses screen's row actions — not this screen's",
  );
  assert.doesNotMatch(
    code,
    /Badge/,
    "review cards carry no status badge in the app — the badges live on the Verses screen",
  );
});

test("there is no loading state — the app gates readiness above the tab shell", () => {
  assert.doesNotMatch(
    code,
    /Spinner|isLoading/,
    "the app screen has no loading state of its own — the union must not invent one",
  );
});

test("there is deliberately no app-content render slot", () => {
  assert.doesNotMatch(
    code,
    /render\w+\?:/,
    "a render slot must be a conscious contract change (see the header audit), not drift",
  );
  assert.doesNotMatch(
    code,
    /ReactNode/,
    "MemorizeReviewPage takes no ReactNode props — its rows are view-modeled data only",
  );
});

test("the component is exported from the pages subpath index", () => {
  assert.match(index, /MemorizeReviewPage/);
  assert.match(index, /type MemorizeReviewPageProps/);
  assert.match(index, /from "\.\/MemorizeReviewPage\.js"/);
});

test("stories exercise the default and empty states in the Quiet Dawn theme", () => {
  for (const name of ["Default", "Empty"]) {
    assert.match(
      stories,
      new RegExp(`export const ${name}`),
      `MemorizeReviewPage.stories.tsx must export a ${name} story`,
    );
  }
  assert.match(
    stories,
    /theme: "light_quietDawn"/,
    "stories must pin the Quiet Dawn theme (Memorize's brand)",
  );
});
