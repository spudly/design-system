import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "./Button.js";
import { Text } from "./Text.js";

export type LogEntryCardProps = {
  /** The entry's header label (e.g. its date, pre-composed by the caller). */
  dateLabel: string;
  /** Optional star rating (1–5), rendered as filled stars in the header. */
  starRating?: number;
  /** Optional notes body. */
  notes?: string;
  /**
   * Delete callback. Omit it and the card renders no delete
   * action — entry data alone exposes no dead button.
   */
  onDeletePress?: () => void;
  /**
   * The delete action's accessible name — entry-specific
   * (position + date), so screen-reader button lists do not
   * show several identical "Delete" entries. Required in
   * practice whenever `onDeletePress` is given.
   */
  deleteAccessibilityLabel?: string;
};

/**
 * A log entry card (#119): a dated header with an optional star
 * rating, an optional notes body, and an optional delete action
 * — the entry shape of cook logs, visit logs, and journal
 * histories (extracted from RecipeDetailPage's cook history).
 * The card owns its frame (recessed fill, hairline border) and
 * internal rhythm; its separation from sibling entries is the
 * parent stack's. All content is caller-supplied, so the card
 * serves any app's logs.
 */
export function LogEntryCard({
  dateLabel,
  starRating,
  notes,
  onDeletePress,
  deleteAccessibilityLabel,
}: LogEntryCardProps) {
  return (
    <YStack
      borderRadius={tokens.radii.md}
      borderWidth={1}
      borderColor={tokens.colors.gray.gray2}
      backgroundColor={tokens.colors.gray.gray1}
      padding="$4"
    >
      <XStack paddingBlockEnd="$1" alignItems="center" justifyContent="space-between" gap="$2">
        <Text
          fontSize={tokens.typography.fontSize.sm}
          fontWeight={tokens.typography.fontWeight.medium}
          color={tokens.colors.gray.gray10}
        >
          {dateLabel}
        </Text>
        {starRating ? (
          <Text accessibilityLabel={`${starRating} stars`} color={tokens.colors.gray.gray10}>
            {"★".repeat(starRating)}
          </Text>
        ) : null}
      </XStack>
      {notes ? (
        <Text fontSize={tokens.typography.fontSize.sm} color={tokens.colors.gray.gray8}>
          {notes}
        </Text>
      ) : null}
      {onDeletePress ? (
        <XStack paddingBlockStart="$2">
          <Button
            variant="secondary"
            size="sm"
            backgroundColor={tokens.colors.danger.danger1}
            color={tokens.colors.danger.danger8}
            {...(deleteAccessibilityLabel
              ? { accessibilityLabel: deleteAccessibilityLabel }
              : null)}
            onPress={onDeletePress}
          >
            Delete
          </Button>
        </XStack>
      ) : null}
    </YStack>
  );
}
