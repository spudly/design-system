/**
 * Contract test for the Text variants added by the #119
 * foundation (spudly/design-system#119): the remaining pages'
 * hand-applied text treatments that recur identically —
 *
 * - `label`, the section eyebrow (xs semibold, uppercase,
 *   letter-spaced, muted ink): RecipeDetailPage (twice, plus its
 *   "Per Serving" heading), PublicRecipePage, and AiSessionPage
 *   each hand-style it from the same values. The ink is the
 *   theme's `$textMuted` role (the `hint` variant's treatment):
 *   the pages' raw gray6 equals it in light themes, but only the
 *   role follows the dark theme's lightened muted step, so the
 *   eyebrow keeps AA contrast on dark backgrounds.
 * - `formTitle`, the form-flow page title (2xl bold): the six
 *   FormScreenLayout pages (ImportTextPage, ImportUrlPage,
 *   ImportReviewPage, ImportImagePage, MealFormPage,
 *   MealPlanFormPage) each override `heading` down to exactly
 *   this, because their titles sit inside the form layout rather
 *   than opening a page.
 * - `muted` and `success` (the #119 auth tranche): the auth
 *   pages' intro lines and ProfilePage's account line hand-set
 *   the muted role at body size on the default variant
 *   (ForgotPasswordPage, ResetPasswordPage, ProfilePage), and
 *   FeedbackPage's submitted message hand-set the success color
 *   at small size. The variants own those treatments: `muted`
 *   is the theme's `$textMuted` role at the default body size;
 *   `success` is the success ramp's text step (success8) at
 *   small size — the app form's bare success line.
 *
 * The pins hold the variant definitions to the exact values the
 * pages render today and keep `formTitle` in the level-1 heading
 * group (its SSR semantics are exercised in
 * textHeadingSemantics.test.mjs) while `label` stays a non-heading
 * treatment.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "components", "Text.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("the label variant is the section eyebrow treatment", () => {
  assert.match(
    code,
    /label: \{\s+fontSize: tokens\.typography\.fontSize\.xs,\s+fontWeight: tokens\.typography\.fontWeight\.semibold,\s+letterSpacing: 0\.3,\s+textTransform: "uppercase",\s+color: "\$textMuted",\s+\},/,
  );
});

test("the formTitle variant is the 2xl bold form-flow title", () => {
  assert.match(
    code,
    /formTitle: \{\s+fontSize: tokens\.typography\.fontSize\["2xl"\],\s+fontWeight: tokens\.typography\.fontWeight\.bold,\s+\},/,
  );
});

test("both variants are in the public TextProps union", () => {
  assert.match(code, /"formTitle"/);
  assert.match(code, /"label"/);
});

test("formTitle is a level-1 heading; label carries no heading level", () => {
  assert.match(
    code,
    /variant === "heading" \|\| variant === "title" \|\| variant === "formTitle"/,
    "formTitle must sit in the level-1 heading group",
  );
});

test("the muted variant is the muted role at body size", () => {
  assert.match(code, /muted: \{\s+color: "\$textMuted",\s+\},/);
});

test("the success variant is small text in the success treatment", () => {
  assert.match(
    code,
    /success: \{\s+fontSize: tokens\.typography\.fontSize\.sm,\s+color: tokens\.colors\.success\.success8,\s+\},/,
  );
});

test("muted and success are in the public TextProps union and carry no heading level", () => {
  assert.match(code, /"muted"/);
  assert.match(code, /"success"/);
});
