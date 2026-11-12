import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { LoadingScope, useLoadingScope } from "../contexts/LoadingScope.js";
import { Button } from "../widgets/Button.js";
import { Text } from "../widgets/Text.js";
import { TextSkeleton } from "../widgets/TextSkeleton.js";

export type ChangedListBannerProps = {
  /** The host-formatted summary line (the parent summary is
   * included by the host). */
  label: string;
  /** Renders the underlined Revert action when provided. */
  onRevert?: () => void;
  /** Loading state (#278): the label renders as a text
   * skeleton at its own (sm) size in its flex-1 slot, the
   * banner's warning wash stays, and the Revert ghost action
   * stays rendered inside the loading scope so it renders as
   * a text bone. An enclosing composite's LoadingScope can
   * also put the banner into this state without
   * prop-drilling. */
  loading?: boolean;
};

/**
 * The changed-list banner (#119, extracted from
 * RecipeFormPage): a warning wash row with the host's summary
 * line for a list that differs from the version it was derived
 * from, and an underlined Revert action when the host offers
 * one (the app form's treatment).
 *
 * The Revert pressable is a ghost Button (#464, retiring
 * TextAction): the tranche's first cut hand-built the button
 * role and the web Enter/Space handler inline, so the banner
 * composes the shared button in its chrome-less ghost form,
 * the same composition RevertAction makes.
 */
export function ChangedListBanner({ label, onRevert, loading = false }: ChangedListBannerProps) {
  const showSkeleton = useLoadingScope(loading);
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
      {showSkeleton ? (
        <YStack flex={1}>
          <TextSkeleton size="sm" lines={1} />
        </YStack>
      ) : (
        <Text
          flex={1}
          fontSize={tokens.typography.fontSize.sm}
          color={tokens.colors.warning.warning10}
        >
          {label}
        </Text>
      )}
      <LoadingScope active={showSkeleton}>
        {onRevert ? (
          <Button ghost size="sm" onPress={onRevert}>
            Revert
          </Button>
        ) : null}
      </LoadingScope>
    </XStack>
  );
}
