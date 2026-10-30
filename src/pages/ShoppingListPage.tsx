import { CheckRow } from "../components/CheckRow.js";
import { EmptyState } from "../components/EmptyState.js";
import { ListLoadingState } from "../components/ListLoadingState.js";
import { ListStack } from "../components/ListStack.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { SectionStack } from "../components/SectionStack.js";
import { Text } from "../components/Text.js";

/**
 * ShoppingListPage (#125, B3b): a meal plan's shopping list —
 * the split view half of Eciperay's `ShoppingListView` (the
 * B2 audit's page-view disposition). The app screen keeps the
 * shopping-list query and the checked state; this view renders
 * lines and reports toggles.
 *
 * The contract (proposals on #125; the controlled shape ships
 * as the interim and the recommended option):
 * - Check-off state is controlled: each line carries its own
 *   `isChecked`, and `onToggleLine(key)` reports the toggle
 *   intent. The app screen owns the set (session-only today);
 *   whether it ever persists is an app/data question the view
 *   does not take a position on.
 * - Lines are view-models: the quantity crosses pre-composed
 *   (`quantityLabel`, the host's quantity + unit formatting —
 *   the MealPlanDetailPage pre-composed-string precedent), so
 *   the view renders "name · 2 lb · optional" without knowing
 *   the app's quantity types.
 * - The row keeps the app view's inline layout — bold name,
 *   muted quantity / optional suffixes on the same line,
 *   strike-through and muted when checked — but the app's
 *   checkbox text glyph becomes a real checkbox: the row carries
 *   checkbox semantics (`accessibilityRole="checkbox"` with
 *   its checked state, the whole row the press target, web
 *   keyboard activation — the ChecklistRow pattern with the
 *   MealPlansPage row's keyboard handling).
 *
 * States mirror the app view's swaps: while `isLoading`, the
 * shared ListLoadingState replaces the list (the app renders
 * its branded loader there; ListLoadingState stands in, the
 * RecipeFormPage precedent — the branded loader stays app-side by recorded
 * decision); an empty list renders the DS EmptyState with the
 * app's message.
 *
 * De-styled for #119: the page composes DS components only —
 * the title is Text's `title` variant, the sections stack in
 * SectionStack, the lines stack in ListStack, and each line
 * renders through the generic CheckRow, its `detail` composed
 * here from the line's quantity and optional flag (the row
 * joins it to the name with the middle-dot separator, so the
 * rendered line is unchanged). The page sets no styling props
 * and renders no layout primitives.
 */

export type ShoppingListPageLine = {
  key: string;
  name: string;
  /** Pre-composed quantity ("2 lb"); omit or pass null when
   * the line has no quantity. */
  quantityLabel?: string | null;
  isOptional?: boolean;
  isChecked: boolean;
};

export type ShoppingListPageProps = {
  lines: ShoppingListPageLine[];
  isLoading?: boolean;
  onToggleLine: (key: string) => void;
};

export function ShoppingListPage({
  lines,
  isLoading = false,
  onToggleLine,
}: ShoppingListPageProps) {
  return (
    <ScreenContainer>
      <SectionStack>
        <Text variant="title">Shopping list</Text>
        {isLoading ? (
          <ListLoadingState label="Loading shopping list" />
        ) : lines.length === 0 ? (
          <EmptyState title="No items on this list." />
        ) : (
          <ListStack>
            {lines.map((line) => (
              <CheckRow
                key={line.key}
                label={line.name}
                detail={
                  [line.quantityLabel, line.isOptional ? "optional" : null]
                    .filter(Boolean)
                    .join(" · ") || null
                }
                checked={line.isChecked}
                onToggle={() => {
                  onToggleLine(line.key);
                }}
              />
            ))}
          </ListStack>
        )}
      </SectionStack>
    </ScreenContainer>
  );
}
