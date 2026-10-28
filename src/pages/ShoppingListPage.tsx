import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "../components/accessibility.js";
import { EmptyState } from "../components/EmptyState.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { Spinner } from "../components/Spinner.js";
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
 * States mirror the app view's swaps: while `isLoading`, a
 * spinner replaces the list (the app renders its branded
 * loader there; the DS Spinner stands in, the RecipeFormPage
 * precedent — the branded loader stays app-side by recorded
 * decision); an empty list renders the DS EmptyState with the
 * app's message.
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

function ShoppingListRow({ line, onToggle }: { line: ShoppingListPageLine; onToggle: () => void }) {
  // Web keyboard support (the MealPlansPage row pattern): a
  // view carrying a role is made focusable and the activation
  // keys — Enter and Space — invoke the same callback as a
  // press. Web-only props, ignored on native.
  const handleKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onToggle();
    }
  };
  const checked = line.isChecked;
  return (
    <XStack
      alignItems="flex-start"
      gap="$3"
      borderBottomWidth={1}
      borderBottomColor={tokens.colors.gray.gray2}
      paddingVertical="$3"
      {...platformAccessibilityProps({
        accessibilityRole: "checkbox",
        accessibilityState: { checked },
        accessibilityLabel: line.name,
      })}
      onPress={onToggle}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      cursor="web:pointer"
    >
      <YStack
        marginTop={2}
        width={tokens.spacing[6]}
        height={tokens.spacing[6]}
        borderRadius={tokens.radii.sm}
        borderWidth={2}
        borderColor={checked ? "$primary" : "$textMuted"}
        backgroundColor={checked ? "$primary" : "$surface"}
        alignItems="center"
        justifyContent="center"
      >
        {checked ? (
          <Text fontSize={tokens.typography.fontSize.sm} color="$onPrimary">
            ✓
          </Text>
        ) : null}
      </YStack>
      <Text
        flex={1}
        {...(checked ? { color: "$textMuted" } : {})}
        textDecorationLine={checked ? "line-through" : "none"}
      >
        <Text fontWeight={tokens.typography.fontWeight.medium}>{line.name}</Text>
        {line.quantityLabel ? (
          <Text color="$textMuted" fontSize={tokens.typography.fontSize.sm}>
            {" "}
            · {line.quantityLabel}
          </Text>
        ) : null}
        {line.isOptional ? (
          <Text color="$textMuted" fontSize={tokens.typography.fontSize.sm}>
            {" "}
            · optional
          </Text>
        ) : null}
      </Text>
    </XStack>
  );
}

export function ShoppingListPage({
  lines,
  isLoading = false,
  onToggleLine,
}: ShoppingListPageProps) {
  return (
    <ScreenContainer>
      <Text
        variant="subheading"
        fontSize={tokens.typography.fontSize.xl}
        fontWeight={tokens.typography.fontWeight.bold}
        marginBottom="$4"
      >
        Shopping list
      </Text>
      {isLoading ? (
        <Spinner label="Loading shopping list" />
      ) : lines.length === 0 ? (
        <EmptyState title="No items on this list." />
      ) : (
        <YStack>
          {lines.map((line) => (
            <ShoppingListRow
              key={line.key}
              line={line}
              onToggle={() => {
                onToggleLine(line.key);
              }}
            />
          ))}
        </YStack>
      )}
    </ScreenContainer>
  );
}
