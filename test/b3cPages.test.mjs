import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * Contract tests for the #126 (B3c) page batch: Eciperay's
 * account, auth, and remaining flows. Source-scan style, like
 * the earlier page batches (recipeFormPages, mealPages): the
 * batch's load-bearing properties are what the pages import,
 * which props cross the boundary, and what must NOT cross it.
 *
 * The security rule for this batch (issue #126): auth/profile
 * secrets and token handling are business logic and stay
 * app-side — DS pages receive display state and callbacks
 * only. So every page here is pinned to "no app imports, no
 * data layer", the auth pages pin the auth shell + secure
 * entry, and the token section pins the display-state-only
 * contract (no SecretRevealPanel adoption — proposals on #126,
 * option A shipped; the created-secret panel is its own).
 */

const page = (name) => readFileSync(`src/pages/${name}.tsx`, "utf8");
const component = (name) => readFileSync(`src/components/${name}.tsx`, "utf8");

const B3C_PAGES = [
  "SignInPage",
  "SignUpPage",
  "ForgotPasswordPage",
  "ResetPasswordPage",
  "ProfilePage",
  "ImportTextPage",
  "ImportUrlPage",
  "ImportImagePage",
  "ImportReviewPage",
  "HomePage",
  "TagsPage",
  "FeedbackPage",
  "AddRecipeMenuPage",
  "AiSessionPage",
];

test("every B3c page is exported from the pages barrel", () => {
  const barrel = readFileSync("src/pages/index.ts", "utf8");
  for (const name of B3C_PAGES) {
    assert.match(barrel, new RegExp(String.raw`export \{[^}]*\b${name}\b`), name);
  }
});

test("B3c pages are controlled views: no data layer, no app imports", () => {
  for (const name of B3C_PAGES) {
    const source = page(name);
    assert.doesNotMatch(source, /@eciperay\//, `${name} imports the app`);
    assert.doesNotMatch(
      source,
      /useMutation|useQuery|fetch\(|AsyncStorage/,
      `${name} reaches for the data layer`,
    );
  }
});

test("B3c pages never set a font-size-derived lineHeight (#162)", () => {
  for (const name of B3C_PAGES) {
    assert.doesNotMatch(page(name), /lineHeight/, name);
  }
});

test("auth pages use the DS auth shell and secure password entry", () => {
  for (const name of ["SignInPage", "SignUpPage", "ForgotPasswordPage", "ResetPasswordPage"]) {
    const source = page(name);
    assert.match(source, /variant="auth"/, `${name} renders the auth shell`);
  }
  // Since #119 the password fields live in the pages' form units
  // (the extracted form components) — the masking pin follows
  // the fields there.
  for (const name of ["SignInForm", "SignUpForm", "ResetPasswordForm"]) {
    assert.match(component(name), /secureTextEntry/, `${name} masks the password`);
  }
  // The reset token is app-side business logic: it never
  // crosses the DS boundary, not even as a prop — neither on
  // the page nor on its form unit.
  assert.doesNotMatch(page("ResetPasswordPage"), /\btoken\??:/);
  assert.doesNotMatch(component("ResetPasswordForm"), /\btoken\??:/);
});

test("SignUpForm footer block is consistently centered (eciperay#294)", () => {
  // The host renders its legal notice centered in the legalNotice
  // slot; the sign-in link that follows it in the same footer
  // block must carry the same alignment or the block reads as
  // two mismatched columns. Since #119 the block lives in the
  // SignUpForm unit the page composes, and the separation is
  // the form's own field rhythm — the pin follows the rendered
  // shape that carries the centering today.
  const source = component("SignUpForm");
  assert.match(
    source,
    /<TextLink textAlign="center" href={signInHref}>\s*Already have an account\? Sign in/,
    "the sign-in footer link is center-aligned like the legal notice above it (and a link since #248)",
  );
  assert.doesNotMatch(
    source,
    /<TextLink[^>]*\bmargin/,
    "the sign-in footer link carries no margin prop (#209)",
  );
});

test("auth pages report bare intents; no credentials logic in the DS", () => {
  for (const name of ["SignInPage", "SignUpPage", "ForgotPasswordPage", "ResetPasswordPage"]) {
    const source = page(name);
    assert.match(source, /onSubmit: \(\) => void/, `${name} submits a bare intent`);
    assert.doesNotMatch(
      source,
      /\b(?:signIn|signUp|resetPassword)\s*\(|requestPasswordReset/,
      name,
    );
  }
  // #248: the auth pages' cross-links navigate, so they cross as
  // href props and render in TextLink's href form — no press
  // callbacks for navigation remain on these pages.
  assert.match(page("SignInPage"), /signUpHref\?: string;/);
  assert.match(page("SignInPage"), /forgotPasswordHref\?: string;/);
  assert.match(page("SignUpPage"), /signInHref\?: string;/);
  assert.match(page("ForgotPasswordPage"), /signInHref\?: string;/);
});

test("auth cross-links render their href destinations (#248)", () => {
  // The declarations alone don't prove the destinations reach
  // the rendered links — pin the rendered forms too (SignUpForm's
  // is pinned by the footer test above), and pin that no
  // navigation press callback survives on these pages. Since
  // #119 the links render in the pages' form units, and the
  // de-emphasized destinations take TextLink's muted tone (the
  // app link button's muted variant) instead of a hard-coded
  // gray — the pins follow the links into the forms.
  assert.match(
    component("SignInForm"),
    /<TextLink href=\{signUpHref\}>Create an account<\/TextLink>/,
  );
  assert.match(component("SignInForm"), /<TextLink tone="muted" href=\{forgotPasswordHref\}>/);
  assert.match(component("ForgotPasswordForm"), /<TextLink tone="muted" href=\{signInHref\}>/);
  for (const name of ["SignInPage", "SignUpPage", "ForgotPasswordPage"]) {
    assert.doesNotMatch(
      page(name),
      /onSignUpPress|onForgotPasswordPress|onSignInPress|onBackPress/,
      `${name} must not keep a navigation press callback (#248)`,
    );
  }
});

test("ProfilePage exposes the section and legal slots in the app view's order", () => {
  const source = page("ProfilePage");
  for (const slot of [
    "sectionsBeforeFeedback",
    "feedbackPreference",
    "sectionsAfterFeedback",
    "legalLinks",
  ]) {
    assert.match(source, new RegExp(String.raw`${slot}\?:`), `${slot} is a prop`);
  }
  const feedbackAt = source.indexOf("{feedbackPreference}");
  const beforeAt = source.indexOf("{sectionsBeforeFeedback}");
  const afterAt = source.indexOf("{sectionsAfterFeedback}");
  assert.ok(beforeAt !== -1 && beforeAt < feedbackAt && feedbackAt < afterAt, "slot order");
  // Sign out is a bare intent; the session teardown is app-side.
  assert.match(source, /onSignOut: \(\) => void/);
});

test("AccessTokensPanel renders display state only, via the DS TokenRow", () => {
  const source = component("AccessTokensPanel");
  const barrel = readFileSync("src/components/index.ts", "utf8");
  assert.match(barrel, /AccessTokensPanel/);
  assert.match(source, /TokenRow/, "rows render through the DS TokenRow");
  assert.match(source, /metaLabel: string/, "dates cross pre-formatted");
  // Proposals on #126, option A: the created-secret panel is
  // this section's own — it does NOT adopt SecretRevealPanel.
  assert.doesNotMatch(source, /SecretRevealPanel\.js/);
  // No token handling: create/revoke are bare intents.
  assert.match(source, /onCreate: \(\) => void/);
  assert.match(source, /onRevoke: \(id: string\) => void/);
  assert.doesNotMatch(source, /useMutation|useQuery|fetch\(|@eciperay\//);
});

test("NutritionGoalsForm crosses whole-goals values, numbers or null", () => {
  const source = component("NutritionGoalsForm");
  const barrel = readFileSync("src/components/index.ts", "utf8");
  assert.match(barrel, /NutritionGoalsForm/);
  assert.match(source, /onChange: \(goals: NutritionGoalsValues\) => void/);
  assert.match(source, /number \| null/);
  assert.doesNotMatch(source, /useMutation|useQuery|fetch\(|@eciperay\//);
});

test("ImportTextPage holds the batch's one documented local-state exception", () => {
  const source = page("ImportTextPage");
  assert.match(source, /useState\(""\)/, "the textarea state stays local");
  assert.match(source, /onSubmit: \(text: string\) => void/, "text crosses only at submit");
});

test("ImportReviewPage takes the preview as a slot, not a renderer import", () => {
  const source = page("ImportReviewPage");
  assert.match(source, /preview: ReactNode/);
  assert.doesNotMatch(source, /RecipeInputPreview\.js/);
});

test("AiSessionPage splits view from session logic", () => {
  const source = page("AiSessionPage");
  // No app phase type and no API object crosses the boundary.
  assert.doesNotMatch(source, /TweakAiPhase|AiSessionFlowApi|flowApi|\bapi:/);
  // The session crosses as a view-model with stage booleans.
  assert.match(source, /canRefine: boolean/);
  assert.match(source, /canCancel: boolean/);
  assert.match(source, /phaseLabel: string/);
  // The preview is a slot; the intents are bare.
  assert.match(source, /preview\?: ReactNode/);
  assert.match(source, /onStart: \(prompt: string\) => void/);
  assert.match(source, /onApprovePlan: \(\) => void/);
  assert.match(source, /onFinalize: \(\) => void/);
});

test("HomePage renders rows through the host slot and copy through props", () => {
  const source = page("HomePage");
  assert.match(source, /renderRecipeRow: \(recipe: HomePageRecipe\) => ReactNode/);
  assert.match(source, /emptyMessage: string/, "copy crosses as props");
  assert.doesNotMatch(source, /RecipeListCard\.js|CookLogForm\.js/);
});

test("TagsPage takes its palette as a prop and renders DS Badges as colored tags", () => {
  const source = page("TagsPage");
  // #207: the palette crosses as tag color token names, not raw hexes.
  assert.match(source, /colorOptions: TagColorName\[\]/);
  // Since the #119 de-styling the rows render through
  // BadgeCardRow: the page passes the tag's name and color name
  // as the badge's data (Badge's `color` is a style-named prop,
  // which pages may not set), and the row renders the Badge.
  assert.match(source, /badgeLabel=\{tag\.name\}/);
  assert.match(source, /badgeColor=\{tag\.color\}/);
  assert.match(component("BadgeCardRow"), /<Badge color=\{badgeColor\}>\{badgeLabel\}<\/Badge>/);
  assert.match(source, /ColorPickerField/);
});

test("TagsPage supports inline rename through a controlled edit draft (eciperay#254)", () => {
  const source = page("TagsPage");
  // The edit draft is controlled like the create form, in token names.
  assert.match(source, /editingTagId\?: string \| null/);
  assert.match(source, /editName\?: string/);
  assert.match(source, /editColor\?: TagColorName/);
  assert.match(source, /onStartEdit\?: \(tag: TagsPageTag\) => void/);
  assert.match(source, /onEditNameChange\?: \(value: string\) => void/);
  assert.match(source, /onEditColorChange\?: \(value: TagColorName\) => void/);
  // #374: save-edit reports failure through its result, like create/delete.
  assert.match(source, /onSaveEdit\?: \(\) => TagsPageOperationResult/);
  assert.match(source, /onCancelEdit\?: \(\) => void/);
  // The row offers an accessible Edit action and the editor a Save action.
  // Since #119 the Edit action crosses as BadgeCardRow action
  // data, so its label is composed in an object property.
  assert.match(source, /accessibilityLabel: `Edit tag \$\{tag\.name\}`/);
  assert.match(source, /accessibilityLabel="Save"/);
});

test("FeedbackPage is fully controlled; validation crosses as a boolean", () => {
  const source = page("FeedbackPage");
  assert.match(source, /submitDisabled\?: boolean/);
  assert.doesNotMatch(source, /useAnalytics|useAuth|validateUserFeedback|APP_VERSION/);
});

test("FeedbackPage fields carry explicit accessible names", () => {
  // The fields' visible labels associate on web through their
  // Label elements; the native accessible names cross explicitly,
  // as the email field's always has.
  const source = page("FeedbackPage");
  assert.match(source, /accessibilityLabel="What's on your mind\?"/);
  assert.match(source, /accessibilityLabel="Email me back \(optional\)"/);
});
