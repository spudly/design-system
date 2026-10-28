import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

/**
 * Contract tests for RatingForm (#176 — the generic rating
 * form generalized from CookLogForm, which shipped under
 * #126, B3c contract proposals, option A): nothing about the
 * component is specific to cooking or any one app. The
 * load-bearing properties are the generic boundary (the
 * submit view-model carries a plain `rating`, the heading
 * and notes placeholder are props with neutral defaults, no
 * domain vocabulary in the defaults) and the behaviors the
 * original form established (uncontrolled rating/notes,
 * optional rating, toggle-off, trimmed-or-null notes,
 * pending disables Save only, StarRatingInput reuse).
 * Source-scan style, like the other batch tests.
 */

const source = readFileSync("src/components/RatingForm.tsx", "utf8");
const stories = readFileSync("src/components/RatingForm.stories.tsx", "utf8");

test("RatingForm is exported from the components barrel; CookLogForm is gone", () => {
  const barrel = readFileSync("src/components/index.ts", "utf8");
  assert.match(barrel, /export \{[^}]*\bRatingForm\b[^}]*\} from "\.\/RatingForm\.js"/);
  assert.match(barrel, /type RatingFormProps/);
  assert.match(barrel, /type RatingFormValues/);
  assert.doesNotMatch(barrel, /CookLogForm/);
  assert.equal(existsSync("src/components/CookLogForm.tsx"), false);
  assert.equal(existsSync("src/components/CookLogForm.stories.tsx"), false);
});

test("the submit view-model is generic: rating, not a domain field name", () => {
  assert.match(
    source,
    /export interface RatingFormValues \{\n {2}rating: 1 \| 2 \| 3 \| 4 \| 5 \| null;/,
  );
  assert.match(source, /onSubmit: \(values: RatingFormValues\) => void/);
  assert.match(source, /onSubmit\(\{ rating, notes: notes\.trim\(\) \|\| null \}\)/);
  assert.doesNotMatch(source, /authorStarRating/);
  assert.match(source, /onSkip: \(\) => void/);
  assert.match(source, /isPending: boolean/);
});

test("heading and notes placeholder are props with neutral defaults", () => {
  assert.match(source, /title\?: string/);
  assert.match(source, /notesPlaceholder\?: string/);
  assert.match(source, /title = "How did it go\?"/);
  assert.match(source, /notesPlaceholder = "Notes \(optional\)"/);
  assert.match(source, /\{title\}/);
  assert.match(source, /placeholder=\{notesPlaceholder\}/);
  assert.doesNotMatch(source, /from this cook/);
});

test("rating and notes are uncontrolled internal state", () => {
  assert.match(source, /useState<1 \| 2 \| 3 \| 4 \| 5 \| null>\(null\)/);
  assert.match(source, /useState\(""\)/);
  const propsBlock = source.slice(
    source.indexOf("export interface RatingFormProps"),
    source.indexOf("}", source.indexOf("export interface RatingFormProps")),
  );
  assert.doesNotMatch(propsBlock, /(rating|notes)\??:/, "no field values cross as props");
});

test("toggle-off: pressing the current star clears the rating", () => {
  assert.match(source, /current === star \? null/);
  assert.match(source, /value=\{rating \?\? 0\}/);
});

test("defaults: dark variant, Skip secondary label", () => {
  assert.match(source, /variant = "dark"/);
  assert.match(source, /secondaryLabel = "Skip"/);
  assert.match(source, /variant\?: "dark" \| "light"/);
  assert.match(source, /secondaryLabel\?: string/);
});

test("isPending disables Save (half opacity); the secondary action stays live", () => {
  // #235: the Save action's state crosses through
  // platformAccessibilityProps (the helper-call object form), which
  // maps it to aria-disabled on web instead of leaking it as a raw
  // accessibilitystate="[object Object]" attribute.
  assert.match(source, /accessibilityState: \{ disabled: isPending \}/);
  assert.match(source, /opacity=\{isPending \? 0\.5 : 1\}/);
  assert.match(source, /onPress=\{isPending \? undefined : handleSubmit\}/);
  assert.match(source, /onPress=\{onSkip\}/);
});

test("reuses the DS StarRatingInput as-is; no forked star rendering", () => {
  assert.match(source, /import \{ StarRatingInput \} from "\.\/StarRatingInput\.js"/);
  assert.doesNotMatch(source, /★/, "stars come from StarRatingInput, not a local copy");
});

test("no app imports, no data layer, no lineHeight (#162)", () => {
  assert.doesNotMatch(source, /@eciperay\//);
  assert.doesNotMatch(source, /from "react-native"/);
  assert.doesNotMatch(source, /useMutation|useQuery|fetch\(|AsyncStorage/);
  assert.doesNotMatch(source, /lineHeight/);
});

test("stories cover both variants and the custom labels in the shared CSF tree", () => {
  assert.match(stories, /title: "Components\/RatingForm"/);
  assert.match(stories, /export const Dark: Story/);
  assert.match(stories, /export const Light: Story/);
  assert.match(stories, /export const Pending: Story/);
  assert.match(stories, /export const CustomLabels: Story/);
  assert.match(stories, /title="Rate this recipe"/);
});
