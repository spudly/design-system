import { BigFooterShell, type BigFooterData } from "../widgets/BigFooter.js";
import { BoxSkeleton } from "../widgets/BoxSkeleton.js";
import { CheckRow } from "../widgets/CheckRow.js";
import { EmptyState } from "../widgets/EmptyState.js";
import { ListStack } from "../widgets/ListStack.js";
import { LoadingScope } from "../contexts/LoadingScope.js";
import { TextSkeleton } from "../widgets/TextSkeleton.js";
import { ScreenContainer } from "../widgets/ScreenContainer.js";
import { SectionStack } from "../widgets/SectionStack.js";
import { Text } from "../widgets/Text.js";
import { XStack, YStack } from "tamagui";

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
 * States: while `loading`, the list region renders skeleton
 * rows (#278, tranche 4 — the centered-Spinner pattern is
 * deleted): the title stays rendered and the list holds
 * exactly 3 dummy rows mirroring the CheckRow composition —
 * a box bone at the row's checkbox geometry beside a text
 * bone at the label's size, the row's hairline rendered
 * transparent in the skeleton state. CheckRow itself has no
 * loading state (a checkbox row's checked state is caller
 * data), so the dummy rows are the page's own composition.
 * An empty list renders the DS EmptyState with the app's
 * message.
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
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
  lines: ShoppingListPageLine[];
  loading?: boolean;
  onToggleLine: (key: string) => void;
};

// The dummy skeleton rows for the loading list (#278): exactly
// 3, from a frozen module-level constant — never generated per
// render (the CheckboxSelectList convention).
const LOADING_LINE_KEYS = ["loading-1", "loading-2", "loading-3"] as const;

export function ShoppingListPage({
  lines,
  loading = false,
  onToggleLine,
  footer,
}: ShoppingListPageProps) {
  return (
    <BigFooterShell footer={footer}>
      <ScreenContainer>
        <SectionStack>
          <Text variant="title">Shopping list</Text>
          {loading ? (
            <LoadingScope active>
              <ListStack>
                {LOADING_LINE_KEYS.map((key) => (
                  <XStack
                    key={key}
                    alignItems="flex-start"
                    gap="$3"
                    paddingVertical="$3"
                    borderBottomWidth={1}
                    borderBottomColor="transparent"
                  >
                    <BoxSkeleton width={24} height={24} />
                    <YStack flex={1}>
                      <TextSkeleton size="md" lines={1} />
                    </YStack>
                  </XStack>
                ))}
              </ListStack>
            </LoadingScope>
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
    </BigFooterShell>
  );
}
