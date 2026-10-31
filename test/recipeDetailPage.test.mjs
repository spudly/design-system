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
 *    LoadingGate, before (and instead of) the chrome — the app
 *    screen's gate replaces the whole screen, and it has no
 *    distinct not-found state to model.
 * 3. The chrome is pinned: status badge + version picker toolbar
 *    renders above the single ScrollRegion, and every section
 *    renders inside it (#71 — a section that scrolled its own
 *    chrome away would break the version context). The version
 *    picker is the standard SelectField (#72) with the contract
 *    the custom sheet widget had.
 * 4. The sections render in the order the tabs had (overview,
 *    ingredients, instructions, cook history, nutrition), each
 *    section panel opening with its own heading carrying the
 *    tab's label (the canonical SectionHeading carries no
 *    padding, so the heading renders inside its panel, whose
 *    inset it takes); the tab state is gone from the contract.
 *    The scale option set moved with the page as a DS-owned
 *    constant with the app's keys and labels.
 * 5. The three render slots sit at the positions the app panels
 *    occupy today: the cook-log form replaces the "Log a cook"
 *    button while it renders content; sharing renders after the
 *    lifecycle section and before the tags; comments render in
 *    the overview panel after the ratings card.
 * 6. Optional content is omitted cleanly: no image, description,
 *    prep/cook stats, edit actions, lifecycle section,
 *    substitutions panel, or ratings card appears unless its
 *    data/callback is provided (no placeholder shells).
 * 7. No explicit lineHeight anywhere (the #162 rule).
 * 8. Stories exercise the states and the cook-log form slot, so
 *    Chromatic captures them.
 * 9. The print/share buttons render the icons module's PrintIcon /
 *    ShareIcon (#187) through Button's icon slot — no emoji
 *    or text glyphs, no hand-drawn glyph components.
 *
 * The #119 de-styling pass (recipes-detail tranche) rebuilt the
 * page as a composition of design-system components; invariants
 * about a widget's internals moved with the widget into its own
 * contract test (the Activate conditional to candidateList, the
 * nutrition union to nutritionPanel, the tag Badge form to
 * tagList, the preset-or-custom scale selector to
 * pageWebAria's PresetValueSelector pins). The pins below hold
 * the page-level contract: composition, ordering, slots, and
 * pass-throughs.
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
    /<LoadingGate label="Loading recipe" \/>/,
    "the loading shell renders the DS LoadingGate (whose spinner carries the label)",
  );
});

