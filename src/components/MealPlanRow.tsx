import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Button } from "./Button.js";
import { Card } from "./Card.js";
import { Text } from "./Text.js";

export type MealPlanRowProps = {
  /** The plan's title. */
  title: string;
  /** The plan's meta line (entry count · date range · nutrition),
   * pre-composed by the app; omit to render the title alone. */
  subtitle?: string;
  /** Press on the row's text block: open the plan. */
  onPress: () => void;
  /** Optional row action: the Delete button renders only when the
   * callback is provided. */
  onDeletePress?: () => void;
};

/**
 * One meal plan row in the plan list (MealPlansPage): an elevated
 * card whose text block — title over its meta line — is the press
 * target, with an optional soft-danger Delete beside it. Extracted
 * from MealPlansPage for #119: the row's layout, pressable area,
 * and button treatment are styling the page may not apply itself,
 * so the row is a widget here and the page composes rows.
 *
 * The pressable text block is a Tamagui view, not a React Native
 * Pressable/TouchableOpacity: those map accessibilityRole="button"
 * to a native <button> element on web, whose UA styles center the
 * row's text. A Tamagui pressable renders a div carrying the role
 * (the OptionCard pattern) and keeps the layout. flex/minWidth are
 * structural only: the block expands and may shrink within the row.
 */
export function MealPlanRow({ title, subtitle, onPress, onDeletePress }: MealPlanRowProps) {
  // Web keyboard support (the TextLink pattern): a div carrying the
  // button role is not keyboard-operable on its own, so it is made
  // focusable and the button activation keys — Enter and Space —
  // invoke the same callback as a press. `tabIndex` and `onKeyDown`
  // are web-only props in Tamagui and are ignored on native, where
  // onPress is the activation path.
  const handleKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onPress();
    }
  };
  return (
    <YStack paddingBlockEnd="$3">
      <Card variant="elevated" flexDirection="row" alignItems="center" gap="$3">
        <YStack
          flex={1}
          minWidth={0}
          gap="$1"
          {...platformAccessibilityProps({ accessibilityRole: "button" })}
          onPress={onPress}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          cursor="web:pointer"
        >
          <Text
            fontSize={tokens.typography.fontSize.md}
            fontWeight={tokens.typography.fontWeight.semibold}
          >
            {title}
          </Text>
          {subtitle ? <Text variant="hint">{subtitle}</Text> : null}
        </YStack>
        {onDeletePress ? (
          <XStack paddingInlineStart="$3" alignItems="center">
            <Button
              variant="secondary"
              size="sm"
              backgroundColor={tokens.colors.danger.danger1}
              color={tokens.colors.danger.danger8}
              onPress={onDeletePress}
            >
              Delete
            </Button>
          </XStack>
        ) : null}
      </Card>
    </YStack>
  );
}
