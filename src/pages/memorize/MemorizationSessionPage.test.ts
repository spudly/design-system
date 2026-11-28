/**
 * Contract test for MemorizationSessionPage
 * (spudly/design-system#49).
 *
 * Converted from source scans to runtime checks in #733
 * tranche 6a: the page is called directly and the element
 * tree it returns is inspected — the shell, the BackLink
 * wired to onBack, the reference heading, the round hint
 * composed from the round view-model, the StepDots driven
 * by the same numbers, the passage as VerseText in a Card
 * with BlankWord blanks reporting their word index, the
 * warning feedback alert, and the advance button whose
 * label switches on the final round ARE the rendered
 * contract, observable without reading source. Absences
 * that are rendered behavior (no loading/complete state, no
 * ProgressBar, no End session, no text entry) are asserted
 * on the returned tree. The former prop-type pins, the
 * blank-ordinal implementation scan (#135's precompute
 * shape — its observable effect, each blank's ordinal and
 * total, is asserted on the BlankWord props instead),
 * barrel-as-source-text, and story pins were deleted:
 * type shape is enforced by the TypeScript build and story
 * coverage by the story-parity tests (Stephen, 2026-11-20).
 * The dist `.d.ts` read below is a built-artifact read, not
 * a source read, and stays.
 */
import "../../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { loadInternalDist } from "../../../test/internalDist.js";

const here = dirname(fileURLToPath(import.meta.url));

async function loadPage() {
  const dist: Record<string, any> = await loadInternalDist();
  const shell: Record<string, any> = await import("../../../dist/widgets/content/BigFooter.js");
  const page: Record<string, any> =
    await import("../../../dist/pages/memorize/MemorizationSessionPage.js");
  return { ...dist, BigFooterShell: shell.BigFooterShell, ...page };
}

function screenChildren(tree: any): any[] {
  const screen = tree.props.children;
  const children = screen.props.children;
  return Array.isArray(children) ? children : [children];
}

function textOf(element: any): string {
  const children = element.props.children;
  return (Array.isArray(children) ? children : [children]).map(String).join("");
}

const WORDS = [
  { text: "For" },
  { text: "God", blank: { revealed: false } },
  { text: "so" },
  { text: "loved", blank: { revealed: true } },
];

function readyProps(overrides: Record<string, any> = {}) {
  return {
    state: "ready",
    reference: "John 3:16",
    roundIndex: 1,
    roundCount: 3,
    words: WORDS,
    isFinalRound: false,
    onBack: () => { /* noop */ },
    onBlankReveal: (_i: number) => { /* noop */ },
    onAdvance: () => { /* noop */ },
    ...overrides,
  };
}

test("MemorizationSessionPage is exported from the built pages barrel", async () => {
  const { MemorizationSessionPage } = await loadPage();
  assert.equal(typeof MemorizationSessionPage, "function");
  const types = readFileSync(join(here, "../../..", "dist", "pages", "index.d.ts"), "utf8");
  assert.match(types, /MemorizationSessionPage/);
  assert.match(types, /type MemorizationSessionPageProps/);
});

test("the not-found branch renders the missing-verse line and a Back button", async () => {
  const { MemorizationSessionPage, BigFooterShell, ScreenContainer, Text, Button } =
    await loadPage();
  let backs = 0;
  const tree = MemorizationSessionPage({
    state: "not-found",
    onBack: () => {
      backs += 1;
    },
  });
  assert.equal(tree.type, BigFooterShell);
  assert.equal(tree.props.children.type, ScreenContainer);
  const [line, back] = screenChildren(tree);
  assert.equal(line.type, Text);
  assert.equal(line.props.children, "Verse not found.", "the missing-verse line matches the app's");
  assert.equal(back.type, Button);
  assert.equal(back.props.children, "Back");
  back.props.onPress();
  assert.equal(backs, 1, "the not-found Back button fires onBack");
});

test("the drill chrome renders in order: BackLink, heading, hint, dots, card", async () => {
  const { MemorizationSessionPage, BackLink, Text, StepDots, Card } = await loadPage();
  let backs = 0;
  const onBack = () => {
    backs += 1;
  };
  const tree = MemorizationSessionPage(readyProps({ onBack }));
  const children = screenChildren(tree);
  const [backLink, heading, hint, dots, card] = children;
  assert.equal(backLink.type, BackLink, "Back is the shared BackLink (#95)");
  assert.equal(backLink.props.onPress, onBack, "BackLink reports through onBack, not an href");
  assert.equal(backLink.props.href, undefined);
  backLink.props.onPress();
  assert.equal(backs, 1);
  assert.equal(heading.type, Text);
  assert.equal(heading.props.variant, "heading");
  assert.equal(heading.props.children, "John 3:16", "the reference is the heading");
  assert.equal(hint.type, Text);
  assert.equal(hint.props.variant, "hint");
  assert.equal(
    textOf(hint),
    "Round 2 of 3 — tap a blank to peek at the word.",
    "the round hint is composed from the round view-model, as the app's",
  );
  assert.equal(dots.type, StepDots, "the dots are the round indicator");
  assert.equal(dots.props.count, 3);
  assert.equal(dots.props.activeIndex, 1);
  assert.equal(card.type, Card, "the passage renders in a Card, after the indicator");
});

