import { BackLink } from "../components/BackLink.js";
import { BlankWord } from "../components/BlankWord.js";
import { Button } from "../components/Button.js";
import { Card } from "../components/Card.js";
import { Alert } from "../components/Alert.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { StepDots } from "../components/StepDots.js";
import { Text } from "../components/Text.js";
import { VerseText } from "../components/VerseText.js";

/**
 * MemorizationSessionPage (#49): Memorize's memorization
 * session — the word-blanking drill — as a controlled
 * @spudly/ui page component, following the Wave A page ports.
 * The app keeps the entire session engine and drives this view
 * entirely through props: the rendered session surface in,
 * user intents out. Nothing here imports an app package,
 * computes a blank, grades a round, or holds state.
 *
 * Placement: page components live in src/pages behind the
 * `@spudly/ui/pages` subpath export, not the package root —
 * see RecipesPage.tsx for why (react-native imports must stay
 * out of the Node-importable root entry).
 *
 * The screen inventory this mirrors (DrillScreen in
 * spudly/memorize packages/app), in render order: the shared
 * BackLink ("Back", with its drawn arrow — #95), the verse
 * reference as the heading, the
 * round hint ("Round N of M — tap a blank to peek at the
 * word."), a StepDots round indicator, the verse in a Card as
 * VerseText with each blanked word rendered by BlankWord, an
 * optional warning Alert carrying the round's retry
 * feedback, and the advance button ("Next round", or "Finish
 * — mark memorized" on the final round). The drill's chrome
 * around it — the app shell's "Memorize" heading and tab bar —
 * stays app-side, as MealPlansPage's hub chrome did.
 *
 * The #44 Pages/Memorize "MemorizationSession" demo is not
 * this screen: it composes a ProgressBar, a "Session
 * progress" label beside labelled dots, the hint below the
 * text ("Tap a blank to reveal its word."), and an "End
 * session" button — none of which the real screen has. The
 * real drill's only progress indicator is the StepDots row,
 * its hint sits above the card, and the session ends by
 * finishing the final round or by Back. Where the two
 * disagree, the app screen — and this page — win.
 *
 * The drill mechanics, and why the contract is shaped the way
 * it is: the app tokenizes the verse and, per round, blanks a
 * growing fraction of its words (round 0 blanks none — the
 * full text). There is NO text entry anywhere in the drill:
 * the one interaction inside the verse is tapping a hidden
 * blank to peek at its word, and each peek counts against the
 * round — when the user advances, the app grades the round
 * (too many peeks for the blank count = retry), either
 * showing the retry feedback and holding the round, advancing
 * to the next round's larger blank set, or, after the final
 * round, marking the verse memorized and leaving the screen.
 * So:
 *
 * - The session ENGINE stays app-side in @memorize/core and
 *   the app screen: tokenizing, choosing which words blank,
 *   grading, peek counting, round advancement, and
 *   persistence (drill progress is saved on every peek and
 *   round change; completion is recorded on finish). This
 *   component receives only the rendered surface.
 * - The words are the view-model: each word crosses as its
 *   text plus, when blanked this round, its revealed flag —
 *   the same controlled shape as RecipeDetailPage's star
 *   input (current value in props, intent out by callback).
 *   A blank press reports the word's index in the array via
 *   `onBlankReveal(wordIndex)`; the app marks it revealed,
 *   counts the peek, and persists. BlankWord already renders
 *   a revealed blank as plain text with no press surface, so
 *   the callback fires only for hidden blanks — the app's
 *   peek guard, carried by the primitive.
 * - Round progress is numeric view-model (`roundIndex`,
 *   `roundCount`) because StepDots needs the numbers; the
 *   hint line that repeats them is fixed UI copy composed
 *   here from those numbers, verbatim as the app renders it
 *   — the same treatment as the sibling pages' baked-in copy
 *   (MealPlansPage's empty state, MealPlanDetailPage's
 *   set-goals hint). The advance button's label is likewise a
 *   pure function of the view-model (`isFinalRound`).
 * - The retry feedback crosses as a pre-composed string
 *   (`feedback`): its wording embeds the peek and blank
 *   counts ("Not quite — you peeked 4 time(s) on 9
 *   blank(s). Try the round again."), which are engine
 *   numbers the app owns; the app composes, the view renders
 *   it as the warning alert, exactly the sibling pages'
 *   pre-composed-string boundary.
 *
 * States: the props are a union of exactly the states the
 * app screen renders. `{ state: "not-found" }` is the
 * screen's missing-verse branch — a plain "Verse not found."
 * line and a primary Back button (not the ready state's
 * BackLink; the app renders them differently, and this view
 * keeps that).
 * `{ state: "ready", ... }` is the drill. There is
 * deliberately no "loading" member: the app gates on its
 * store above this screen (the shell shows the spinner), so
 * the screen itself never renders one. There is likewise no
 * "complete" member: finishing the final round navigates
 * away — the final round is the last thing this view ever
 * renders. The union grows a member only when the app screen
 * grows the state.
 *
 * Slot audit: every element on this screen is a design-
 * system primitive over view-model data — the drill's one
 * interactive primitive, BlankWord, is already a DS
 * component — so there is no app-rendered content inside the
 * view and no render slot. The absence is pinned in the
 * contract test: a render surface is added consciously, the
 * RecipesPage cook-log way, if the app ever puts its own
 * rendering inside the session screen.
 *
 * The component holds no state of its own — round, revealed
 * blanks, and feedback all live app-side and cross as props
 * on every render — which is what makes the session
 * resumable: the app re-enters with its persisted round and
 * peek count and the view renders exactly that.
 *
 * No lineHeight is set anywhere in this file (the #162 rule).
 */

