/**
 * Contract tests for #329 (Stephen's decision, Option B): form-level
 * errors are announced to screen readers by rendering them through
 * the Alert component with severity "error" — Alert's error severity
 * carries the assertive alert role (pinned in alert.test.mjs) —
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
 * - field-level errors are untouched: they keep their id wiring
 *   (LabeledField / the field components), which is a separate,
 *   already-announced path.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");

const ERROR_ALERT = '<Alert severity="error" message={error} />';

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
  for (const name of FORM_COMPONENTS) {
    const source = read(`src/components/${name}.tsx`);
    assert.ok(source.includes(ERROR_ALERT), `${name} renders its error via Alert severity="error"`);
    assert.doesNotMatch(
      source,
      /<Text variant="error">\{error\}<\/Text>/,
      `${name} no longer renders its form-level error as plain error Text`,
    );
  }
});

test("page-level error lines of the same shape render through Alert", () => {
  for (const name of ERROR_PAGES) {
    const source = read(`src/pages/${name}.tsx`);
    assert.ok(source.includes(ERROR_ALERT), `${name} renders its error via Alert severity="error"`);
    assert.doesNotMatch(
      source,
      /<Text variant="error">\{error\}<\/Text>/,
      `${name} no longer renders its error as plain error Text`,
    );
  }
  const recipeForm = read("src/pages/RecipeFormPage.tsx");
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

test("field-level errors keep their id-wired plain Text rendering", () => {
  for (const name of [
    "TextField",
    "TextAreaField",
    "SelectField",
    "CheckboxField",
    "ColorPickerField",
  ]) {
    const source = read(`src/components/${name}.tsx`);
    assert.match(
      source,
      /<Text variant="error" id=\{errorId\}>/,
      `${name} still renders its field error with the errorId wiring`,
    );
  }
});
