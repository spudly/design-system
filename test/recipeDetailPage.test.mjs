/**
 * Contract test for RecipeDetailPage (spudly/design-system#49,
 * wave A): Eciperay's recipe detail screen as a controlled DS page
 * component, following the RecipesPage pilot.
 *
 * The invariants pinned here are the ones the Eciperay rewire will
 * depend on, and each is a per-literal property of the source:
 * 1. The component is exported from the pages subpath index, and
 *    the view imports nothing from an app package and runs no
 *    queries or mutations — business logic stays app-side.
 * 2. The loading member of the props union renders only the
 *    spinner shell, before (and instead of) the chrome — the app
 *    screen's gate replaces the whole screen, and it has no
 *    distinct not-found state to model.
 * 3. The chrome is pinned: status badge + version picker toolbar
 *    renders above the single ScrollView, and every section
 *    renders inside it (#71 — a section that scrolled its own
 *    chrome away would break the version context). The version
 *    picker is the standard SelectField (#72) with the contract
 *    the custom sheet widget had.
 * 4. The sections render in the order the tabs had (overview,
 *    ingredients, instructions, cook history, nutrition), each
 *    section after the overview under its own heading with the
 *    tab's label; the tab state is gone from the contract. The
 *    scale option set moved with the page as a DS-owned constant
 *    with the app's keys and labels.
 * 5. The three render slots sit at the positions the app panels
 *    occupy today: the cook-log form replaces the "Log a cook"
 *    button while it renders content; sharing renders after the
 *    lifecycle section and before the tags; comments render in
 *    the engagement stack after the ratings card.
 * 6. Optional content is omitted cleanly: no image, description,
 *    prep/cook stats, edit chips, lifecycle section, substitutions
 *    panel, or ratings card appears unless its data/callback is
 *    provided (no placeholder shells).
 * 7. No explicit lineHeight anywhere (the #162 rule).
 * 8. Stories exercise the states and the cook-log form slot, so
 *    Chromatic captures them.
 * 9. The print/share chips render the icons module's PrintIcon /
 *    ShareIcon (#187) — no emoji or text glyphs, no hand-drawn
 *    glyph components.
 *
 * This is a source scan, not a render test, for the same reason as
 * test/recipesPageAccessory.test.mjs: the repo has no JS
 * renderer for these components (Chromatic screenshots in CI),
 * and the invariant is a per-literal property of the source.
 * Comments are stripped before scanning so prose cannot satisfy
 * the patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pagesDir = join(here, "..", "src", "pages");
const source = readFileSync(join(pagesDir, "RecipeDetailPage.tsx"), "utf8");
const stories = readFileSync(join(pagesDir, "RecipeDetailPage.stories.tsx"), "utf8");
const index = readFileSync(join(pagesDir, "index.ts"), "utf8");

// Strip block and line comments so documented patterns in prose
// cannot pass the scan.
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
const storiesCode = stories
  .replaceAll(/\/\*[\s\S]*?\*\//g, "")
  .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("RecipeDetailPage is exported from the pages subpath", () => {
  assert.match(index, /RecipeDetailPage,/, "index.ts must export RecipeDetailPage");
  assert.match(
    index,
    /from "\.\/RecipeDetailPage\.js"/,
    "the export must come from ./RecipeDetailPage.js",
  );
  assert.match(code, /export function RecipeDetailPage/);
});

test("the view imports no app package and runs no data hooks", () => {
  assert.ok(!code.includes("@eciperay"), "the view must not import an app package");
  assert.ok(!code.includes("useQuery"), "the view must not fetch (queries stay app-side)");
  assert.ok(!code.includes("useMutation"), "the view must not mutate (mutations stay app-side)");
  assert.ok(!code.includes("@tanstack"), "no react-query in the view");
});

test("the loading state renders only the spinner shell", () => {
  assert.match(
    code,
    /export type RecipeDetailPageProps = \{ state: "loading" \} \| RecipeDetailPageReadyProps;/,
    "the props must be the loading | ready union",
  );
  const loadingAt = code.indexOf('props.state === "loading"');
  const chromeAt = code.indexOf("<VersionPicker");
  assert.ok(loadingAt !== -1, "the component must branch on the loading state");
  assert.ok(loadingAt < chromeAt, "the loading branch must come before the chrome render");
  assert.match(
    code,
    /<Spinner label="Loading recipe" \/>/,
    "the loading shell renders the DS Spinner",
  );
});

test("the chrome is pinned above a single scroll view", () => {
  const toolbarAt = code.indexOf("<VersionPicker");
  const scrollAt = code.indexOf('<ScrollView flex={1} keyboardShouldPersistTaps="handled">');
  assert.ok(
    scrollAt !== -1,
    "the section ScrollView must persist handled taps (slotted forms keep their presses)",
  );
  assert.ok(toolbarAt !== -1, "the toolbar must render the version picker");
  assert.ok(scrollAt > toolbarAt, "the scroll view renders below the pinned chrome");
  assert.equal(
    code.split("<ScrollView").length - 1,
    1,
    "exactly one ScrollView: the section scroll (the version picker is a SelectField since #72 — its sheet scroll lives in that component)",
  );
  const panelAt = code.indexOf("<OverviewPanel");
  assert.ok(panelAt > scrollAt, "the sections render inside the scroll view");
});

test("there are no tabs: every section renders in one scroll, in tab order, under its heading (#71)", () => {
  assert.ok(!code.includes("<Tabs"), "the page must not render a tab bar");
  assert.ok(!code.includes("activeTab"), "the tab state left the contract");
  assert.ok(!code.includes("onTabChange"), "the tab-change callback left the contract");
  assert.ok(
    !code.includes("RecipeDetailPageTab"),
    "the tab type left the contract (and the pages index must not export it)",
  );
  assert.ok(
    !index.includes("RecipeDetailPageTab"),
    "the pages index must not export the removed tab type",
  );
  const sequence = [
    "<OverviewPanel",
    "<SectionHeading>Ingredients</SectionHeading>",
    "<IngredientsPanel",
    "<SectionHeading>Instructions</SectionHeading>",
    "<InstructionsPanel",
    "<SectionHeading>Cook History</SectionHeading>",
    "<HistoryPanel",
    "<SectionHeading>Nutrition</SectionHeading>",
    "<NutritionPanel",
  ];
  let lastAt = -1;
  for (const marker of sequence) {
    const at = code.indexOf(marker);
    assert.ok(
      at > lastAt,
      `sections must render in tab order: ${marker} after the previous section`,
    );
    lastAt = at;
  }
});

test("the version picker is the standard SelectField with the same data contract (#72)", () => {
  assert.match(
    code,
    /<SelectField\s+label="Version"/,
    "the version picker must render the DS SelectField, labeled Version",
  );
  assert.match(
    code,
    /options=\{sorted\.map\(\(version\) => \(\{ value: version\.id, label: version\.label \}\)\)\}/,
    "the options are the versions in the picker's sorted order, id as value and app label as label",
  );
  assert.match(
    code,
    /value=\{selected\?\.id \?\? ""\}/,
    "the field's value is the selected version (with the sorted-first fallback above it)",
  );
  assert.match(
    code,
    /onValueChange=\{onSelectVersion\}/,
    "selection changes flow out through the unchanged onSelectVersion callback",
  );
  assert.ok(!code.includes("<Modal"), "the custom bottom-sheet widget is gone");
  assert.ok(
    !code.includes("version-picker-backdrop"),
    "the custom sheet's backdrop testID is gone with it",
  );
  assert.match(
    code,
    /Version \{sorted\[0\]\?\.versionNumber \?\? 1\}/,
    "the single-version case still collapses to static version text",
  );
});

test("the status badge map covers the four statuses with a fallback", () => {
  for (const [status, tone] of [
    ["idea", "neutral"],
    ["evolving", "info"],
    ["perfected", "success"],
    ["abandoned", "danger"],
  ]) {
    assert.ok(
      code.includes(`${status}: { label:`) && code.includes(`tone: "${tone}"`),
      `STATUS_BADGES must map ${status} to the ${tone} tone`,
    );
  }
  assert.match(
    code,
    /STATUS_BADGES\[status\] \?\? STATUS_BADGES\.idea/,
    "unknown statuses fall back to idea, as the app's normalizer does",
  );
});

test("the cook-log form slot replaces the Log a cook button while it renders content", () => {
  assert.match(code, /renderCookLogForm\?: \(\) => ReactNode;/);
  assert.match(
    code,
    /const form = history\.renderCookLogForm \? history\.renderCookLogForm\(\) : null;/,
    "the slot is called once per render and its result decides the button swap",
  );
  assert.match(code, /form !== null && form !== undefined \?/);
  const formBranchAt = code.indexOf("form !== null && form !== undefined");
  const buttonAt = code.indexOf("Log a cook", formBranchAt);
  assert.ok(buttonAt > formBranchAt, "the Log a cook button is the else-branch of the form slot");
  // #266: entries also carry an optional Delete action — the history
  // props declare the callback, the button renders only with it,
  // pressing reports the entry id, and a story passes it.
  assert.match(code, /onDeleteCookLogPress\?: \(cookLogId: string\) => void;/);
  assert.match(code, /history\.onDeleteCookLogPress \?/);
  assert.match(code, /history\.onDeleteCookLogPress\?\.\(log\.id\)/);
  assert.match(storiesCode, /onDeleteCookLogPress: \(\) => undefined/);
  // Each entry's Delete button needs an entry-specific accessible name
  // (position + date) — otherwise screen-reader button lists show
  // several identical "Delete" entries.
  assert.match(code, /history\.cookLogs\.map\(\(log, index\) =>/);
  assert.match(
    code,
    /accessibilityLabel=\{`Delete cook log \$\{index \+ 1\} from \$\{log\.dateLabel\}`\}/,
  );
});

test("the sharing slot renders after the lifecycle section and before the tags", () => {
  const lifecycleAt = code.indexOf("<LifecycleSection");
  const sharingAt = code.indexOf("{sharingControls}");
  const tagsAt = code.indexOf("tags.map");
  assert.ok(lifecycleAt !== -1, "the lifecycle section renders in the overview");
  assert.ok(sharingAt > lifecycleAt, "sharing renders after the lifecycle section");
  assert.ok(tagsAt > sharingAt, "the tags render after the sharing slot");
  assert.match(
    code,
    /const sharingControls = renderSharingControls \? renderSharingControls\(\) : null;/,
    "the sharing slot is called once per render, only when provided",
  );
});

test("the comments slot renders in the engagement stack after the ratings card", () => {
  const ratingsAt = code.indexOf("<RatingsCard");
  const commentsAt = code.indexOf("{comments}", ratingsAt);
  assert.ok(ratingsAt !== -1, "the ratings card renders in the engagement stack");
  assert.ok(commentsAt > ratingsAt, "comments render after the ratings card");
});

test("optional content is omitted cleanly, never rendered as a shell", () => {
  assert.match(code, /\{imageUrl \? \(/, "the hero image renders only with an imageUrl");
  assert.match(code, /\{description \? \(/, "the description renders only when present");
  assert.match(
    code,
    /\{prepTimeLabel \? <StatCard label="Prep"/,
    "the Prep stat renders only with a prep time",
  );
  assert.match(
    code,
    /\{cookTimeLabel \? <StatCard label="Cook"/,
    "the Cook stat renders only with a cook time",
  );
  assert.match(code, /\{onEditPress \? \(/, "the Edit chip renders only with its callback");
  assert.match(
    code,
    /\{onEditDraftPress \? \(/,
    "the Edit draft chip renders only with its callback",
  );
  assert.match(
    code,
    /lifecycle\.isEditable \|\| lifecycle\.candidates\.length > 0/,
    "the lifecycle section renders only when editable or candidates exist",
  );
  assert.match(
    code,
    /\{onActivateCandidatePress \? \(/,
    "the Activate button renders only with its callback (candidate data alone exposes no dead action)",
  );
  assert.match(
    code,
    /view\.substitutions && view\.substitutions\.length > 0/,
    "the substitutions panel renders only with substitutions",
  );
  assert.match(code, /\{tags\.length > 0 \? \(/, "the tag row renders only with tags");
});

test("tags render through Badge's color form, not an inline pill (#211)", () => {
  assert.match(code, /<Badge key=\{tag\.id\} color=\{tag\.color\}>/, "tags render as Badge");
  assert.ok(!code.includes("{tag.color}22"), "the page must not re-implement the tag tint inline");
});

test("the scale option set moved with the ingredients section", () => {
  for (const [value, label] of [
    ["0.5", "½×"],
    ["1", "1×"],
    ["2", "2×"],
    ["3", "3×"],
  ]) {
    assert.ok(
      code.includes(`{ value: "${value}", label: "${label}" }`),
      `SCALE_OPTIONS must include ${value} / ${label}`,
    );
  }
  assert.match(
    code,
    /<NumberStepper\s+label="Servings"\s+layout="inline"\s+value=\{view\.servings\}\s+min=\{1\}/,
    "the servings stepper mirrors the app's (label Servings, floor of 1) in the inline #73 layout",
  );
});

test("nutrition models its three states as a union", () => {
  assert.match(code, /state: "unavailable";/, "unavailable is a union member");
  assert.match(code, /state: "ready";/, "ready is a union member");
  assert.match(
    code,
    /nutrition\.state === "unavailable"/,
    "the panel branches on the nutrition state",
  );
});

test("no explicit lineHeight anywhere in the file (#162)", () => {
  assert.ok(!code.includes("lineHeight"), "the view must not set lineHeight on any text or glyph");
});

test("stories exercise the states and the cook-log form slot", () => {
  for (const name of [
    "Default",
    "Minimal",
    "Loading",
    "Ingredients",
    "Instructions",
    "CookHistory",
    "CookLogFormOpen",
    "Nutrition",
  ]) {
    assert.match(
      storiesCode,
      new RegExp(`export const ${name}: Story`),
      `RecipeDetailPage.stories.tsx must export a ${name} story`,
    );
  }
  assert.match(
    storiesCode,
    /renderCookLogForm: \(\) =>/,
    "a story must pass the cook-log form slot with stand-in content",
  );
  assert.match(
    storiesCode,
    /renderSharingControls: \(\) =>/,
    "a story must pass the sharing slot with stand-in content",
  );
  assert.match(
    storiesCode,
    /<RecipeDetailPage state="loading" \/>/,
    "the Loading story must render the loading props member",
  );
});

test("print/share render the icons module's Feather icons, not text glyphs (#187)", () => {
  for (const name of ["PrintIcon", "ShareIcon"]) {
    assert.match(code, new RegExp(String.raw`import \{ ${name} \} from "\.\./icons/${name}\.js";`));
    assert.match(code, new RegExp(String.raw`<${name} color=\{tokens\.colors\.gray\.gray8\} />`));
  }
  assert.ok(!code.includes("🖨") && !code.includes("↗"), "no emoji/text glyph button labels");
  assert.ok(!code.includes("PrinterGlyph") && !code.includes("ShareGlyph"), "no hand-drawn glyphs");
});
