import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Button } from "./Button.js";
import { Card } from "./Card.js";
import { Text } from "./Text.js";

export type CardRowProps = {
  /** The row's title. */
  title: string;
  /** The row's meta line, pre-composed by the caller; omit to
   * render the title alone. */
  subtitle?: string;
  /** Press on the row's text block. */
  onPress: () => void;
  /** Optional trailing action: the action button renders only
   * when both the label and the callback are provided. */
  actionLabel?: string;
  /** Optional trailing action press. */
  onActionPress?: () => void;
  /** The action button's treatment: `neutral` (the default) is
   * the plain secondary button; `danger` inks it in the soft
   * danger tones for destructive actions. */
  actionTone?: "danger" | "neutral";
};

/**
 * A titled card row for lists (MealPlansPage's plan rows render
 * through it): an elevated card whose text block — title over an
 * optional meta line — is the press target, with an optional
 * trailing action button beside it. The row owns its layout, its
 * pressable area, and the action's treatment so pages compose
 * rows without styling them (#119); all content — title, meta
 * line, action label — is caller-supplied, so the row serves any
 * app's lists. The row carries no spacing outside its card:
 * separation between rows is the composing stack's (CardStack's
 * gap), never the row's own padding.
 *
 * The pressable text block is a Tamagui view, not a React Native
 * Pressable/TouchableOpacity: those map accessibilityRole="button"
 * to a native <button> element on web, whose UA styles center the
 * row's text. A Tamagui pressable renders a div carrying the role
 * (the OptionCard pattern) and keeps the layout. flex/minWidth are
 * structural only: the block expands and may shrink within the row.
 */
export function CardRow({
  title,
  subtitle,
  onPress,
  actionLabel,
  onActionPress,
  actionTone = "neutral",
}: CardRowProps) {
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
      {onActionPress && actionLabel ? (
        <XStack paddingInlineStart="$3" alignItems="center">
          <Button
            variant="secondary"
            size="sm"
            {...(actionTone === "danger"
              ? {
                  backgroundColor: tokens.colors.danger.danger1,
                  color: tokens.colors.danger.danger8,
                }
              : {})}
            onPress={onActionPress}
          >
            {actionLabel}
          </Button>
        </XStack>
      ) : null}
    </Card>
  );
}
