import { Button } from "../components/Button.js";
import { Card } from "../components/Card.js";
import { Alert } from "../components/Alert.js";
import { Row } from "../components/Row.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { SearchField } from "../components/SearchField.js";
import { Spinner } from "../components/Spinner.js";
import { Text } from "../components/Text.js";
import { BoundedList } from "./BoundedList.js";

/**
 * VerseSearchPage (#49): Memorize's verse search screen as a
 * controlled @spudly/ui page component — the first Memorize page
 * ported, with the Wave A discipline: the app keeps all state and
 * business logic (the query text, the search execution against its
 * scripture data source, the add-to-list store mutation) and
 * drives this view entirely through props. Nothing here imports an
 * app package or fetches anything.
 *
 * Placement: src/pages behind the `@spudly/ui/pages` subpath
 * export, not the package root — see RecipesPage.tsx for why
 * (react-native imports must stay out of the Node-importable root
 * entry).
 *
 * Which screen this is: the app's Search tab (SearchScreen in
 * spudly/memorize packages/app). The app chrome — its "Memorize"
 * title and the tab bar — stays app-side, like the Meals hub
 * chrome in Wave A: the tab switch selects between pages, so it is
 * navigation, not part of this view. The screen's own heading
 * ("Search verses") is part of the view and renders here.
 *
 * It is NOT the #44 Pages/Memorize "HomeVerseSearch" demo: that
 * demo fused this screen and the Verses tab into one invented
 * composition — a labeled search field with a different
 * placeholder, a "Continue" section with a "Resume session"
 * button, and recent-verse cards with hints. None of that exists
 * in the app. The real screen is a search row and a results list,
 * and this page mirrors exactly that; where the demo and the app
 * disagree, the app — and this page — win.
 *
 * The composition mirrors the app screen element for element,
 * inside the same shell the app renders it in (the default
 * ScreenContainer with scrolling off, whose padding and section
 * gap the screen's fragment relies on):
 * - The demo-mode notice: when the app has no API key it searches
 *   a built-in demo set and says so in an info alert above the
 *   search row. The text is the app's, verbatim; `usingDemo`
 *   carries the one fact the view needs.
 * - The search row: the DS SearchField and a Search button. Both
 *   submitting the field (its submit-editing signal) and pressing
 *   the button fire the same `onSearch` — in the app both invoke
 *   the one search routine. The button's disabled rule is the
 *   app's formula, derived from props: searching, or a blank
 *   (whitespace-only) query.
 * - The error alert: the app catches a failed search and shows
 *   the error's message; the message crosses the boundary as a
 *   string (`errorMessage`, null when there is none) because
 *   composing it — the caught error's message, or the app's
 *   "Search failed" fallback — is the app's business.
 * - The busy spinner renders above the list while a search is in
 *   flight, and the list stays mounted with the previous results
 *   still in it: the app keeps its results state across a search,
 *   so a re-search never blanks the list. There is deliberately
 *   no loading state union and no content swap.
 * - Empty results render an empty list — the app has NO empty
 *   state on this screen (unlike its Verses and Review tabs,
 *   which do use an empty-state component). Before the first
 *   search and after a fruitless one, the screen is the form and
 *   blank space. Inventing an empty message here would be the
 *   #44 failure mode, so the contract test pins its absence.
 * - Result rows are plain cards: reference (subheading), verse
 *   text (verse variant), and a small "Add to memorize list"
 *   button whose press is `onAddVerse(id)` — the store mutation
 *   stays app-side. A result the app marks `added` (#242) renders
 *   a disabled secondary "Added" button instead, mirroring the
 *   memorize web fix (memorize #56/PR #57): the confirmation is
 *   derived from app state, so it is correct on first render for
 *   verses already in the library and flips in place after a tap
 *   once the app re-renders with the flag set.
 *
 * Two layout notes:
 * - #188: the results list is the shared BoundedList, which owns
 *   the `flex: 1` bounding to the fixed shell, the same geometry
 *   the app's list uses inside the non-scrolling container.
 * - The app passes `style={{ flex: 1 }}` to the field itself; here
 *   the search row is the DS Row and the field takes the row's
 *   remaining width through SearchField's `grow` prop — the
 *   layout is the app's (the field takes the remaining width, the
 *   button its natural width). No lineHeight is set on any glyph
 *   or text in this file (#162).
 *
 * No render slot, by audit (the cook-log lesson, applied before
 * the fact): the app screen renders no app-owned content inside
 * itself — no forms beyond the search field, no custom row
 * content; a result is plain verse data ({id, reference, text} —
 * the app Verse type's book/chapter fields are not rendered by
 * this screen and do not cross the boundary), and the one row
 * action is a bare mutation intent. Every action is therefore a
 * pure callback, which is the honest contract for this view.
 */