test("the passage renders as VerseText, blanks as BlankWord reporting their word index", async () => {
  const { MemorizationSessionPage, VerseText, Text, BlankWord } = await loadPage();
  const revealed: number[] = [];
  const tree = MemorizationSessionPage(
    readyProps({
      onBlankReveal: (i: number) => {
        revealed.push(i);
      },
    }),
  );
  const card = screenChildren(tree)[4];
  const verseText = card.props.children;
  assert.equal(verseText.type, VerseText, "the passage renders in VerseText");
  const wordEls = verseText.props.children;
  assert.equal(wordEls.length, WORDS.length);
  for (const el of wordEls) assert.equal(el.type, Text, "each word renders as verse text");
  assert.equal(textOf(wordEls[0]), "For ", "a plain word renders its text");
  const firstBlank = wordEls[1].props.children[0];
  assert.equal(firstBlank.type, BlankWord, "a blanked word renders via BlankWord");
  assert.equal(firstBlank.props.word, "God", "a blank carries its word");
  assert.equal(firstBlank.props.revealed, false, "the revealed flag crosses from props");
  assert.equal(firstBlank.props.index, 0, "the first blank's ordinal among the round's blanks");
  assert.equal(firstBlank.props.total, 2, "BlankWord numbers blanks against the round's total");
  firstBlank.props.onReveal();
  assert.deepEqual(revealed, [1], "a blank press reports the word's index in the words array");
  const secondBlank = wordEls[3].props.children[0];
  assert.equal(secondBlank.type, BlankWord);
  assert.equal(secondBlank.props.revealed, true);
  assert.equal(secondBlank.props.index, 1, "the second blank's ordinal");
  secondBlank.props.onReveal();
  assert.deepEqual(revealed, [1, 3]);
});

test("feedback renders as the warning alert only when present; advance label switches on the final round", async () => {
  const { MemorizationSessionPage, Alert, Button } = await loadPage();
  let advances = 0;
  const onAdvance = () => {
    advances += 1;
  };
  const withFeedback = screenChildren(
    MemorizationSessionPage(readyProps({ feedback: "Not quite — try again.", onAdvance })),
  );
  const alert = withFeedback[5];
  assert.equal(alert.type, Alert);
  assert.equal(alert.props.severity, "warning");
  assert.equal(alert.props.children, "Not quite — try again.");
  const advance = withFeedback[6];
  assert.equal(advance.type, Button);
  assert.equal(advance.props.children, "Next round");
  assert.equal(advance.props.variant, "primary", "an ordinary round keeps the primary variant");
  advance.props.onPress();
  assert.equal(advances, 1, "advance fires onAdvance");

  const withoutFeedback = screenChildren(MemorizationSessionPage(readyProps({})));
  assert.equal(withoutFeedback[5], null, "no feedback renders no alert");
  const final = screenChildren(MemorizationSessionPage(readyProps({ isFinalRound: true })));
  assert.equal(
    final[6].props.children,
    "Finish — mark memorized",
    "the advance label switches on the final round, as the app's does",
  );
  assert.equal(
    final[6].props.variant,
    "accent",
    "the final round's completion action takes the accent (mastery) variant (#850)",
  );
});

test("the rendered tree has no demo inventions, loading state, or text entry", async () => {
  const { MemorizationSessionPage } = await loadPage();
  const tree = MemorizationSessionPage(readyProps({ feedback: "retry" }));
  const types: string[] = [];
  const labels: string[] = [];
  const walk = (node: any): void => {
    if ((node === null || node === undefined) || typeof node !== "object") {
      if (typeof node === "string") labels.push(node);
      return;
    }
    if (Array.isArray(node)) {
      for (const child of node) walk(child);
      return;
    }
    if (typeof node.type === "function") types.push(node.type.name);
    walk(node.props?.children);
  };
  walk(tree);
  for (const banned of ["ProgressBar", "Spinner", "TextField", "TextInput", "FlatList"]) {
    assert.ok(!types.includes(banned), `the drill must not render a ${banned}`);
  }
  assert.ok(!labels.includes("End session"), "there is no end-session action");
});