test("the chrome is pinned above a single scroll region", () => {
  const toolbarAt = code.indexOf("<VersionPicker");
  const scrollAt = code.indexOf("<ScrollRegion>");
  assert.ok(
    scrollAt !== -1,
    "the sections render in the ScrollRegion (its contract persists handled taps — slotted forms keep their presses)",
  );
  assert.ok(toolbarAt !== -1, "the toolbar must render the version picker");
  assert.ok(scrollAt > toolbarAt, "the scroll region renders below the pinned chrome");
  assert.equal(
    code.split("<ScrollRegion").length - 1,
    1,
    "exactly one ScrollRegion: the section scroll (the version picker is a SelectField since #72 — its sheet scroll lives in that component)",
  );
  const panelAt = code.indexOf("<OverviewPanel");
  assert.ok(panelAt > scrollAt, "the sections render inside the scroll region");
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
  // First-occurrence order pins both orderings at once: the
  // panels render in tab order in the page body, and each
  // section's heading sits inside its own panel (the canonical
  // SectionHeading carries no padding of its own, so it renders
  // inside the PanelStack whose inset it takes — the panel
  // definitions precede the page body, and Nutrition's section
  // stack is composed in the body, its heading before the panel).
  const sequence = [
    "<SectionHeading>Ingredients</SectionHeading>",
    "<SectionHeading>Instructions</SectionHeading>",
    "<SectionHeading>Cook History</SectionHeading>",
    "<OverviewPanel",
    "<IngredientsPanel",
    "<InstructionsPanel",
    "<HistoryPanel",
    "<SectionHeading>Nutrition</SectionHeading>",
    "<NutritionPanel",
  ];
  let lastAt = -1;
  for (const marker of sequence) {
    const at = code.indexOf(marker);
    assert.ok(at > lastAt, `${marker} must render after the previous marker`);
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
  assert.match(code, /history\.onDeleteCookLogPress\s*\?\s*\{\s*onDeletePress:/);
  assert.match(code, /history\.onDeleteCookLogPress\?\.\(log\.id\)/);
  assert.match(storiesCode, /onDeleteCookLogPress: \(\) => undefined/);
  // Each entry's Delete button needs an entry-specific accessible name
  // (position + date) — otherwise screen-reader button lists show
  // several identical "Delete" entries. The name is composed here
  // and crosses into LogEntryCard as its deleteAccessibilityLabel.
  assert.match(code, /history\.cookLogs\.map\(\(log, index\) =>/);
  assert.match(
    code,
    /deleteAccessibilityLabel: `Delete cook log \$\{index \+ 1\} from \$\{log\.dateLabel\}`/,
  );
});

test("the sharing slot renders after the lifecycle section and before the tags", () => {
  const lifecycleAt = code.indexOf("<LifecycleSection");
  const sharingAt = code.indexOf("{sharingControls}");
  const tagsAt = code.indexOf("<TagList");
  assert.ok(lifecycleAt !== -1, "the lifecycle section renders in the overview");
  assert.ok(sharingAt > lifecycleAt, "sharing renders after the lifecycle section");
  assert.ok(tagsAt > sharingAt, "the tags render after the sharing slot");
  assert.match(
    code,
    /const sharingControls = renderSharingControls \? renderSharingControls\(\) : null;/,
    "the sharing slot is called once per render, only when provided",
  );
});

test("the comments slot renders in the overview panel after the ratings card", () => {
  const ratingsAt = code.indexOf("<RatingsCard");
  const commentsAt = code.indexOf("{comments}", ratingsAt);
  assert.ok(ratingsAt !== -1, "the ratings card renders in the overview panel");
  assert.ok(commentsAt > ratingsAt, "comments render after the ratings card");
});

test("optional content is omitted cleanly, never rendered as a shell", () => {
  assert.match(code, /\{imageUrl \? <Thumbnail/, "the hero image renders only with an imageUrl");
  assert.match(code, /\{description \? <Text variant="body">/, "description renders when present");
  assert.match(code, /\{prepTimeLabel \? <StatCard label="Prep"/, "Prep stat needs a prep time");
  assert.match(code, /\{cookTimeLabel \? <StatCard label="Cook"/, "Cook stat needs a cook time");
  assert.match(code, /\{editHref \? \(\s*<Button[^>]*href=\{editHref\}/, "Edit is href-gated");
  assert.match(code, /\{editDraftHref \? \(\s*<Button[^>]*href=\{editDraftHref\}/, "Edit draft");
  assert.match(
    code,
    /lifecycle\.isEditable \|\| lifecycle\.candidates\.length > 0/,
    "the lifecycle section renders only when editable or candidates exist",
  );
  assert.match(
    code,
    /onActivateCandidatePress\s*\?\s*\{ onActivatePress: onActivateCandidatePress \}/,
    "the page passes the activation callback into CandidateList only when provided (the Activate conditional itself is pinned in candidateList.test.mjs)",
  );
  assert.match(
    code,
    /view\.substitutions && view\.substitutions\.length > 0/,
    "the substitutions panel renders only with substitutions",
  );
  assert.match(code, /\{tags\.length > 0 \? <TagList/, "the tag row renders only with tags");
});

test("the create-a-draft action is an exempt callback, offered only with no existing draft (#357)", () => {
  // No existing draft = nothing to link to: the host CREATEs the draft (mutation), then navigates — Stephen's #248 ruling (1) exempts it, like onTweakManuallyPress; deliberately no createDraftHref.
  assert.match(code, /onCreateDraftPress\?: \(\) => void;/);
  assert.doesNotMatch(code, /createDraftHref/); // no href form for a draft that does not exist yet
  assert.match(
    code,
    /editDraftHref \? \([\s\S]*?href=\{editDraftHref\}[\s\S]*?: onCreateDraftPress \? \(\s*<Button[^>]*onPress=\{onCreateDraftPress\}/,
  );
  assert.match(storiesCode, /onCreateDraftPress: \(\) => undefined/);
});

test("the tweak controls split on the #248 ruling: AI is a link, manual is an exempt callback", () => {
  // Pure navigation remodels to the href form ("Tweak with AI");
  // Stephen's #248 ruling (2026-10-29) EXEMPTS "Tweak manually":
  // its primary job is the mutation (create the draft, then open
  // the editor), so it stays a callback and the host does not
  // pre-create drafts.
  assert.match(code, /tweakAiHref\?: string;/);
  assert.match(code, /href=\{tweakAiHref\}/);
  assert.match(code, /onTweakManuallyPress\?: \(\) => void;/);
  assert.match(code, /onPress=\{onTweakManuallyPress\}/);
  assert.doesNotMatch(code, /tweakManuallyHref/);
});

test("tags render through TagList (Badge's color form lives inside it, #211)", () => {
  assert.match(code, /<TagList tags=\{tags\} \/>/, "tags render as a TagList of the page's tags");
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
  // The union lives with NutritionPanel (the extracted widget);
  // the page's contract name aliases it, so the app's contract
  // is unchanged. The union's members and the state branch are
  // pinned here against the component's source.
  const panelFile = join(here, "..", "src", "components", "NutritionPanel.tsx");
  const nutritionPanel = readFileSync(panelFile, "utf8");
  assert.match(code, /RecipeDetailPageNutritionProps = NutritionPanelData;/);
  assert.match(nutritionPanel, /state: "unavailable";/, "unavailable is a union member");
  assert.match(nutritionPanel, /state: "ready";/, "ready is a union member");
  assert.match(nutritionPanel, /nutrition\.state === "unavailable"/, "branches on state");
});

test("no explicit lineHeight anywhere in the file (#162)", () => {
  assert.ok(!code.includes("lineHeight"), "the view must not set lineHeight on any text or glyph");
});

test("stories exercise the states and the cook-log form slot", () => {
  for (const name of [
    "Default",
    "Minimal",
    "CreateDraft",
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
    assert.match(code, new RegExp(String.raw`icon=\{${name}\}`), "the button's icon slot");
  }
  assert.ok(!code.includes("🖨") && !code.includes("↗"), "no emoji/text glyph button labels");
  assert.ok(!code.includes("PrinterGlyph") && !code.includes("ShareGlyph"), "no hand-drawn glyphs");
});
