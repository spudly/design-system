/**
 * Contract tests for #329 (Stephen's decision, Option B): form-level
 * errors are announced to screen readers by rendering them through
 * the Alert component with severity "error" — Alert's error severity
 * carries the assertive alert role (pinned in Alert.test.ts) —
 * instead of a plain error-variant Text line with no live-region
 * semantics.
 *
 * The pins:
 * - every DS form component with a form-level `error` prop renders
 *   it through Alert (NutritionGoalsForm and the four auth forms),
 *   as does AccessTokensPanel for its panel-level operation error;
 * - every page-level error line of the same shape (an `error` /
 *   `submitError` prop rendered as plain error Text) goes through
 *   Alert too;
 * - no in-scope file still renders its form-level error as plain
 *   error-variant Text;
 * - field-level errors were originally untouched by #329: they
 *   kept their id wiring (LabeledField / the field components).
 * - exception (#472): ColorPickerField's field error rendered
 *   through Alert, keeping its errorId on the Alert so the
 *   swatch group's aria-describedby wiring is unchanged.
 * - #804 (Stephen, 2026-11-24) supersedes the field-level
 *   exemption: EVERY field-level error now renders through the
 *   shared FieldError (an Alert at error severity), keeping its
 *   errorId wiring — the #472 treatment generalized to all
 *   controls. The pins below record that contract.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

const ERROR_ALERT = '<Alert severity="error" message={error} />';

// #438 Part 2: the form fragments the pages share live in
// src/views; the auth forms joined them as views in #470.
const VIEW_FORM_COMPONENTS = new Set([
  "NutritionGoalsForm",
  "AccessTokensPanel",
  "SignInForm",
  "SignUpForm",
  "ForgotPasswordForm",
  "ResetPasswordForm",
]);
// Form-category widgets live in src/widgets/form since #710;
// TextAreaField joined them in #748.
const FORM_CATEGORY_COMPONENTS = new Set([
  "SelectField",
  "ColorPickerField",
  "TextField",
  "TextAreaField",
  "CheckboxField",
  "FieldShell",
  "NumberStepper",
  "RatingForm",
]);
const formSource = (name: string) =>
  read(
    `src/${VIEW_FORM_COMPONENTS.has(name) ? "views/eciperay" : FORM_CATEGORY_COMPONENTS.has(name) ? "widgets/form" : "widgets"}/${name}.tsx`,
  );

const FORM_COMPONENTS = [
  "NutritionGoalsForm",
  "SignInForm",
  "SignUpForm",
  "ForgotPasswordForm",
  "ResetPasswordForm",
  "AccessTokensPanel",
];

const ERROR_PAGES = [
  "AiSessionPage",
  "FeedbackPage",
  "ImportImagePage",
  "ImportReviewPage",
  "ImportTextPage",
  "ImportUrlPage",
  "MealFormPage",
  "MealPlanFormPage",
];

test("form components render their form-level error through Alert (assertive)", () => {
  // The four auth forms render their error through the shared
  // AuthFormSubmit tail since the #587 phase-2 dedupe — the tail
  // carries the Alert rendering for them.
  const authFormSubmit = read("src/views/eciperay/AuthFormSubmit.tsx");
  assert.ok(
    authFormSubmit.includes(ERROR_ALERT),
    `AuthFormSubmit renders its error via Alert severity="error"`,
  );
  for (const name of FORM_COMPONENTS) {
    const source = formSource(name);
    assert.ok(
      source.includes(ERROR_ALERT) ||
        (source.includes("<AuthFormSubmit") && source.includes("error={error}")),
      `${name} renders its error via Alert severity="error"`,
    );
    assert.doesNotMatch(
      source,
      /<Text variant="error">\{error\}<\/Text>/,
      `${name} no longer renders its form-level error as plain error Text`,
    );
  }
});

test("page-level error lines of the same shape render through Alert", () => {
  for (const name of ERROR_PAGES) {
    const source = read(`src/pages/eciperay/${name}.tsx`);
    assert.ok(source.includes(ERROR_ALERT), `${name} renders its error via Alert severity="error"`);
    assert.doesNotMatch(
      source,
      /<Text variant="error">\{error\}<\/Text>/,
      `${name} no longer renders its error as plain error Text`,
    );
  }
});

test("AiSessionPage and RecipeFormPage pin their extra error regions", () => {
  // AiSessionPage renders its error in BOTH branches (no-session and
  // active-session); pin each region so deleting one line can't pass.
  const aiSession = read("src/pages/eciperay/AiSessionPage.tsx");
  const noSessionStart = aiSession.indexOf("if (!session) {");
  const activeSessionStart = aiSession.indexOf("\n  return (", noSessionStart);
  assert.notEqual(noSessionStart, -1, "AiSessionPage has a no-session branch");
  assert.notEqual(activeSessionStart, -1, "AiSessionPage has an active-session branch");
  assert.ok(
    aiSession.slice(noSessionStart, activeSessionStart).includes(ERROR_ALERT),
    "AiSessionPage renders its error via Alert in the no-session branch",
  );
  assert.ok(
    aiSession.slice(activeSessionStart).includes(ERROR_ALERT),
    "AiSessionPage renders its error via Alert in the active-session branch",
  );
  const recipeForm = read("src/pages/eciperay/RecipeFormPage.tsx");
  assert.ok(
    recipeForm.includes('<Alert severity="error" message={submitError} />'),
    'RecipeFormPage renders its submitError via Alert severity="error"',
  );
  assert.doesNotMatch(
    recipeForm,
    /<Text variant="error">\{submitError\}<\/Text>/,
    "RecipeFormPage no longer renders submitError as plain error Text",
  );
});

test("field-level errors render through the shared FieldError with their id wiring (#804)", () => {
  for (const name of ["TextField", "TextAreaField", "SelectField", "CheckboxField"]) {
    const source = formSource(name);
    assert.match(
      source,
      /<FieldError error=\{error\} id=\{errorId\} \/>/,
      `${name} renders its field error through FieldError with the errorId wiring`,
    );
    assert.doesNotMatch(
      source,
      /<Text variant="error" id=\{errorId\}>/,
      `${name} no longer renders its field error as plain error Text`,
    );
  }
});

test("ColorPickerField renders its field error through FieldError, keeping the errorId wiring (#472, generalized by #804)", () => {
  // Stephen's #472 directive first moved ColorPickerField's field
  // error into an Alert (which announces it), with the errorId so
  // the swatch group's aria-describedby still resolves; #804
  // generalizes that treatment to every control through the
  // shared FieldError, which is the Alert rendering.
  const source = formSource("ColorPickerField");
  assert.ok(
    source.includes("<FieldError error={error} id={errorId} />"),
    "ColorPickerField renders its error via FieldError (the Alert treatment) with the errorId",
  );
  assert.doesNotMatch(
    source,
    /<Text variant="error" id=\{errorId\}>/,
    "ColorPickerField no longer renders its field error as plain error Text",
  );
  const fieldError = read("src/widgets/form/FieldError.tsx");
  assert.ok(
    fieldError.includes('<Alert severity="error" message={error}'),
    "FieldError is the Alert rendering the field errors share (#804)",
  );
});