/** One search result's view-model: the verse's id, its reference
 * line, and its full text, as the app's data source returns them. */
export type VerseSearchPageItem = {
  id: string;
  reference: string;
  text: string;
  /** The verse is already in the app's memorize list (#242):
   * the row renders the disabled "Added" confirmation instead of
   * the active Add button. Optional — omitted means not added. */
  added?: boolean;
};

export type VerseSearchPageProps = {
  /** The query text, held by the app (it runs the search). */
  query: string;
  onQueryChange: (value: string) => void;
  /** Run the search: fired by the field's submit-editing signal
   * and by the Search button alike, mirroring the app, where both
   * invoke the one search routine. */
  onSearch: () => void;
  /** A search is in flight: the spinner renders above the list
   * and the Search button is disabled; the previous results stay
   * rendered. */
  isSearching: boolean;
  /** The app is searching its built-in demo set (no API key): the
   * info notice renders above the search row. */
  usingDemo: boolean;
  /** The last search's failure message, composed by the app;
   * null renders no error alert. */
  errorMessage: string | null;
  /** Results of the last completed search, in the app's order. */
  results: VerseSearchPageItem[];
  /** Row action: add this verse to the app's memorize list. */
  onAddVerse: (verseId: string) => void;
};

function VerseResultRow({
  item,
  onAddPress,
}: {
  item: VerseSearchPageItem;
  onAddPress: () => void;
}) {
  return (
    <Card>
      <Text variant="subheading">{item.reference}</Text>
      <Text variant="verse">{item.text}</Text>
      {item.added ? (
        <Button size="sm" variant="secondary" disabled>
          Added
        </Button>
      ) : (
        <Button size="sm" onPress={onAddPress}>
          Add to memorize list
        </Button>
      )}
    </Card>
  );
}

/**
 * Full-page verse search view: the heading, the demo notice, the
 * search row, the error and busy indicators, and the results list
 * in the app's fixed shell. Controlled — see the file header for
 * the contract and the screen inventory it mirrors.
 */
export function VerseSearchPage({
  query,
  onQueryChange,
  onSearch,
  isSearching,
  usingDemo,
  errorMessage,
  results,
  onAddVerse,
}: VerseSearchPageProps) {
  return (
    <ScreenContainer scrollable={false}>
      <Text variant="heading">Search verses</Text>
      {usingDemo ? (
        <Alert severity="info">
          Searching the built-in demo set. Add a gospel-engine API key in Settings for full-library
          search.
        </Alert>
      ) : null}
      <Row align="center">
        <SearchField
          value={query}
          onChangeText={onQueryChange}
          placeholder="e.g. Ether 12:27 or “charity”"
          onSubmitEditing={onSearch}
          grow
        />
        <Button onPress={onSearch} disabled={isSearching || query.trim() === ""}>
          Search
        </Button>
      </Row>
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      {isSearching ? <Spinner label="Loading" /> : null}
      <BoundedList
        data={results}
        keyExtractor={(verse) => verse.id}
        renderItem={({ item }) => (
          <VerseResultRow
            item={item}
            onAddPress={() => {
              onAddVerse(item.id);
            }}
          />
        )}
      />
    </ScreenContainer>
  );
}
