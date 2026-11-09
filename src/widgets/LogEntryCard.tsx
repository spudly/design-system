import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Button } from "./Button.js";
import { LoadingScope, useLoadingScope } from "./LoadingScope.js";
import { Text } from "./Text.js";
import { TextSkeleton } from "./TextSkeleton.js";

export type LogEntryCardProps = {
  /** The entry's header label (e.g. its date, pre-composed by the caller). */
  dateLabel: string;
  /** Loading state (#278): the card renders text skeletons in
   * place of its header and notes, with no rating; its delete
   * action stays in place as an inert rectangle skeleton
   * inside the loading scope. An enclosing composite's
   * LoadingScope can also put the card into this state without
   * prop-drilling. */
  loading?: boolean;
  /** Optional star rating (1–5), rendered as filled stars in the header. */
  starRating?: number;
  /** Optional notes body. */
  notes?: string;
} & (
  | {
      /**
       * Delete callback, with its accessible name — entry-specific
       * (position + date), so screen-reader button lists do not
       * show several identical "Delete" entries. The label is
       * required with the callback: a delete action without an
       * entry-specific name is indistinguishable from its siblings.
       */
      onDeletePress: () => void;
      deleteAccessibilityLabel: string;
    }
  | {
      /** No delete callback: the card renders no delete action —
       * entry data alone exposes no dead button. */
      onDeletePress?: undefined;
      deleteAccessibilityLabel?: undefined;
    }
);

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
  loading = false,
}: LogEntryCardProps) {
  const showSkeleton = useLoadingScope(loading);
  // The delete slot is one slot in both states: while loading
  // it renders inside the loading scope, where the Button
  // renders as an inert rectangle skeleton at its normal
  // geometry (Stephen on #551) instead of dropping out.
  const deleteAction = onDeletePress ? (
    <XStack paddingBlockStart="$2">
      <Button
        variant="secondary"
        size="sm"
        tone="danger"
        {...(deleteAccessibilityLabel ? { accessibilityLabel: deleteAccessibilityLabel } : {})}
        onPress={onDeletePress}
      >
        Delete
      </Button>
    </XStack>
  ) : null;
  if (showSkeleton) {
    // Loading (#278): the same framed card, with text skeletons
    // standing in for the header line and the notes — no rating,
    // the delete action as a rectangle skeleton, and the region
    // marked busy.
    return (
      <LoadingScope active>
        <YStack
          borderRadius={tokens.radii.md}
          borderWidth={1}
          borderColor={tokens.colors.gray.gray2}
          backgroundColor={tokens.colors.gray.gray1}
          padding="$4"
          {...platformAccessibilityProps({ accessibilityState: { busy: true } })}
        >
          <TextSkeleton lines={notes ? 2 : 1} />
          {deleteAction}
        </YStack>
      </LoadingScope>
    );
  }
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
      {deleteAction}
    </YStack>
  );
}
