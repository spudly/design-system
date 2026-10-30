import { XStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";
import { TextAction } from "./TextAction.js";

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
 * one (the app form's treatment).
 *
 * The Revert pressable is TextAction (#119 dedupe): the
 * tranche's first cut hand-built the button role and the web
 * Enter/Space handler inline — TextAction's exact job — so the
 * banner now composes it with the banner's treatment, the
 * same composition RevertAction makes.
 */
export function ChangedListBanner({ label, onRevert }: ChangedListBannerProps) {
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
      <Text
        flex={1}
        fontSize={tokens.typography.fontSize.sm}
        color={tokens.colors.warning.warning10}
      >
        {label}
      </Text>
      {onRevert ? (
        <TextAction
          onPress={onRevert}
          fontSize={tokens.typography.fontSize.sm}
          fontWeight={tokens.typography.fontWeight.medium}
          color={tokens.colors.warning.warning10}
          textDecorationLine="underline"
        >
          Revert
        </TextAction>
      ) : null}
    </XStack>
  );
}
