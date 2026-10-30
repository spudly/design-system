/**
 * Contract test for spudly/design-system#237: the follow-up to #235.
 * #235 routed Button, Text, and the component-internal stack
 * pressables through the shared `platformAccessibilityProps`
 * translator in src/components/accessibility.ts, but remaining render
 * paths still set React Native accessibility props on raw Tamagui
 * stacks or Tamagui semantic primitives, where Tamagui's web renderer
 * forwards them verbatim to the DOM as raw attributes — no
 * `aria-label`, stringified `accessibilityvalue="[object Object]"`,
 * and no role at all (the role prop itself leaked as
 * `accessibilityrole="…"`), leaving controls with no accessible name
 * or semantics on web:
 *
 * - Page-level raw-stack pressables in src/pages/**: ShoppingListPage's
 *   checkbox row (XStack), MealDetailPage member rows (YStack,
 *   including the disabled-state spread for unavailable rows),
 *   MealsHubPage rows (YStack), AiSessionPage's
 *   Cancel action (YStack), MealCookingModePage's Done action (YStack),
 *   RecipeFormPage's revert actions (YStack). (RecipeDetailPage's
 *   viewer-rating wrapper and Custom scale chip were in this list
 *   until the #119 recipes-detail tranche moved the wrapper into
 *   RatingsCard, its rows/steps into MarkableRow / StepList, and
 *   the #119 dedupe turned the scale chip into a PresetValueSelector
 *   Button; the page has no stack pressable left — pinned below.)
 *   (MealPlansPage's and MealPlanDetailPage's rows were in this
 *   list until the #119 tranche-2 de-styling moved them into the
 *   generic CardRow / ListRow components; the routing moved with
 *   them and the rows test below pins it there. RecipeFormPage's
 *   revert actions and changed-list banner joined them in the
 *   #119 forms tranche as the RevertAction / ChangedListBanner
 *   components; since the #119 dedupe both compose TextAction,
 *   so their press role is TextAction's routing, pinned with
 *   TextAction — the de-styled-pages test below pins that no
 *   stack pressable remains in RecipeFormPage itself.)
 * - Tamagui semantic primitives used directly: Checkbox in
 *   ChecklistRow (its `accessibilityLabel` leaked; Tamagui supplies
 *   role/aria-checked itself) and Progress in ProgressBar (role,
 *   value, and caller labels all leaked).
 * - The same leak through DS field/primitive wrappers that forwarded
 *   caller RN props in `...rest` to a Tamagui element: TextField,
 *   TextAreaField, CheckboxField (a Checkbox primitive), TextLink,
 *   OptionCard (through Card), BackLink, and Alert's alert role.
 *
 * The contract now:
 * 1. Every path above routes its RN accessibility props through
 *    `platformAccessibilityProps` (or, for the wrappers, destructures
 *    the caller's RN props OUT of rest and routes them through the
 *    translator like Button/Text do in #235), so on web they render
 *    as `aria-label` / `role` / `aria-checked` / `aria-valuenow` etc.
 *    and on native they pass through unchanged.
 * 2. A global source scan (below) pins that NO raw
 *    `accessibilityLabel=` / `accessibilityState=` /
 *    `accessibilityRole=` / `accessibilityValue=` JSX prop in src/
 *    lands on anything but a sanctioned translating target: a DS
 *    primitive that itself translates (Button, Text, TextField,
 *    TextAreaField, TextAction — via Text — and ProgressBar), or a
 *    React Native element (TouchableOpacity in RecipesPage /
 *    SharedWithMePage / RecipeDetailPage; Image in
 *    ImportReviewPage, whose `accessibilityLabel`
 *    react-native-web renders as the image's `alt` text), which
 *    react-native-web translates to ARIA itself on web. Raw
 *    Tamagui stacks (XStack,
 *    YStack, View), styled Tamagui primitives (StyledCheckbox,
 *    StyledTrack, StyledTextLink, Card, …), and Progress/Checkbox
 *    primitives are NOT sanctioned targets.
 * 3. Runtime (SSR, against the built output): ChecklistRow,
 *    ProgressBar, TextField, CheckboxField, TextLink, BackLink,
 *    OptionCard, and Alert render their ARIA equivalents and NO
 *    leaked RN attributes and no "[object Object]".
 *
 * The source scans strip comments first, like the other contract
 * tests here, so prose cannot satisfy or trip the patterns.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readCode(rel) {
  return readFileSync(join(root, rel), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

function sourceFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.tsx$/.test(entry.name) ? [path] : [];
  });
}

/** DS primitives that translate caller RN props themselves (#235/#237),
 * plus RN elements react-native-web translates on web. */
