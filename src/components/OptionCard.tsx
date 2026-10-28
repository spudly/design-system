import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Card, type CardProps } from "./Card.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Text } from "./Text.js";

export type OptionCardProps = Omit<CardProps, "onPress"> & {
  title: string;
  description?: string;
  onPress: () => void;
};

/**
 * Tappable card that navigates somewhere (e.g. "Manual entry", "Import from
 * URL"). The whole card is a real pressable with `accessibilityRole="button"`
 * and a minimum 44px height; a trailing chevron signals navigation.
 */
export function OptionCard({
  title,
  description,
  onPress,
  accessible,
  accessibilityElementsHidden,
  accessibilityHint,
  accessibilityLabel,
  accessibilityLabelledBy,
  accessibilityLiveRegion,
  accessibilityRole,
  accessibilityState,
  accessibilityValue,
  ...rest
}: OptionCardProps) {
  const a11yProps = platformAccessibilityProps({
    accessible,
    accessibilityElementsHidden,
    accessibilityHint,
    accessibilityLabel,
    accessibilityLabelledBy,
    accessibilityLiveRegion,
    accessibilityRole: accessibilityRole ?? "button",
    accessibilityState,
    accessibilityValue,
  });
  return (
    <Card onPress={onPress} {...a11yProps} minHeight={44} {...rest}>
      <XStack alignItems="center" justifyContent="space-between" gap={tokens.spacing[3]}>
        <YStack flex={1} gap={tokens.spacing[1]}>
          <Text variant="subheading">{title}</Text>
          {description ? <Text variant="hint">{description}</Text> : null}
        </YStack>
        <Text
          aria-hidden
          style={{
            fontSize: tokens.typography.fontSize.xl,
            color: tokens.colors.gray.gray5,
          }}
        >
          ›
        </Text>
      </XStack>
    </Card>
  );
}
