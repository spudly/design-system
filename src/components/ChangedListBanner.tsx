import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Text } from "./Text.js";

export type ChangedListBannerProps = {
  /** The host-formatted summary line (the parent summary is
   * included by the host). */
  label: string;
  /** Renders the underlined Revert action when provided. */
  onRevert?: () => void;
};

/**
 * The changed-list banner (#119, extracted from
 * RecipeFormPage): a warning wash row with the host's summary
 * line for a list that differs from the version it was derived
 * from, and an underlined Revert action when the host offers
 * one (the app form's treatment). The Revert pressable routes
 * its button role through platformAccessibilityProps (#237)
 * and takes Enter / Space on web, like RevertAction.
 */
export function ChangedListBanner({ label, onRevert }: ChangedListBannerProps) {
  const handleKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if ((event.key === "Enter" || event.key === " ") && onRevert) {
      event.preventDefault();
      onRevert();
    }
  };
  return (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      gap={tokens.spacing[2]}
      borderRadius={tokens.radii.md}
      backgroundColor={tokens.colors.warning.warning1}
      paddingHorizontal={tokens.spacing[3]}
      paddingVertical={tokens.spacing[2]}
    >
      <Text flex={1} fontSize={tokens.typography.fontSize.sm} color={tokens.colors.warning.warning10}>
        {label}
      </Text>
      {onRevert ? (
        <YStack
          {...platformAccessibilityProps({ accessibilityRole: "button" })}
          onPress={onRevert}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          cursor="web:pointer"
        >
          <Text
            fontSize={tokens.typography.fontSize.sm}
            fontWeight={tokens.typography.fontWeight.medium}
            color={tokens.colors.warning.warning10}
            textDecorationLine="underline"
          >
            Revert
          </Text>
        </YStack>
      ) : null}
    </XStack>
  );
}
