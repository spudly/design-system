import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * Contract tests for CookLogForm (#126, B3c contract proposals,
 * option A — approved by Stephen 2026-10-26): the standalone DS
 * cook-log form that replaces the copies the app hosts and page
 * slots carried. Source-scan style, like the other batch tests:
 * the load-bearing properties are the boundary (uncontrolled
 * rating/notes inside, only the submit view-model out), the
 * behaviors ported from the app form (optional rating, toggle-
 * off, trimmed-or-null notes, pending disables Save only), and
 * the StarRatingInput reuse (no contract change, no forked
 * stars — the tone/toggle-off/readOnly gaps stay in #159).
 */

const source = readFileSync("src/components/CookLogForm.tsx", "utf8");
const stories = readFileSync("src/components/CookLogForm.stories.tsx", "utf8");

test("CookLogForm is exported from the components barrel", () => {
  const barrel = readFileSync("src/components/index.ts", "utf8");
  assert.match(barrel, /export \{[^}]*\bCookLogForm\b[^}]*\} from "\.\/CookLogForm\.js"/);
  assert.match(barrel, /type CookLogFormProps/);
  assert.match(barrel, /type CookLogFormValues/);
});

test("rating and notes are uncontrolled internal state", () => {
  assert.match(source, /useState<1 \| 2 \| 3 \| 4 \| 5 \| null>\(null\)/);
  assert.match(source, /useState\(""\)/);
  const propsBlock = source.slice(
    source.indexOf("export interface CookLogFormProps"),
    source.indexOf("}", source.indexOf("export interface CookLogFormProps")),
  );
  assert.doesNotMatch(propsBlock, /(rating|notes)\??:/, "no field values cross as props");
});

test("only the submit view-model crosses the boundary", () => {
  assert.match(source, /onSubmit: \(values: CookLogFormValues\) => void/);
  assert.match(
    source,
    /onSubmit\(\{ authorStarRating: rating, notes: notes\.trim\(\) \|\| null \}\)/,
  );
  assert.match(source, /onSkip: \(\) => void/);
  assert.match(source, /isPending: boolean/);
});

test("toggle-off: pressing the current star clears the rating", () => {
  assert.match(source, /current === star \? null/);
  assert.match(source, /value=\{rating \?\? 0\}/);
});

test("defaults match the app form: dark variant, Skip secondary label", () => {
  assert.match(source, /variant = "dark"/);
  assert.match(source, /secondaryLabel = "Skip"/);
  assert.match(source, /variant\?: "dark" \| "light"/);
  assert.match(source, /secondaryLabel\?: string/);
});

test("isPending disables Save (half opacity); the secondary action stays live", () => {
  assert.match(source, /accessibilityState=\{\{ disabled: isPending \}\}/);
  assert.match(source, /opacity=\{isPending \? 0\.5 : 1\}/);
  assert.match(source, /onPress=\{isPending \? undefined : handleSubmit\}/);
  assert.match(source, /onPress=\{onSkip\}/);
});

test("reuses the DS StarRatingInput as-is; no forked star rendering", () => {
  assert.match(source, /import \{ StarRatingInput \} from "\.\/StarRatingInput\.js"/);
  assert.doesNotMatch(source, /★/, "stars come from StarRatingInput, not a local copy");
  assert.doesNotMatch(source, /\btone\s*[=:]/, "no tone prop is introduced (#159 tracks it)");
});

test("no app imports, no data layer, no lineHeight (#162)", () => {
  assert.doesNotMatch(source, /@eciperay\//);
  assert.doesNotMatch(source, /from "react-native"/);
  assert.doesNotMatch(source, /useMutation|useQuery|fetch\(|AsyncStorage/);
  assert.doesNotMatch(source, /lineHeight/);
});

test("stories cover both variants in the shared CSF tree", () => {
  assert.match(stories, /title: "Components\/CookLogForm"/);
  assert.match(stories, /export const Dark: Story/);
  assert.match(stories, /export const Light: Story/);
  assert.match(stories, /export const Pending: Story/);
});
