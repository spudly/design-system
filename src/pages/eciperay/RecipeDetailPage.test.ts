/* eslint-disable max-lines -- one test suite per module; its cases share fixtures and helpers and read as a single spec (#902 T4) */
/**
 * Contract test for RecipeDetailPage (spudly/design-system#49,
 * wave A): Eciperay's recipe detail screen as a controlled DS page
 * component, following the RecipesPage pilot.
 *
 * The invariants pinned here are the ones the Eciperay rewire will
 * depend on, and each is a per-literal property of the source:
 * 1. The component is exported from the pages barrel index, and
 *    the view imports nothing from an app package and runs no
 *    queries or mutations — business logic stays app-side.
 * 2. The loading member of the props union renders only the
 *    a centered Spinner (Center + Spinner), before (and instead of) the chrome — the app
 *    screen's gate replaces the whole screen, and it has no
 *    distinct not-found state to model.
 * 3. Every section renders inside the single ScrollRegion; the
 *    status badge + version picker bar renders below Start
 *    Cooking in the details panel (#721 fidelity round — Stephen's
 *    ruling that anything not in the visual direction image moves
 *    below Start Cooking, superseding the #71 pinned chrome). The
 *    version picker is the standard SelectField (#72) with the
 *    contract the custom sheet widget had.
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
 * 9. The print/share buttons name the icons module's "print" /
 *    "share" glyphs (#187; by name since #438 Part 4) through
 *    Button's icon slot — no emoji or text glyphs, no hand-drawn
 *    glyph components, no icon component crossing the slot.
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
 * #757 merged PublicRecipePage into this page: the props union
 * gained the public surface's notFound/unavailable members, and
 * the ready member split into owner and guest forms on the
 * `viewer` discriminator. The retired page's contract test was
 * deleted with it; its page-level invariants (error states and
 * copy, the CTA bar, the guest scroll sequence, the shared-shape
 * aliases, the shared-component treatments) are ported to the
 * guest-mode block at the bottom of this file.
 *
 * This is a source scan, not a render test, for the same reason as
 * the recipesPageAccessory block in src/pages/eciperay/RecipesPage.test.ts: the repo has no JS
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
const pagesDir = join(here, "../../..", "src", "pages");
const source = readFileSync(join(pagesDir, "eciperay", "RecipeDetailPage.tsx"), "utf8");
const stories = readFileSync(join(pagesDir, "eciperay", "RecipeDetailPage.stories.tsx"), "utf8");
const index = readFileSync(join(pagesDir, "index.ts"), "utf8");

// Strip block and line comments so documented patterns in prose
// cannot pass the scan.
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
const statusBadgesCode = readFileSync(join(pagesDir, "shared", "recipeStatusBadges.ts"), "utf8")
  .replaceAll(/\/\*[\s\S]*?\*\//g, "")
  .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
const storiesCode = stories
  .replaceAll(/\/\*[\s\S]*?\*\//g, "")
  .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("RecipeDetailPage is exported from the pages barrel", () => {
  assert.match(index, /RecipeDetailPage,/, "index.ts must export RecipeDetailPage");
  assert.match(
    index,
    /from "\.\/eciperay\/RecipeDetailPage\.js"/,
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

test("the fixed-shell frame is inlined with its platform split (#547, #741)", () => {
  // #741 inlined the retired ScreenShell into this page (its
  // only page consumer): the loading and owner forms render
  // through the page-local frame, which carries the #547 split
  // — the web branch grows only, the native branch keeps
  // flex: 1's grow/shrink translation, both surface-painted.
  assert.match(code, /function RecipeDetailFrame/);
  assert.match(code, /<Col grow backgroundColor="\$surface">/);
  assert.match(code, /<Col grow shrink backgroundColor="\$surface">/);
  assert.ok(!code.includes("ScreenShell"), "the retired ScreenShell widget stays retired");
  assert.equal(
    code.split("<RecipeDetailFrame>").length - 1,
    2,
    "the frame wraps exactly the loading and owner compositions",
  );
});

test("the loading state renders only the spinner shell", () => {
  assert.match(
    code,
    /export type RecipeDetailPageProps =\s*\| \{ state: "loading"; footer\?: BigFooterData \}\s*\| \{ state: "notFound"; footer\?: BigFooterData \}\s*\| \{ state: "unavailable"; footer\?: BigFooterData \}\s*\| RecipeDetailPageReadyProps;/,
    "the props must be the loading | notFound | unavailable | ready union (#757)",
  );
  const loadingAt = code.indexOf('props.state === "loading"');
  const chromeAt = code.indexOf("<DetailsPanel");
  assert.ok(loadingAt !== -1, "the component must branch on the loading state");
  assert.ok(loadingAt < chromeAt, "the loading branch must come before the chrome render");
  assert.match(
    code,
    /<LoadingScope active>[\s\S]*?<SkeletonBone/,
    "the loading shell renders the skeleton composition in a LoadingScope (#278 tranche 4) — the metadata badge's slot is a pill bone (#743)",
  );
  assert.ok(!code.includes("Spinner"), "the loading state renders skeletons, not a Spinner (#278)");
});

test("the status/version bar sits below Start Cooking inside a single scroll region (#721 fidelity round)", () => {
  // Stephen's ruling: anything not in the visual direction image
  // — including the status badge + version picker — moves below
  // Start Cooking, inside the scroll region (no pinned chrome).
  const readyCode = code.replace(
    /if \(props\.state === "loading"\) \{[\s\S]*?(?=\n {2}const \{ status, versions)/,
    "",
  );
  const scrollAt = readyCode.indexOf("<ScrollRegion>");
  assert.ok(scrollAt !== -1, "the sections render in the ScrollRegion");
  assert.equal(
    readyCode.split("<ScrollRegion").length - 1,
    1,
    "exactly one ScrollRegion: the ready page's section scroll",
  );
  const panelAt = readyCode.indexOf("<OverviewPanel");
  assert.ok(panelAt > scrollAt, "the sections render inside the scroll region");
  const startAt = readyCode.indexOf("<StartCookingPanel");
  const detailsAt = readyCode.indexOf("<DetailsPanel");
  const toolbarAt = readyCode.indexOf("<Toolbar>", readyCode.indexOf("function DetailsPanel"));
  assert.ok(startAt > scrollAt, "Start Cooking renders inside the scroll region");
  assert.ok(
    detailsAt > startAt,
    "the details (status/version bar included) render below Start Cooking",
  );
  assert.ok(
    toolbarAt > readyCode.indexOf("function DetailsPanel") &&
      toolbarAt < readyCode.indexOf("function IngredientsPanel"),
    "the status/version bar renders inside the details panel's definition",
  );
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
  // inside the panel Col whose inset it takes — the panel
  // definitions precede the page body, and Nutrition's section
  // stack is composed in the body, its heading before the panel).
  const sequence = [
    '<SectionHeading icon="list">Ingredients</SectionHeading>',
    "<SectionHeading>Instructions</SectionHeading>",
    "<SectionHeading>Cook History</SectionHeading>",
    "<OverviewPanel",
    "<IngredientsPanel",
    "<InstructionsPanel",
    "<HistoryPanel",
    "<SectionHeading>Nutrition</SectionHeading>",
    "<NutritionPanel",
  ];
  // The ordering is the ready layout's: the loading branch
  // (a separate union state, #278 tranche 4) renders its own
  // headings in the same order but is excised here, as above.
  const readyCode = code.replace(
    /if \(props\.state === "loading"\) \{[\s\S]*?(?=\n {2}const \{ status, versions)/,
    "",
  );
  let lastAt = -1;
  for (const marker of sequence) {
    const at = readyCode.indexOf(marker);
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
      statusBadgesCode.includes(`${status}: { label:`) &&
        statusBadgesCode.includes(`tone: "${tone}"`),
      `STATUS_BADGES must map ${status} to the ${tone} tone`,
    );
  }
  assert.match(
    code,
    /STATUS_BADGES\[status\] \?\? STATUS_BADGES\.idea/,
    "unknown statuses fall back to idea, as the app's normalizer does",
  );
  // #363 (eciperay #278 ruling): the status renders exactly once — the
  // badge beside the version picker in the below-Start-Cooking bar,
  // not again in the overview.
  assert.equal((code.match(/<RecipeStatusBadge status=\{status\} \/>/g) ?? []).length, 1);
  assert.match(code, /<Toolbar>[\s\S]*?<RecipeStatusBadge[\s\S]*?<\/Toolbar>/, "badge in toolbar");
  // #483: the status badge renders Badge directly (StatusBadge is removed).
  assert.match(
    code,
    /<Badge tone=\{badge\?\.tone \?\? "neutral"\}>\{badge\?\.label \?\? "Idea"\}<\/Badge>/,
    "the mapped tone and label reach Badge",
  );
  assert.ok(!code.includes("StatusBadge.tsx"), "no StatusBadge import remains");
});

test("the cook-log form data replaces the Log a cook button while the form is open (#687)", () => {
  assert.match(code, /cookLogForm\?: RecipeDetailPageCookLogForm \| null;/);
  assert.doesNotMatch(code, /renderCookLogForm/, "the renderCookLogForm slot is removed (#687)");
  assert.match(
    code,
    /const form = history\.cookLogForm \? \(/,
    "the form renders from the history data and its presence decides the button swap",
  );
  assert.match(code, /<RatingForm/, "the page renders the DS RatingForm itself");
  // The form is keyed to the selected version so its local draft
  // remounts (resets) on a version change instead of leaking into
  // another version's onSubmit (CodeRabbit review on #691).
  assert.match(code, /<RatingForm\s+key=\{selectedVersionId\}/);
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

test("the sharing section renders after the lifecycle section and before the tags", () => {
  const lifecycleAt = code.indexOf("<LifecycleSection");
  const sharingAt = code.indexOf("{sharingControls}");
  const tagsAt = code.indexOf("<TagList");
  assert.ok(lifecycleAt !== -1, "the lifecycle section renders in the overview");
  assert.ok(sharingAt > lifecycleAt, "sharing renders after the lifecycle section");
  assert.ok(tagsAt > sharingAt, "the tags render after the sharing slot");
  assert.doesNotMatch(
    code,
    /renderSharingControls/,
    "the sharing render slot is removed (#682) — the data prop is the only path",
  );
  // #438 Part 3: the `sharing` data prop renders RecipeSharingView
  // at the same position.
  assert.match(
    code,
    /const sharingControls = sharing \? <RecipeSharingView \{\.\.\.sharing\} \/> : null;/,
    "the sharing data prop renders the view at the section's position",
  );
});

test("the comments slot renders in the overview panel after the ratings card", () => {
  const ratingsAt = code.indexOf("<RatingsCard");
  const commentsAt = code.indexOf("{comments}", ratingsAt);
  assert.ok(ratingsAt !== -1, "the ratings card renders in the overview panel");
  assert.ok(commentsAt > ratingsAt, "comments render after the ratings card");
  // #438 Part 3: the `comments` data prop renders RecipeCommentsView
  // at the same position and takes precedence over the slot.
  assert.doesNotMatch(
    code,
    /renderComments/,
    "the comments render slot is removed (#682) — the data prop is the only path",
  );
  assert.match(
    code,
    /const comments = commentsData \? <RecipeCommentsView \{\.\.\.commentsData\} \/> : null;/,
    "the comments data prop renders the view at the section's position",
  );
});

test("optional content is omitted cleanly, never rendered as a shell", () => {
  assert.match(code, /\{imageUrl \? <Thumbnail/, "the hero image renders only with an imageUrl");
  assert.match(code, /\{description \? <Text variant="body">/, "description renders when present");
  assert.ok(
    !code.includes("StatCard") && !code.includes("StatBand"),
    "the stat tiles are retired (#743) — the overview's MetadataBadge is the metadata presentation",
  );
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
    "the page passes the activation callback into CandidateList only when provided (the Activate conditional itself is pinned in CandidateList.test.ts)",
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
  const panelFile = join(here, "../../..", "src", "widgets", "data", "NutritionPanel.tsx");
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
    // Guest mode (#757): the retired public page's story set,
    // ported — both CTA variants, the message states, the
    // minimal and ingredients-exercised guest treatments.
    "SignedOut",
    "SignedInNonOwner",
    "SignedInClonePending",
    "CommentsAsData",
    "SignedOutMinimal",
    "SignedOutIngredients",
    "NotFound",
    "Unavailable",
  ]) {
    assert.match(
      storiesCode,
      new RegExp(`export const ${name}: Story`),
      `RecipeDetailPage.stories.tsx must export a ${name} story`,
    );
  }
  for (const state of ["notFound", "unavailable"]) {
    assert.match(
      storiesCode,
      new RegExp(`<RecipeDetailPage[^>]*state="${state}"[^>]*/>`),
      `a story must render the ${state} union member (#757)`,
    );
  }
  assert.match(storiesCode, /variant: "signedIn"/, "a story must exercise the signed-in CTA bar");
  assert.match(
    storiesCode,
    /isClonePending: clonePending/,
    "a story must exercise the pending clone",
  );
  assert.match(storiesCode, /comments: \{/, "a story must pass comments as data (#130 T7)");
  assert.match(
    storiesCode,
    /cookLogForm: \{/,
    "a story must pass the cook-log form data for the open form",
  );
  assert.doesNotMatch(
    storiesCode,
    /renderSharingControls/,
    "no story passes the removed sharing slot (#682)",
  );
  assert.match(
    storiesCode,
    /<RecipeDetailPage[^>]*state="loading"[^>]*\/>/,
    "the Loading story must render the loading props member",
  );
});

