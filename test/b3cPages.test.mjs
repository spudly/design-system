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
  for (const name of ["SignInPage", "SignUpPage", "ResetPasswordPage"]) {
    assert.match(page(name), /secureTextEntry/, `${name} masks the password`);
  }
  // The reset token is app-side business logic: it never
  // crosses the DS boundary, not even as a prop.
  assert.doesNotMatch(page("ResetPasswordPage"), /\btoken\??:/);
});

test("auth pages report bare intents; no credentials logic in the DS", () => {
  for (const name of ["SignInPage", "SignUpPage", "ForgotPasswordPage", "ResetPasswordPage"]) {
    const source = page(name);
    assert.match(source, /onSubmit: \(\) => void/, `${name} submits a bare intent`);
    assert.doesNotMatch(source, /signIn|signUp|requestPasswordReset|resetPassword\(/, name);
  }
});

test("ProfilePage exposes the section and legal slots in the app view's order", () => {
  const source = page("ProfilePage");
  for (const slot of ["sectionsBeforeFeedback", "feedbackPreference", "sectionsAfterFeedback", "legalLinks"]) {
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

test("TagsPage takes its palette as a prop and renders DS TagPills", () => {
  const source = page("TagsPage");
  assert.match(source, /colorOptions: string\[\]/);
  assert.match(source, /TagPill/);
  assert.match(source, /ColorPickerField/);
});

test("FeedbackPage is fully controlled; validation crosses as a boolean", () => {
  const source = page("FeedbackPage");
  assert.match(source, /submitDisabled\?: boolean/);
  assert.doesNotMatch(source, /useAnalytics|useAuth|validateUserFeedback|APP_VERSION/);
});
