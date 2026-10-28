import { FlatList } from "react-native";
import { XStack } from "tamagui";
import { Button } from "../components/Button.js";
import { Card } from "../components/Card.js";
import { EmptyState } from "../components/EmptyState.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { Text } from "../components/Text.js";

/**
 * MemorizeReviewPage (#49): Memorize's Review screen as a
 * controlled @spudly/ui page component. The app keeps all
 * business logic — computing which verses are due from the
 * spaced-repetition store, recording review outcomes, advancing
 * or resetting each verse's schedule — and drives this view
 * entirely through props: the due-verse view-models in, outcome
 * callbacks out. Nothing here imports an app package or reads
 * a clock.
 *
 * Naming — read this first: the #49 inventory calls this item
 * "Progress", but Memorize has NO progress screen. That name
 * came from the #44 demo stories, whose "Progress" demo invented
 * a dashboard the app never had: StatCards ("12 verses
 * mastered", "85% drill accuracy"), per-passage percent bars, a
 * "Passages in progress" section. None of it exists — the app
 * shows no aggregate stats anywhere, and its data model has no
 * streak, accuracy, or percent to show. #49 builds the real
 * screens, so this component ports the real screen that the
 * "progress" item corresponds to: the Review screen
 * (ReviewScreen in spudly/memorize packages/app), the surface
 * where memorization progress is actually exercised — the
 * due-for-review queue whose remembered/forgot outcomes drive
 * every verse's spaced-repetition schedule. It is named for
 * that real screen, not the demo. (Per-verse status badges —
 * "learning" / "memorized", with next-review dates — live on
 * the Verses screen, the home surface, not here; this screen's
 * cards carry no badge, and the contract does not invent one.)
 *
 * The composition mirrors ReviewScreen exactly: the heading
 * carries the due count ("Review (N due)"), one card per due
 * verse (reference, text, the two outcome buttons), and —
 * when nothing is due — the bare "Review" heading over the
 * app's empty state ("Nothing due" / "Nice work."). The due
 * list itself is the app's computation (`dueVerses`: verses
 * whose next review has arrived, oldest first); the app hands
 * the finished list across, and the count in the heading is
 * the list's own length, as in the app.
 *
 * Deliberate contract shapes, all dictated by the app screen:
 * - Two outcome callbacks, not one outcome-union callback:
 *   the app wires its two buttons to the two review outcomes
 *   ("remembered" / "forgot"), and the pair of callbacks keeps
 *   each button's intent named at the boundary — the same
 *   shape as MealPlanDetailPage's kind-routed entry presses.
 * - No loading member. The app gates store readiness one
 *   level up (App renders a full-screen spinner until the
 *   store is ready, above the tab shell), so this screen
 *   never renders a loading state of its own; an empty due
 *   list is the screen's real empty state, not a placeholder
 *   for one.
 * - The list is React Native's FlatList bounded with
 *   `flex: 1` inside the fixed shell — the app's own
 *   structure (its App renders a non-scrolling
 *   ScreenContainer; the screen's list is `flex: 1` inside
 *   it), which is the #188 geometry: a list that sizes to
 *   its content inside a non-scrolling shell overflows and
 *   never scrolls.
 *
 * No render slot, by audit: the app's rows render only DS
 * primitives (text, two buttons) over per-verse data — no
 * app-owned rendered content lives inside this view, no chart
 * (the app has none anywhere) — so the contract is
 * callbacks-only, and the contract test pins the absence. If
 * a future app change puts app-rendered content in a row,
 * that change adds a slot then (the `renderRecipeAccessory`
 * precedent) rather than the slot existing speculatively now.
 */

// The FlatList must be bounded to the space the fixed shell
// leaves it (#188): the app screen's list carries `flex: 1`
// inside App's non-scrolling ScreenContainer; without it the
// list sizes to its full content height, overflows the shell,
// and never gets a scrollable viewport of its own.
const listStyle = { flex: 1 } as const;

/** One due verse row's view-model: the verse only — due rows
 * carry no status badge or schedule detail in the app. */
export type MemorizeReviewPageVerse = {
  id: string;
  reference: string;
  text: string;
};

export type MemorizeReviewPageProps = {
  /** Verses due for review, in the app's order (oldest due
   * first). The app computes dueness from its
   * spaced-repetition schedule; the view only renders. */
  verses: MemorizeReviewPageVerse[];
  /** "I remembered it" action: in the app this records a
   * remembered review, advancing the verse's schedule. */
  onRememberedPress: (verseId: string) => void;
  /** "I forgot it" action: in the app this records a forgot
   * review, resetting the verse's schedule. */
  onForgotPress: (verseId: string) => void;
};

function ReviewVerseRow({
  verse,
  onRememberedPress,
  onForgotPress,
}: {
  verse: MemorizeReviewPageVerse;
  onRememberedPress: () => void;
  onForgotPress: () => void;
}) {
  return (
    <Card marginBottom="$2">
      <Text variant="subheading">{verse.reference}</Text>
      <Text variant="verse">{verse.text}</Text>
      <XStack gap="$2" marginTop="$2">
        <Button size="sm" onPress={onRememberedPress}>
          I remembered it
        </Button>
        <Button size="sm" variant="secondary" onPress={onForgotPress}>
          I forgot it
        </Button>
      </XStack>
    </Card>
  );
}

/**
 * Full-page Memorize review view: the "Review (N due)"
 * heading and the due-verse list (or the app's nothing-due
 * empty state) in the fixed shell the app's tab screens
 * share. Controlled — see the file header for the naming
 * audit and the contract it produced.
 */
export function MemorizeReviewPage({
  verses,
  onRememberedPress,
  onForgotPress,
}: MemorizeReviewPageProps) {
  return (
    <ScreenContainer scrollable={false}>
      <Text variant="heading">
        {verses.length === 0 ? "Review" : `Review (${verses.length} due)`}
      </Text>
      {verses.length === 0 ? (
        <EmptyState title="Nothing due" body="Nice work." />
      ) : (
        <FlatList
          style={listStyle}
          data={verses}
          keyExtractor={(verse) => verse.id}
          renderItem={({ item }) => (
            <ReviewVerseRow
              verse={item}
              onRememberedPress={() => {
                onRememberedPress(item.id);
              }}
              onForgotPress={() => {
                onForgotPress(item.id);
              }}
            />
          )}
        />
      )}
    </ScreenContainer>
  );
}
