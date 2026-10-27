/**
 * Contract test for MemorizationSessionPage
 * (spudly/design-system#49).
 *
 * MemorizationSessionPage is the design-system port of the
 * Memorize app's drill screen (DrillScreen in spudly/memorize
 * packages/app), and its structure is the contract this test
 * guards in source:
 * 1. The props are a state union of exactly the states the
 *    app screen renders: `{ state: "not-found" }` (its
 *    missing-verse branch) and the ready props. The absence
 *    of "loading" and "complete" members is pinned — the app
 *    gates on its store above the screen, and finishing the
 *    final round navigates away, so the screen renders
 *    neither state.
 * 2. The component is fully controlled: it holds no state,
 *    imports no session engine, and derives nothing but
 *    blank ordinals from its props. Tokenizing, blank
 *    selection, grading, peek counting, and persistence stay
 *    app-side in @memorize/core.
 * 3. The drill surface matches the real screen, not the #44
 *    demo: the shared BackLink (#95 — it replaced the inline
 *    ghost "← Back" Button, whose arrow glyph sat at the
 *    bottom of the line on Android), reference heading, the
 *    round hint above a StepDots indicator, the passage as
 *    VerseText in
 *    a Card with BlankWord blanks, the warning feedback
 *    alert, and the advance button. The demo's ProgressBar
 *    and "End session" button do not exist on the real
 *    screen and must not appear.
 * 4. There is no text entry: the drill's only in-verse
 *    interaction is revealing a blank. A blank press reports
 *    the word's index in the words array (onBlankReveal),
 *    and the feedback string is pre-composed by the app (its
 *    peek/blank counts are engine numbers).
 * 5. There is deliberately no app-content render slot: every
 *    element is a DS primitive over view-model data, and the
 *    drill's one interactive primitive (BlankWord) is
 *    already a DS component.
 * 6. The component is exported from the pages subpath
 *    index, and stories exercise the FirstRound, MidSession,
 *    RetryFeedback, FinalRound, and NotFound states so
 *    Chromatic captures them.
 *
 * This is a source scan, not a render test: the repo has no
 * JS renderer for these components (Chromatic screenshots in
 * CI), and the invariant is a per-literal property of the
 * source (same rationale as
 * test/mealPlanDetailPage.test.mjs). Comments are
 * stripped before scanning so prose cannot satisfy — or,
 * for the pinned absences, accidentally trip — the patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pagesDir = join(here, "..", "src", "pages");
const source = readFileSync(join(pagesDir, "MemorizationSessionPage.tsx"), "utf8");
const stories = readFileSync(join(pagesDir, "MemorizationSessionPage.stories.tsx"), "utf8");
const index = readFileSync(join(pagesDir, "index.ts"), "utf8");

// Strip block and line comments so documented patterns in
// prose cannot pass the scan.
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("MemorizationSessionPage source is readable and non-trivial", () => {
  assert.ok(code.length > 1000, "expected the full MemorizationSessionPage source");
  assert.match(code, /export function MemorizationSessionPage/);
});

test("the props are a not-found | ready union, with no loading or complete member", () => {
  assert.match(code, /export type MemorizationSessionPageProps =/);
  assert.match(
    code,
    /\{ state: "not-found"; onBack: \(\) => void \}/,
    "the not-found member carries its own Back intent (its branch renders a Back button)",
  );
  assert.match(
    code,
    /\| MemorizationSessionPageReadyProps;/,
    "the ready member is the drill props",
  );
  assert.match(
    code,
    /props\.state === "not-found"/,
    "the not-found branch must key off the state union",
  );
  assert.match(
    code,
    /<Text>Verse not found\.<\/Text>/,
    "the missing-verse line must match the app's",
  );
  assert.doesNotMatch(
    code,
    /state: "loading"|Spinner/,
    "the app screen renders no loading state — the union must not invent one",
  );
  assert.doesNotMatch(
    code,
    /state: "complete"|state: "completed"/,
    "finishing navigates away — there is no rendered complete state",
  );
});

test("the component is fully controlled — no state, no engine", () => {
  assert.doesNotMatch(
    code,
    /useState|useReducer|useRef/,
    "round, revealed blanks, and feedback live app-side and cross as props",
  );
  assert.doesNotMatch(
    code,
    /@memorize\/core|BLANK_FRACTIONS|blankedIndices|gradeRound|tokenize/,
    "the session engine (blanking, grading, tokenizing) stays app-side",
  );
});

test("the shell is the scrolling ScreenContainer, with no FlatList", () => {
  assert.match(code, /<ScreenContainer>/, "the page must render in the page shell");
  assert.doesNotMatch(code, /<FlatList/, "the passage is a single text block — no virtualization");
});

test("the view-model and callback contract matches the declared props", () => {
  assert.match(code, /reference: string;/);
  assert.match(code, /roundIndex: number;/);
  assert.match(code, /roundCount: number;/);
  assert.match(code, /words: MemorizationSessionPageWord\[\];/);
  assert.match(code, /feedback\?: string \| null;/);
  assert.match(code, /isFinalRound: boolean;/);
  assert.match(code, /onBack: \(\) => void;/);
  assert.match(code, /onBlankReveal: \(wordIndex: number\) => void;/);
  assert.match(code, /onAdvance: \(\) => void;/);
  assert.match(code, /text: string;/);
  assert.match(code, /revealed: boolean;/);
});

test("the drill chrome matches the app screen, in render order", () => {
  assert.match(code, /<BackLink onPress=\{onBack\} \/>/, "Back is the shared BackLink (#95)");
  assert.doesNotMatch(
    code,
    /←/,
    "the arrow is BackLink's drawn icon — the ← text glyph sat at the bottom of the line on Android (#95)",
  );
  assert.match(
    code,
    /<Text variant="heading">\{reference\}<\/Text>/,
    "the reference is the heading",
  );
  assert.match(
    code,
    /Round \{roundIndex \+ 1\} of \{roundCount\} — tap a blank to peek at the word\./,
    "the round hint copy must match the app's, composed from the round view-model",
  );
  assert.match(
    code,
    /<StepDots count=\{roundCount\} activeIndex=\{roundIndex\} \/>/,
    "the dots are the round indicator, driven by the same numbers",
  );
  const backAt = code.indexOf("<BackLink");
  const dotsAt = code.indexOf("<StepDots");
  const cardAt = code.indexOf("<Card>");
  assert.ok(backAt !== -1 && dotsAt !== -1 && cardAt !== -1, "chrome elements must be present");
  assert.ok(backAt < dotsAt && dotsAt < cardAt, "order: Back, then round indicator, then the card");
});

test("the passage renders as VerseText in a Card, blanks as BlankWord", () => {
  assert.match(code, /<VerseText>/, "the passage renders in VerseText");
  assert.match(code, /<BlankWord/, "blanked words render via BlankWord");
  assert.match(code, /word=\{word\.text\}/, "a blank carries its word (sizing + revealed text)");
  assert.match(code, /revealed=\{word\.blank\.revealed\}/, "the revealed flag crosses from props");
  assert.match(
    code,
    /onReveal=\{\(\) => onBlankReveal\(i\)\}/,
    "a blank press must report the word's index in the words array",
  );
  assert.match(code, /total=\{blankCount\}/, "BlankWord numbers blanks against the round's total");
});

test("blank ordinals are precomputed before the render map, never mutated during render (#135)", () => {
  assert.match(
    code,
    /const blankOrdinals = words\.map\(/,
    "ordinals come from a first pass over the words, before rendering",
  );
  assert.match(
    code,
    /const ordinal = blankOrdinals\[i\]/,
    "each BlankWord reads its precomputed ordinal",
  );
  assert.doesNotMatch(
    code,
    /blankOrdinal \+=|blankOrdinal\+\+/,
    "no counter may be mutated inside the render map (the immutability diagnostic's target pattern)",
  );
});

test("the feedback alert and advance action match the app screen", () => {
  assert.match(
    code,
    /\{feedback \? <Alert severity="warning">\{feedback\}<\/Alert> : null\}/,
    "feedback renders as the warning alert, only when present",
  );
  assert.match(
    code,
    /isFinalRound \? "Finish — mark memorized" : "Next round"/,
    "the advance label must switch on the final round, as the app's does",
  );
  assert.match(code, /<Button onPress=\{onAdvance\}>/, "advance is the primary button");
});

test("the #44 demo's inventions are absent — no ProgressBar, no End session", () => {
  assert.doesNotMatch(code, /ProgressBar/, "the real screen's only progress indicator is StepDots");
  assert.doesNotMatch(
    code,
    /End session/,
    "the session ends by finishing or by Back — there is no end-session action",
  );
});

test("there is no text entry — revealing a blank is the only in-verse interaction", () => {
  assert.doesNotMatch(
    code,
    /TextField|TextInput|onChangeText/,
    "the drill has no typed input; peeking is the interaction",
  );
});

test("there is deliberately no app-content render slot", () => {
  assert.doesNotMatch(
    code,
    /render\w+\?:/,
    "a render slot must be a conscious contract change (see the header audit), not drift",
  );
  assert.doesNotMatch(
    code,
    /ReactNode/,
    "MemorizationSessionPage takes no ReactNode props — every element is a DS primitive",
  );
});

test("the component is exported from the pages subpath index", () => {
  assert.match(index, /MemorizationSessionPage/);
  assert.match(index, /type MemorizationSessionPageProps/);
  assert.match(index, /from "\.\/MemorizationSessionPage\.js"/);
});

test("stories exercise the session's main states", () => {
  for (const name of ["FirstRound", "MidSession", "RetryFeedback", "FinalRound", "NotFound"]) {
    assert.match(
      stories,
      new RegExp(`export const ${name}`),
      `MemorizationSessionPage.stories.tsx must export a ${name} story`,
    );
  }
  assert.match(
    stories,
    /light_quietDawn/,
    "stories must pin the Quiet Dawn theme (Memorize's brand)",
  );
});
