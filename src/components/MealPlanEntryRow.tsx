import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Text } from "./Text.js";

export type MealPlanEntryRowProps = {
  /** Which kind of entry this row opens; the title line carries the
   * kind as its prefix ("Meal · " / "Recipe · "). */
  kind: "meal" | "recipe";
  /** The entry's title (without the kind prefix). */
  title: string;
  /** The entry's meta line (quantity · members/servings ·
   * nutrition), pre-composed by the app; omit to render the title
   * alone. */
  subtitle?: string;
  /** A recipe entry whose access was lost: the title gains its
   * "(unavailable)" suffix and the row does not press. Meal entries
   * are never unavailable. */
  isUnavailable?: boolean;
  /** Press on the row: open the entry. Ignored when the entry is
   * unavailable. */
  onPress: () => void;
};

/**
 * One entry row in a meal plan's entry list (MealPlanDetailPage): a
 * hairline row whose title line names the entry kind ("Meal · " /
 * "Recipe · ") over an optional meta line. Extracted from
 * MealPlanDetailPage for #119: the row's pressable area, hairline,
 * and disabled treatment are styling the page may not apply itself,
 * so the row is a widget here and the page composes rows.
 */
export function MealPlanEntryRow({
  kind,
  title,
  subtitle,
  isUnavailable = false,
  onPress,
}: MealPlanEntryRowProps) {
  // Web keyboard support (the MealPlanRow pattern): a view carrying
  // the button role is made focusable and the button activation
  // keys — Enter and Space — invoke the same callback as a press.
  // Web-only props, ignored on native. An unavailable row is not a
  // button at all: no press, no focus, marked disabled — the app's
  // disabled Pressable.
  const handleKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onPress();
    }
  };
  return (
    <YStack borderBottomWidth={1} borderBottomColor={tokens.colors.gray.gray2}>
      <YStack
        paddingVertical="$3"
        {...(isUnavailable
          ? platformAccessibilityProps({ accessibilityState: { disabled: true } })
          : {
              ...platformAccessibilityProps({ accessibilityRole: "button" }),
              onPress,
              tabIndex: 0,
              onKeyDown: handleKeyDown,
              cursor: "web:pointer",
            })}
      >
        <Text
          fontSize={tokens.typography.fontSize.md}
          fontWeight={tokens.typography.fontWeight.medium}
        >
          {kind === "meal" ? "Meal" : "Recipe"} · {title}
          {isUnavailable ? " (unavailable)" : ""}
        </Text>
        {subtitle ? <Text variant="hint">{subtitle}</Text> : null}
      </YStack>
    </YStack>
  );
}