// Compact split form: this file sits at the test max-lines cap
// (300), so the tag list cannot grow one-per-line. Dropdown and
// DropdownButton (#178) are sanctioned on the same ground as the
// primitives: Dropdown routes its panel label through
// platformAccessibilityProps onto the Popover content, and
// DropdownButton forwards its label to the DS Button — both
// translate caller RN props themselves. LinkOverlay is sanctioned
// on the same ground again: it is the native link layer for
// view-level link surfaces and spreads platformAccessibilityProps
// onto its Anchor. Thumbnail is sanctioned on the same ground:
// it routes its `accessibilityLabel` through
// platformAccessibilityProps internally. (ActionChip was too,
// until the #119 dedupe retired it; its consumers are Buttons.)
// RatingStars (RecipesPage's page-local log-cook control) is
// sanctioned on the same ground: its pressable form routes
// the label through platformAccessibilityProps onto its target.
const SANCTIONED_TAGS = new Set(
  "Button,Text,TextField,TextAreaField,TextAction,ProgressBar,TouchableOpacity,Image,Dropdown,DropdownButton,LinkOverlay,Thumbnail,RatingStars".split(
    ",",
  ),
);

test("no raw RN accessibility JSX prop lands on a Tamagui element anywhere in src/ (#237)", () => {
  const files = sourceFiles(join(root, "src"));
  assert.ok(files.length > 0, "scan must find source files");
  let checked = 0;
  for (const file of files) {
    const code = readCode(file.slice(root.length + 1));
    for (const match of code.matchAll(/accessibility(?:Label|State|Role|Value)\s*=/g)) {
      // The JSX opening tag this prop belongs to: the last `<Tag`
      // before the prop with no `>` in between (props live inside the
      // opening tag). Object-literal forms (`accessibilityRole: "x"`
      // inside platformAccessibilityProps({…})) use `:` and never
      // match the `=` pattern above.
      const before = code.slice(0, match.index);
      const tagStart = before.lastIndexOf("<");
      assert.ok(tagStart !== -1, `${file}: accessibility prop with no preceding tag`);
      // Arrow functions in earlier props of the same opening tag
      // (`onFocus={() => …}`) contain `>` without closing the tag;
      // strip `=>` before checking the tag is still open.
      const tagText = before.slice(tagStart).replaceAll("=>", "");
      assert.ok(!tagText.includes(">"), `${file}: could not attribute accessibility prop to a tag`);
      const tag = /^<([A-Z][A-Za-z0-9.]*)/.exec(tagText)?.[1];
      assert.ok(tag, `${file}: could not read tag name before accessibility prop`);
      checked += 1;
      assert.ok(
        SANCTIONED_TAGS.has(tag),
        `${file}: raw ${match[0]} on <${tag}> leaks to the DOM on web — route it through platformAccessibilityProps (#237)`,
      );
    }
  }
  assert.ok(checked > 0, "scan must find at least one sanctioned raw prop");
});

// Compact split form (the SANCTIONED_TAGS pattern above): this
// file sits at the max-lines cap. MealPlansPage,
// MealPlanDetailPage, RecipeDetailPage, and RecipeFormPage are
// deliberately absent: their rows and revert pressables render
// through the generic components the #119 extractions moved
// them into (RecipeDetailPage's rows/steps through MarkableRow
// / StepList after the recipes-detail tranche), so none of
// them has a stack pressable left to translate — pinned below.
const PAGE_STACKS =
  "src/pages/ShoppingListPage.tsx,src/pages/MealDetailPage.tsx,src/pages/MealsHubPage.tsx,src/pages/AiSessionPage.tsx,src/pages/MealCookingModePage.tsx".split(
    ",",
  );

// Shared by the stack scans below (compact form: this file sits
// at the max-lines cap). RAW matches a raw RN accessibility JSX
// prop; TAGS strips the sanctioned targets (DS primitives /
// TouchableOpacity / LinkOverlay) before RAW is applied.
const RAW = /accessibility(Label|State|Role|Value)=/;
const TAGS =
  /<(Button|Text|TextField|TextAreaField|TextAction|ProgressBar|TouchableOpacity|LinkOverlay)\b[^>]*>/g;

