import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Text } from "./Text.js";

export type ListRowProps = {
  /** Optional caller-supplied lead-in rendered in the title line
   * before the title (e.g. a kind label, "Meal · "). */
  prefix?: string;
  /** The row's title. */
  title: string;
  /** Optional caller-supplied suffix rendered in the title line
   * after the title (e.g. " (unavailable)"). */
  titleSuffix?: string;
  /** The row's meta line, pre-composed by the caller; omit to
   * render the title line alone. */
  subtitle?: string;
  /** A disabled row: it does not press, is not focusable, and is
   * marked disabled for assistive technology. */
  isDisabled?: boolean;
  /** Press on the row. Ignored when the row is disabled. */
  onPress: () => void;
};

/**
 * A hairline list row (MealPlanDetailPage's entry rows render
 * through it): a title line — an optional caller-supplied prefix,
 * the title, an optional caller-supplied suffix — over an
 * optional meta line, with a hairline below. The row owns its
 * pressable area, hairline, and disabled treatment so pages
 * compose rows without styling them (#119); all content is
 * caller-supplied, so the row serves any app's lists.
 */
export function ListRow({
  prefix,
  title,
  titleSuffix,
  subtitle,
  isDisabled = false,
  onPress,
}: ListRowProps) {
  // Web keyboard support (the CardRow pattern): a view carrying
  // the button role is made focusable and the button activation
  // keys — Enter and Space — invoke the same callback as a press.
  // Web-only props, ignored on native. A disabled row is not a
  // button at all: no press, no focus, marked disabled.
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
        {...(isDisabled
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
          {prefix}
          {title}
          {titleSuffix}
        </Text>
        {subtitle ? <Text variant="hint">{subtitle}</Text> : null}
      </YStack>
    </YStack>
  );
}