test("the activation confirmation mirrors the other confirmations' contract (#532)", () => {
  assert.match(
    code,
    /activationConfirmation\?: RecipeDetailPageConfirmation \| null;/,
    "the ready props carry activationConfirmation in the shared confirmation type",
  );
  assert.match(
    code,
    /\{props\.activationConfirmation \? \(\s*<ConfirmActionView \{\.\.\.props\.activationConfirmation\} \/>\s*\) : null\}/,
    "a provided activationConfirmation renders ConfirmActionView beside the page shell",
  );
  // It renders alongside the existing three, after the cook-log
  // delete confirmation and before the nutrition notice.
  const cookLogAt = code.indexOf("<ConfirmActionView {...props.cookLogDeleteConfirmation} />");
  const activationAt = code.indexOf("<ConfirmActionView {...props.activationConfirmation} />");
  const nutritionAt = code.indexOf("<ConfirmActionView {...props.nutritionNotice} />");
  assert.ok(
    cookLogAt !== -1 && activationAt > cookLogAt,
    "activation renders after cook-log delete",
  );
  assert.ok(nutritionAt > activationAt, "activation renders before the nutrition notice");
  assert.match(
    storiesCode,
    /export const ActivationConfirmationOpen: Story/,
    "a story exercises the activation confirmation open over the page",
  );
  assert.match(
    storiesCode,
    /activationConfirmation: \{\s*open: true,/,
    "the story passes the confirmation open, in the host view-model shape",
  );
  assert.match(
    storiesCode,
    /confirmTone: "primary" as const,/,
    "the story's activation confirmation uses the primary tone (reversible action)",
  );
});

test("the overview follows the recipe-detail visual direction (#721)", () => {
  // The new optional overview props: category + total time for
  // the pill, the cooking tip line — all app-supplied strings.
  assert.match(code, /categoryLabel\?: string;/);
  assert.match(code, /totalTimeLabel\?: string;/);
  assert.match(code, /cookingTipLabel\?: string;/);
  // The metadata pill under the hero: the reusable MetadataBadge
  // widget (extracted from this page file at Stephen's PR #730
  // review), parts composed in the direction's order.
  assert.match(code, /<MetadataBadge/);
  assert.match(code, /servingsLabel \? `Serves \$\{servingsLabel\}` : undefined/);
  // The title is the serif display variant, bare (no CardStack).
  assert.match(code, /<Text variant="display">\{title\}<\/Text>/);
  assert.ok(!code.includes("CardStack"), "the title's CardStack wrapper is dropped (#721)");
  assert.ok(!code.includes('variant="formTitle"'), "the title no longer uses formTitle (#721)");
  // Start Cooking (#721 fidelity round): a fully rounded pill,
  // full width (grow, no web cap), at the end of the in-image
  // flow — its color is the theme primary (burnt orange #b13f13
  // in Warm Harvest, pinned in tamagui.config.test.ts).
  assert.match(
    code,
    /<Button variant="primary" grow borderRadius=\{tokens\.radii\.full\} href=\{cookingHref\}>/,
  );
  // The tip line centered under the action, italic, in the
  // muted-green accent ink, only when supplied.
  assert.match(
    code,
    /\{cookingTipLabel \? \(\s+<CenteredText variant="hint" fontStyle="italic" color="\$accent">\s+\{cookingTipLabel\}\s+<\/CenteredText>\s+\) : null\}/,
  );
  // Ingredients heading carries the list icon; instructions use
  // StepList's numeral presentation.
  assert.match(code, /<SectionHeading icon="list">Ingredients<\/SectionHeading>/);
  assert.match(code, /<StepList\s+presentation="numeral"/);
  // The in-image flow order (#721 fidelity round): overview
  // (hero/pill/title/description), ingredients, instructions,
  // Start Cooking — then the details panel with everything else.
  const flow = [
    "<OverviewPanel",
    "<IngredientsPanel",
    "<InstructionsPanel",
    "<StartCookingPanel",
    "<DetailsPanel",
  ];
  let last = -1;
  for (const marker of flow) {
    const at = code.indexOf(
      marker,
      code.indexOf("<ScrollRegion>", code.indexOf("export function RecipeDetailPage")),
    );
    assert.ok(at > last, `${marker} must render in the in-image flow order`);
    last = at;
  }
});

test("print/share name the icons module's Feather icons, not text glyphs (#187, #438 Part 4)", () => {
  for (const [name, component] of [
    ["print", "PrintIcon"],
    ["share", "ShareIcon"],
  ] as const) {
    assert.match(
      code,
      new RegExp(`icon="${name}"`),
      "the button's icon slot takes the name as data",
    );
    assert.ok(
      !code.includes(component),
      `the page must not reference the ${component} component — names only (#438 Part 4)`,
    );
  }
  assert.ok(!code.includes("🖨") && !code.includes("↗"), "no emoji/text glyph button labels");
  assert.ok(!code.includes("PrinterGlyph") && !code.includes("ShareGlyph"), "no hand-drawn glyphs");
});

// ---------------------------------------------------------------------------
// Guest mode (#757): the invariants the retired PublicRecipePage's
// contract test pinned, carried onto the merged page — the error
// states and their verbatim copy, the CTA bar, the guest scroll
// sequence, the shared-shape reuse, and the shared-component
// treatments. The guest branch is excised from the owner tests
// above by their loading-branch excision (it sits between the
// loading branch and the owner destructure), so its pins scope
// to the branch text itself.
// ---------------------------------------------------------------------------

const widgetsDir = join(pagesDir, "..", "..", "src", "widgets");
const ratingsCardCode = readFileSync(join(widgetsDir, "data", "RatingsCard.tsx"), "utf8")
  .replaceAll(/\/\*[\s\S]*?\*\//g, "")
  .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
const guestAt = code.indexOf("if (isGuestReadyProps(props))");
const guestCode = code.slice(guestAt, code.indexOf("const { status, versions"));

test("guest mode: the error states branch before both ready forms (#757)", () => {
  const notFoundAt = code.indexOf('props.state === "notFound"');
  const unavailableAt = code.indexOf('props.state === "unavailable"');
  const loadingAt = code.indexOf('props.state === "loading"');
  assert.ok(loadingAt !== -1 && notFoundAt > loadingAt, "notFound branches after loading");
  assert.ok(unavailableAt > notFoundAt, "unavailable branches after notFound");
  assert.ok(guestAt > unavailableAt, "the guest branch comes after the error states");
  assert.match(
    code,
    /props\.viewer === "signedIn" \|\| props\.viewer === "signedOut"/,
    "the guest guard discriminates on the two guest viewer values",
  );
  assert.match(code, /<MessageCard title=\{NOT_FOUND_TITLE\} message=\{NOT_FOUND_MESSAGE\} \/>/);
  assert.match(
    code,
    /<MessageCard title=\{UNAVAILABLE_TITLE\} message=\{UNAVAILABLE_MESSAGE\} \/>/,
  );
});

test("guest mode: the error copy is the web surface's verbatim copy (#757)", () => {
  for (const copy of [
    'NOT_FOUND_TITLE = "Recipe not found"',
    'NOT_FOUND_MESSAGE = "This recipe may be private or no longer available."',
    'UNAVAILABLE_TITLE = "Recipe unavailable"',
    'UNAVAILABLE_MESSAGE = "This recipe link is invalid or has expired."',
  ]) {
    assert.ok(code.includes(copy), `the page must carry ${copy}`);
  }
});

test("guest mode: one ScrollShell inside the landmark, sections in the public tab order (#757)", () => {
  assert.equal(
    guestCode.split("<ScrollShell").length - 1,
    1,
    "exactly one ScrollShell: the guest page's single section scroll",
  );
  assert.match(
    guestCode,
    /<MainLandmark>[\s\S]*?<ScrollShell>/,
    "the guest scroll renders inside the page's main landmark (#366/#473)",
  );
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
    const at = guestCode.indexOf(marker);
    assert.ok(at > lastAt, `guest sections must render in tab order: ${marker} after the previous`);
    lastAt = at;
  }
  const scrollAt = guestCode.indexOf("<ScrollShell");
  assert.ok(guestCode.indexOf("<CtaBar") > scrollAt, "the sections render inside the scroll shell");
});

test("guest mode: the CTA bar switches on the auth-state variant with verbatim labels (#757)", () => {
  assert.match(
    code,
    /export type RecipeDetailPageCtas =\s*\{ variant: "signedOut" \} \| \{ variant: "signedIn"; isClonePending\?: boolean \};/,
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

test("guest mode: the shared shapes are reused, not re-declared (#757)", () => {
  assert.match(
    code,
    /export type RecipeDetailPageRatings = RatingsCardRatings;/,
    "the ratings view-model is RatingsCard's, aliased — both forms share it",
  );
  assert.match(
    code,
    /export type RecipeDetailPageComments = RecipeCommentsViewProps;/,
    "the comments view-model is the view's props, aliased (#130 T7)",
  );
  assert.match(
    code,
    /viewer: "signedIn" \| "signedOut";/,
    "the guest form's viewer names the two guest treatments",
  );
  assert.match(
    code,
    /overview: RecipeDetailPageGuestOverviewProps;/,
    "the guest ready props carry the guest overview shape",
  );
  assert.match(code, /ingredients: RecipeDetailPageIngredientsProps;/);
  assert.match(code, /instructions: RecipeDetailPageInstructionsProps;/);
  assert.match(code, /comments\?: RecipeDetailPageComments \| null;/);
  assert.match(
    ratingsCardCode,
    /\{ratings\.viewer \? \(/,
    "the viewer star input renders only with a viewer (signed out hides it)",
  );
});

test("guest mode: no status badge on the guest overview (#735, #757)", () => {
  const sectionAt = code.indexOf("function OverviewSection");
  const span = code.slice(sectionAt, code.indexOf("function IngredientsSection"));
  assert.ok(!span.includes("STATUS_BADGES"), "the guest overview must not resolve a status badge");
  assert.ok(!span.includes("status"), "the guest overview carries no status");
});

test("guest mode: the CTA sizing and message shell are the shared components' (#341, #757)", () => {
  assert.ok(
    code.includes('import { ButtonRow } from "../../widgets/actions/ButtonRow.js";'),
    "the page imports the library ButtonRow",
  );
  assert.ok(
    code.includes('import { MessageCard } from "../../widgets/content/MessageCard.js";'),
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

test("guest mode: the sections render through the shared library panels (#331, #757)", () => {
  for (const panel of ["RecipeOverviewPanel", "RecipeIngredientsPanel"]) {
    assert.ok(
      code.includes(`import { ${panel} } from "../../views/eciperay/${panel}.js";`),
      `the page imports the library ${panel}`,
    );
  }
  assert.ok(
    code.includes('import { StepList } from "../../widgets/data/StepList.js";'),
    "the page imports the library StepList",
  );
  assert.match(code, /<RecipeIngredientsPanel ingredients=\{ingredients\} \/>/);
  assert.match(
    code,
    /label: `Step \$\{step\.stepNumber\}`/,
    "the page composes each step's Step N label (#747)",
  );
});
