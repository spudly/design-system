import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  MemorizationSessionPage,
  type MemorizationSessionPageWord,
} from "./MemorizationSessionPage.js";

/**
 * Stories for the real MemorizationSessionPage component
 * (#49) — not a made-up page composition: this renders the
 * same component the Memorize app will consume, driven by
 * fixture props. The #44 Pages/Memorize MemorizationSession
 * demo imagined a ProgressBar, an "End session" button, and
 * a different hint; the real drill screen has none of those
 * — these fixtures mirror the real screen's states instead
 * (see the component header for the inventory).
 *
 * The passage is a short placeholder composed for these
 * stories, not scripture: memorization text is user content
 * in the app, and the fixture only needs the drill's shape —
 * a reference line and a tokenized word list with a blank
 * set per round. Blank sets are fixed index lists (in the
 * app the engine derives them deterministically per verse
 * and round), so every screenshot is deterministic.
 *
 * The frame matches MealPlanDetailPage's stories: a phone
 * viewport (430×844) pinned so Chromatic screenshots are
 * deterministic. Theme pinned to Quiet Dawn, Memorize's
 * brand.
 */
const meta: Meta<typeof MemorizationSessionPage> = {
  title: "Pages/MemorizationSessionPage",
  component: MemorizationSessionPage,
  globals: { theme: "light_quietDawn" },
};

export default meta;
type Story = StoryObj<typeof MemorizationSessionPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <div style={{ width: 430, maxWidth: "100%", height: 844, display: "flex" }}>{children}</div>
  );
}

const passageText =
  "The old lighthouse keeper climbed the spiral stairs each evening, carrying a lantern and a worn notebook, and wrote down the weather before lighting the lamp.";
const passageWords = passageText.split(" ");

function wordsWithBlanks(
  blankIndices: readonly number[],
  revealedIndices: readonly number[] = [],
): MemorizationSessionPageWord[] {
  const blanks = new Set(blankIndices);
  const revealed = new Set(revealedIndices);
  return passageWords.map((text, i) =>
    blanks.has(i) ? { text, blank: { revealed: revealed.has(i) } } : { text },
  );
}

const noop = () => undefined;

export const FirstRound: Story = {
  // Round 1 of 7 blanks nothing — the engine's first round
  // shows the full passage so the user reads it before the
  // cloze begins.
  render: () => (
    <Viewport>
      <MemorizationSessionPage
        state="ready"
        reference="Practice Passage 1"
        roundIndex={0}
        roundCount={7}
        words={wordsWithBlanks([])}
        isFinalRound={false}
        onBack={noop}
        onBlankReveal={noop}
        onAdvance={noop}
      />
    </Viewport>
  ),
};

export const MidSession: Story = {
  // Round 4 of 7: half the words are blanked (13 of 26), and
  // the user has peeked at two of them — they render as plain
  // text among the remaining blanks.
  render: () => (
    <Viewport>
      <MemorizationSessionPage
        state="ready"
        reference="Practice Passage 1"
        roundIndex={3}
        roundCount={7}
        words={wordsWithBlanks([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25], [1, 9])}
        isFinalRound={false}
        onBack={noop}
        onBlankReveal={noop}
        onAdvance={noop}
      />
    </Viewport>
  ),
};

export const RetryFeedback: Story = {
  // The user advanced with too many peeks for the blank
  // count (4 peeks on 9 blanks), so the app holds the round
  // and the feedback alert renders under the card. The four
  // peeked blanks stay revealed — a retry keeps the round's
  // state, as the app keeps it.
  render: () => (
    <Viewport>
      <MemorizationSessionPage
        state="ready"
        reference="Practice Passage 1"
        roundIndex={3}
        roundCount={7}
        words={wordsWithBlanks([2, 4, 6, 9, 12, 16, 19, 21, 24], [2, 6, 12, 21])}
        feedback="Not quite — you peeked 4 time(s) on 9 blank(s). Try the round again."
        isFinalRound={false}
        onBack={noop}
        onBlankReveal={noop}
        onAdvance={noop}
      />
    </Viewport>
  ),
};

export const FinalRound: Story = {
  // Round 7 of 7: nearly every word is blanked (24 of 26)
  // and the advance button becomes the finish action.
  render: () => (
    <Viewport>
      <MemorizationSessionPage
        state="ready"
        reference="Practice Passage 1"
        roundIndex={6}
        roundCount={7}
        words={wordsWithBlanks([
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
        ])}
        isFinalRound={true}
        onBack={noop}
        onBlankReveal={noop}
        onAdvance={noop}
      />
    </Viewport>
  ),
};

export const NotFound: Story = {
  // The app screen's missing-verse branch: a plain line and
  // the primary Back button (not the drill's ghost one).
  render: () => (
    <Viewport>
      <MemorizationSessionPage state="not-found" onBack={noop} />
    </Viewport>
  ),
};