test("page-level stack pressables route through the translator, never raw RN JSX props (#237)", () => {
  for (const rel of PAGE_STACKS) {
    const code = readCode(rel);
    assert.ok(
      code.includes("platformAccessibilityProps"),
      `${rel} must route its stack accessibility props through platformAccessibilityProps`,
    );
    assert.ok(
      code.includes("...platformAccessibilityProps("),
      `${rel} must spread the translator's result onto the pressable — calling the helper without spreading it changes nothing`,
    );
    assert.ok(
      !RAW.test(code.replaceAll(TAGS, "")),
      `${rel} must not pass raw RN accessibility JSX props to a Tamagui stack (props on DS primitives / TouchableOpacity / LinkOverlay are the sanctioned exceptions)`,
    );
  }
});

test("ShoppingListPage's checkbox row translates role, checked state, and label together (#237)", () => {
  const code = readCode("src/pages/ShoppingListPage.tsx");
  assert.match(
    code,
    /\{\.\.\.platformAccessibilityProps\(\{\s+accessibilityRole: "checkbox"/,
    "the translated props must be spread onto the row's XStack pressable",
  );
  assert.match(code, /accessibilityState: \{ checked \}/);
  assert.match(code, /accessibilityLabel: line\.name/);
});

test("MealPlansPage, MealPlanDetailPage, RecipeDetailPage, and RecipeFormPage have no stack pressable left (#237, #248, #119)", () => {
  // The pages' rows render through the generic row components in
  // their link forms (RecipeDetailPage's through MarkableRow /
  // StepList) — no stack pressable remains in any of them, so
  // the translator must not be imported or used, and no raw RN
  // accessibility JSX props may appear either (props on DS
  // primitives / LinkOverlay are the sanctioned exceptions,
  // stripped via the shared TAGS before RAW is applied).
  const PAGES = "MealPlansPage,MealPlanDetailPage,RecipeDetailPage,RecipeFormPage".split(",");
  for (const rel of PAGES.map((page) => `src/pages/${page}.tsx`)) {
    const code = readCode(rel);
    assert.ok(!code.includes("platformAccessibilityProps"), `${rel} must not use the translator`);
    assert.ok(
      !RAW.test(code.replaceAll(TAGS, "")),
      `${rel} must not carry raw RN accessibility JSX props`,
    );
  }
});

test("rows translate the disabled state; the generic rows keep the button role in their press form (#237, #248)", () => {
  // MealDetailPage's member rows are links since #248: the page
  // routes only the unavailable row's disabled state through the
  // translator, never a button role. The plan pages' rows moved
  // into the generic ListRow / CardRow components (#119 tranche
  // 2) and the routing moved with them: their press forms carry
  // the button role, ListRow also translates its disabled state,
  // and CardRow has no disabled state. RecipeFormPage's revert
  // pressables (RevertAction / ChangedListBanner, #119 forms
  // tranche) carry no row here: since the #119 dedupe both
  // compose TextAction, whose own routing carries their role.
  // Compact table form: this file is at its line cap.
  const ROLE = /platformAccessibilityProps\(\{ accessibilityRole: "button" \}\)/;
  const DISABLED = /platformAccessibilityProps\(\{ accessibilityState: \{ disabled: true \} \}\)/;
  const cases = [
    ["src/pages/MealDetailPage.tsx", null, DISABLED],
    ["src/components/ListRow.tsx", ROLE, DISABLED],
    ["src/components/CardRow.tsx", ROLE, null],
  ];
  for (const [rel, role, disabled] of cases) {
    const code = readCode(rel);
    if (role)
      assert.match(
        code,
        role,
        `${rel}: the press form's button role must go through the translator`,
      );
    if (disabled)
      assert.match(code, disabled, `${rel}: the disabled state must go through the translator`);
  }
  assert.doesNotMatch(
    readCode("src/pages/MealDetailPage.tsx"),
    ROLE,
    "MealDetailPage's rows are links (#248) — no button role may come back through the translator",
  );
});

test("ChecklistRow's Checkbox and ProgressBar's Progress route through the translator (#237)", () => {
  const checklist = readCode("src/components/ChecklistRow.tsx");
  assert.match(checklist, /platformAccessibilityProps\(\{ accessibilityLabel: label \}\)/);
  assert.ok(!/accessibility(Label|State|Role|Value)=/.test(checklist));

  const progress = readCode("src/components/ProgressBar.tsx");
  assert.match(progress, /platformAccessibilityProps\(\{/);
  assert.match(progress, /accessibilityRole: accessibilityRole \?\? "progressbar"/);
  assert.match(progress, /accessibilityValue: accessibilityValue \?\? \{ min: 0, max: 100, now:/);
  assert.match(
    progress,
    /accessibilityLabel,/,
    "caller labels (the stories' form) must be destructured for translation",
  );
  assert.ok(!/accessibility(Label|State|Role|Value)=/.test(progress));
});

test("field/primitive wrappers destructure caller RN props out of rest and translate them (#237)", () => {
  // Compact split form: this file sits at the max-lines cap.
  const wrappers =
    "src/components/TextField.tsx,src/components/TextAreaField.tsx,src/components/CheckboxField.tsx,src/components/TextLink.tsx,src/components/OptionCard.tsx,src/components/Alert.tsx".split(
      ",",
    );
  for (const rel of wrappers) {
    const code = readCode(rel);
    // One needle per routing requirement: build a11yProps via the
    // translator, spread them onto the element, and destructure
    // the caller's accessibilityLabel out of rest.
    const NEEDLES = ["platformAccessibilityProps({", "{...a11yProps}", "accessibilityLabel,"];
    for (const needle of NEEDLES)
      assert.ok(code.includes(needle), `${rel} must satisfy the translator routing (${needle})`);
  }
  const backLink = readCode("src/components/BackLink.tsx");
  assert.match(backLink, /platformAccessibilityProps\(\{ accessibilityRole: "link" \}\)/);
  const alert = readCode("src/components/Alert.tsx");
  assert.match(alert, /platformAccessibilityProps\(\{ accessibilityRole: "alert" \}\)/);
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
  // Strip the Tamagui CSS block: the leak assertions are about the
  // rendered elements' attributes, not stylesheet text.
  const styleEnd = html.lastIndexOf("</style>");
  return styleEnd === -1 ? html : html.slice(styleEnd + "</style>".length);
}

function assertNoLeak(html) {
  assert.ok(!/accessibilitylabel/i.test(html), "accessibilitylabel must not leak to the DOM");
  assert.ok(!/accessibilitystate/i.test(html), "accessibilitystate must not leak to the DOM");
  assert.ok(!/accessibilityrole/i.test(html), "accessibilityrole must not leak to the DOM");
  assert.ok(!/accessibilityvalue/i.test(html), "accessibilityvalue must not leak to the DOM");
  assert.ok(!html.includes("[object Object]"), "no stringified state/value object in the DOM");
}

const noop = () => null;

test("SSR: ChecklistRow's checkbox carries its label as aria-label (#237)", async () => {
  const { React, ChecklistRow } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(ChecklistRow, { label: "Buy milk", checked: true, onCheckedChange: noop }),
  );
  assert.ok(
    html.includes('aria-label="Buy milk"'),
    `expected aria-label in: ${html.slice(0, 600)}`,
  );
  assert.ok(html.includes('role="checkbox"'));
  assert.ok(html.includes('aria-checked="true"'));
  assertNoLeak(html);
});

test("SSR: ProgressBar renders aria-label, progressbar role, and value — no [object Object] (#237)", async () => {
  const { React, ProgressBar } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(ProgressBar, { value: 40, accessibilityLabel: "Session progress" }),
  );
  assert.ok(html.includes('aria-label="Session progress"'));
  assert.ok(html.includes('role="progressbar"'));
  assert.ok(html.includes('aria-valuenow="40"'));
  assertNoLeak(html);
});

test("SSR: TextField and CheckboxField render caller labels as aria-label (#237)", async () => {
  const { React, TextField, CheckboxField } = await loadRuntime();
  const field = await renderToHtml(
    React.createElement(TextField, { accessibilityLabel: "Email", value: "", onChangeText: noop }),
  );
  assert.ok(field.includes('aria-label="Email"'));
  assertNoLeak(field);
  const box = await renderToHtml(
    React.createElement(CheckboxField, {
      label: "Agree",
      checked: false,
      onCheckedChange: noop,
      accessibilityLabel: "Agree checkbox",
    }),
  );
  assert.ok(box.includes('aria-label="Agree checkbox"'));
  assertNoLeak(box);
});

test("SSR: TextLink, BackLink, OptionCard, and Alert render their roles (#237)", async () => {
  const { React, TextLink, BackLink, OptionCard, Alert } = await loadRuntime();
  const link = await renderToHtml(React.createElement(TextLink, { onPress: noop }, "Forgot"));
  assert.ok(link.includes('role="link"'), `expected role=link in: ${link.slice(0, 400)}`);
  assertNoLeak(link);
  const back = await renderToHtml(React.createElement(BackLink, { onPress: noop }));
  assert.ok(back.includes('role="link"'));
  assertNoLeak(back);
  const card = await renderToHtml(
    React.createElement(OptionCard, { title: "Manual entry", onPress: noop }),
  );
  assert.ok(card.includes('role="button"'));
  assertNoLeak(card);
  const alertHtml = await renderToHtml(
    React.createElement(Alert, { severity: "error", message: "Boom" }),
  );
  assert.ok(alertHtml.includes('role="alert"'));
  assertNoLeak(alertHtml);
  // Caller-supplied RN props on Alert are translated too, not leaked
  // raw through `...rest` (CodeRabbit finding on PR #243).
  const labelledAlert = await renderToHtml(
    React.createElement(Alert, {
      severity: "error",
      message: "Boom",
      accessibilityLabel: "Failure notice",
    }),
  );
  assert.ok(labelledAlert.includes('aria-label="Failure notice"'));
  assert.ok(labelledAlert.includes('role="alert"'));
  assertNoLeak(labelledAlert);
  // A caller role override on a polite (non-alert) severity must not
  // drop the live region: role="status" carries it implicitly, so an
  // override gets an explicit aria-live="polite" instead.
  const headingAlert = await renderToHtml(
    React.createElement(Alert, {
      severity: "success",
      message: "Saved",
      accessibilityRole: "header",
    }),
  );
  assert.ok(headingAlert.includes('role="heading"'));
  assert.ok(headingAlert.includes('aria-live="polite"'));
  assertNoLeak(headingAlert);
  // A caller-supplied "alert" role must keep its implicit assertive
  // announcement: the polite fallback must not downgrade it with an
  // explicit aria-live="polite" (CodeRabbit finding on PR #241).
  const callerAlertRole = await renderToHtml(
    React.createElement(Alert, {
      severity: "success",
      message: "Saved",
      accessibilityRole: "alert",
    }),
  );
  assert.ok(callerAlertRole.includes('role="alert"'));
  assert.ok(!callerAlertRole.includes('aria-live="polite"'));
  assertNoLeak(callerAlertRole);
  // Same protection for a direct web role="alert" combined with a
  // translated accessibilityRole: the direct role goes through the
  // translator (and wins), so the polite fallback must not fire
  // (CodeRabbit finding on PR #241, head 6f0bbd1).
  const directAlertRole = await renderToHtml(
    React.createElement(Alert, {
      severity: "success",
      message: "Saved",
      accessibilityRole: "header",
      role: "alert",
    }),
  );
  assert.ok(directAlertRole.includes('role="alert"'));
  assert.ok(!directAlertRole.includes('aria-live="polite"'));
  assertNoLeak(directAlertRole);
});

// Shared by the two #237 page-pattern tests below (hoisted so each
// page source is read once).
const aiSession = readCode("src/pages/AiSessionPage.tsx");
const recipeDetail = readCode("src/pages/RecipeDetailPage.tsx");

test("button-role stack pressables are keyboard-operable on web (#237, CodeRabbit PR #243)", () => {
  // A Tamagui stack carrying role="button" is a div: without
  // tabIndex + an Enter/Space handler it announces as a button that
  // the keyboard cannot reach. The MealPlansPage rows set the
  // pattern; the AiSessionPage Cancel control and the
  // RecipeDetailPage Custom scale chip must follow it.
  assert.match(aiSession, /onKeyDown=\{handleCancelKeyDown\}/);
  assert.match(aiSession, /tabIndex=\{0\}/);
  // The scale control is no longer a page-level stack pressable:
  // PresetValueSelector's Custom slot is a DS Button.
  assert.ok(!recipeDetail.includes("handleCustomScaleKeyDown"), "the scale pressable retired");
  assert.match(recipeDetail, /<PresetValueSelector/);
});

test("busy Cancel is keyboard-guarded and the Custom scale name carries the multiplier (#237)", () => {
  // pointerEvents="none" does not stop key events on a focused
  // control, so the Cancel handler must refuse activation while busy
  // and the control must expose its disabled state.
  assert.match(aiSession, /if \(busy\) return;/);
  assert.match(aiSession, /accessibilityState: \{ disabled: busy \}/);
  // The press path shares the busy guard: an assistive-technology
  // virtual click can reach onPress despite pointerEvents="none"
  // (CodeRabbit finding on PR #241).
  assert.match(aiSession, /onPress=\{handleCancel\}/);
  assert.match(aiSession, /const handleCancel = \(\) => \{\s+if \(busy\) return;/);
  // The selected custom-scale button shows the multiplier as its visible
  // text; the accessible name must include it (composed in the selector).
  assert.match(recipeDetail, /customAccessibilityLabel="Custom scale"/);
  assert.match(
    recipeDetail,
    /formatCustomValue=\{\(custom\) => `\$\{formatScaleValue\(custom\)\}×`\}/,
  );
  const selector = readCode("src/components/PresetValueSelector.tsx");
  assert.match(selector, /`\$\{customAccessibilityLabel\} \$\{formattedCustom\}`/);
});
