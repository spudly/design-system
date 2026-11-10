import { BigFooterShell, type BigFooterData } from "../widgets/BigFooter.js";
import { Badge } from "../widgets/Badge.js";
import { Button } from "../widgets/Button.js";
import { Card } from "../widgets/Card.js";
import { EmptyState } from "../widgets/EmptyState.js";
import { ButtonRow } from "../widgets/ButtonRow.js";
import { ScreenContainer } from "../widgets/ScreenContainer.js";
import { Text } from "../widgets/Text.js";
import { BoundedList } from "./BoundedList.js";

/**
 * MyVersesPage (#49): Memorize's "My verses" screen as a
 * controlled @spudly/ui page component, ported alongside
 * VerseSearchPage in the same #49 slot (the plan's "home / verse
 * search" item covers the app's two list screens; the passage
 * view the #44 demo imagined does not exist in the app). The app
 * keeps all state and business logic — the memorize store, the
 * drill navigation, the remove mutation — and drives this view
 * entirely through props. Nothing here imports an app package.
 *
 * Placement: src/pages, exported from the package root (#298)
 * — pages are the package's only exports.
 *
 * Which screen this is: the app's Verses tab (VersesScreen in
 * spudly/memorize packages/app) — the app's home screen, its
 * default tab. The app chrome (its "Memorize" title and the tab
 * bar) stays app-side, like the Meals hub chrome in Wave A; the
 * screen's own heading ("My verses") renders here.
 *
 * The composition mirrors the app screen exactly, inside the
 * same shell the app renders it in (the default ScreenContainer
 * with scrolling off, whose padding and section gap the screen's
 * fragment relies on):
 * - The empty branch replaces the list: with no verses the
 *   screen is the heading and the app's empty state, title and
 *   body verbatim ("No verses yet" / "Find one in the Search tab
 *   to get started."). The branch keys off the list being empty,
 *   as the app's does — this screen has no loading state (the
 *   app gates on store readiness before any tab renders), so
 *   there is deliberately no spinner and no state union.
 * - Rows are plain cards: reference (subheading), a status
 *   badge, the verse text (verse variant), an optional next
 *   review line (hint), and a Drill / Remove button pair. The
 *   badge's text is the status itself, as the app renders it;
 *   its tone follows the app's rule (memorized is success,
 *   learning is info) — presentation the view owns, driven by
 *   the status value.
 * - The next-review line crosses the boundary pre-composed
 *   (`nextReviewLabel`): the app formats the stored timestamp
 *   with a locale date format, and locale formatting is the
 *   app's business, exactly as a meal plan's meta line crosses
 *   pre-composed in MealPlansPage. Absent means the verse has no
 *   review scheduled and no line renders.
 * - The row's two controls split on #248's navigation rule:
 *   Drill navigates (the app swaps in its drill screen), so it
 *   is a link — each item carries its pre-composed `drillHref`
 *   and the Drill control renders in Button's href form.
 *   Remove is a bare intent by id, `onRemoveVerse(id)` (the
 *   app's store mutation stays app-side).
 * - Host contract for `drillHref` (#425, decided by Stephen
 *   2026-11-05): the HOST owns a canonical drill destination
 *   for every verse — a host in Memorize's position creates
 *   one rather than expecting a callback form. On web that is
 *   a `/drill/:id` path the host parses on load; on native
 *   that is a `<scheme>://drill/<id>` deep link (Memorize:
 *   `memorize://drill/<id>`) the host handles. There is NO
 *   callback form of the Drill control: a drill destination
 *   is a canonical destination, so the #248 dynamic-
 *   destination exemption does not apply, and a host must not
 *   pass an href its own routing ignores — following the link
 *   must land on that verse's drill in that host.
 *
 * #188: the list is the shared BoundedList, bounded to the
 * fixed shell with `flex: 1` (owned by BoundedList, #119), the
 * same geometry the app's list uses inside the non-scrolling
 * container.
 *
 * No render slot, by audit (the cook-log lesson, applied before
 * the fact): the app screen renders no app-owned content inside
 * itself — a row is verse data plus a status and a pre-composed
 * date line. The row's controls are a link and a callback per
 * #248's rule, which is the honest contract for this view.
 */

/** A verse's memorization status, mirroring the app's status
 * values — the view renders it as the badge text and derives the
 * badge tone from it. */
export type MyVersesPageStatus = "learning" | "memorized";

/** One row's view-model: the verse on the app's memorize list,
 * with its status and, when a review is scheduled, the app's
 * pre-composed next-review line. */
export type MyVersesPageItem = {
  id: string;
  /** The drill destination for this verse (#248's navigation
   * rule: starting the drill navigates, so it is a link): the
   * host composes it from the verse id, and the destination
   * must be one the host itself routes — web hosts parse
   * `/drill/:id` on load, native hosts handle their scheme's
   * `drill/<id>` deep link (#425). The row's Drill control
   * renders as a link carrying this href. */
  drillHref: string;
  reference: string;
  text: string;
  status: MyVersesPageStatus;
  nextReviewLabel?: string;
};

export type MyVersesPageProps = {
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
  /** The app's memorize list, in the app's order. */
  verses: MyVersesPageItem[];
  /** Row action: remove this verse from the app's list. */
  onRemoveVerse: (verseId: string) => void;
};

function MyVerseRow({
  item,
  onRemovePress,
}: {
  item: MyVersesPageItem;
  onRemovePress: () => void;
}) {
  return (
    <Card>
      <Text variant="subheading">{item.reference}</Text>
      <Badge tone={item.status === "memorized" ? "success" : "info"}>{item.status}</Badge>
      <Text variant="verse">{item.text}</Text>
      {item.nextReviewLabel ? <Text variant="hint">{item.nextReviewLabel}</Text> : null}
      <ButtonRow>
        <Button size="sm" href={item.drillHref}>
          Drill
        </Button>
        <Button size="sm" variant="secondary" onPress={onRemovePress}>
          Remove
        </Button>
      </ButtonRow>
    </Card>
  );
}

/**
 * Full-page My verses view: the heading and either the app's
 * empty state or the verse list, in the app's fixed shell.
 * Controlled — see the file header for the contract and the
 * screen inventory it mirrors.
 */
export function MyVersesPage({ verses, onRemoveVerse, footer }: MyVersesPageProps) {
  return (
    <BigFooterShell footer={footer} scrollMode="content">
      <ScreenContainer>
        <Text variant="heading">My verses</Text>
        {verses.length === 0 ? (
          <EmptyState title="No verses yet" body="Find one in the Search tab to get started." />
        ) : (
          <BoundedList
            data={verses}
            keyExtractor={(verse) => verse.id}
            renderItem={({ item }) => (
              <MyVerseRow
                item={item}
                onRemovePress={() => {
                  onRemoveVerse(item.id);
                }}
              />
            )}
          />
        )}
      </ScreenContainer>
    </BigFooterShell>
  );
}