/** One word of the passage, as rendered. A plain word crosses
 * as just its text; a word blanked this round also carries
 * its `blank` state. */
export type MemorizationSessionPageWord = {
  /** The word's text (punctuation stays attached, as the app
   * tokenizes). Rendered as-is for a plain word; for a blank
   * it is the word the blank reveals — BlankWord sizes the
   * hidden control by it and shows it once revealed, so the
   * word itself must cross even while hidden. */
  text: string;
  /** Present when this word is blanked in the current round. */
  blank?: {
    /** Whether the user has peeked at this blank. A revealed
     * blank renders as plain text; a hidden one renders as
     * the tappable blank. */
    revealed: boolean;
  };
};

export type MemorizationSessionPageReadyProps = {
  state: "ready";
  /** The verse's reference, rendered as the heading. */
  reference: string;
  /** Zero-based index of the current round. */
  roundIndex: number;
  /** Total number of rounds in the session. */
  roundCount: number;
  /** The passage's words in order, with each blanked word's
   * state — the rendered surface of the app engine's current
   * blank set. */
  words: MemorizationSessionPageWord[];
  /** The round's feedback, pre-composed by the app (the retry
   * message, with its peek/blank counts); null or omitted
   * renders no alert. */
  feedback?: string | null;
  /** Whether the current round is the session's last — the
   * advance button reads "Finish — mark memorized" instead
   * of "Next round". */
  isFinalRound: boolean;
  /** Leave the session (the BackLink). */
  onBack: () => void;
  /** A hidden blank was pressed, with the word's index in
   * `words`. The app reveals it, counts the peek, and
   * persists the drill progress. */
  onBlankReveal: (wordIndex: number) => void;
  /** The advance button was pressed. The app grades the
   * round: retry feedback, the next round, or — on the final
   * round — completion and navigation away. */
  onAdvance: () => void;
};

export type MemorizationSessionPageProps =
  { state: "not-found"; onBack: () => void } | MemorizationSessionPageReadyProps;

/**
 * Full-page memorization session view: back affordance, the
 * reference heading, round hint and dots, the blanked passage
 * in its card, retry feedback, and the advance action.
 * Controlled — see the file header for the contract and the
 * screen inventory it mirrors.
 */
export function MemorizationSessionPage(props: MemorizationSessionPageProps) {
  if (props.state === "not-found") {
    return (
      <ScreenContainer>
        <Text>Verse not found.</Text>
        <Button onPress={props.onBack}>Back</Button>
      </ScreenContainer>
    );
  }

  const {
    reference,
    roundIndex,
    roundCount,
    words,
    feedback,
    isFinalRound,
    onBack,
    onBlankReveal,
    onAdvance,
  } = props;

  // Blank ordinals are presentation derived from the
  // view-model during render, as in the app screen: BlankWord
  // numbers each blank among the round's blanks ("Reveal
  // blank word N of M").
  const blankCount = words.reduce((count, word) => count + (word.blank ? 1 : 0), 0);
  // Precompute each blank's ordinal in a first pass so the render
  // map below only reads values — no counter is mutated during
  // render (the @eslint-react immutability diagnostic's target
  // pattern; see #135). Non-blank words get -1 and are never read.
  const blankOrdinals = words.map((word, index) =>
    word.blank ? words.slice(0, index).filter((earlier) => earlier.blank).length : -1,
  );

  return (
    <ScreenContainer>
      <BackLink onPress={onBack} />
      <Text variant="heading">{reference}</Text>
      <Text variant="hint">
        Round {roundIndex + 1} of {roundCount} — tap a blank to peek at the word.
      </Text>
      <StepDots count={roundCount} activeIndex={roundIndex} />
      <Card>
        <VerseText>
          {words.map((word, i) => {
            if (word.blank) {
              const ordinal = blankOrdinals[i] ?? 0;
              return (
                <Text key={i} variant="verse">
                  <BlankWord
                    word={word.text}
                    revealed={word.blank.revealed}
                    onReveal={() => onBlankReveal(i)}
                    index={ordinal}
                    total={blankCount}
                  />{" "}
                </Text>
              );
            }
            return (
              <Text key={i} variant="verse">
                {word.text}{" "}
              </Text>
            );
          })}
        </VerseText>
      </Card>
      {feedback ? <Alert severity="warning">{feedback}</Alert> : null}
      <Button onPress={onAdvance}>{isFinalRound ? "Finish — mark memorized" : "Next round"}</Button>
    </ScreenContainer>
  );
}
