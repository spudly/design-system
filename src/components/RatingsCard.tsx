import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Card } from "./Card.js";
import { StarRatingInput } from "./StarRatingInput.js";
import { Text } from "./Text.js";

export type RatingsCardCommunityRating = {
  /** Pre-rendered star string ("★★★★★"), app-formatted from the average. */
  stars: string;
  /** App-formatted label ("4.6 (9)"). */
  label: string;
  hasStaleRatings?: boolean;
};

export type RatingsCardViewerRating = {
  /** The viewer's stars, or null when they have not rated. */
  value: number | null;
  isStale?: boolean;
  /** Rating mutation in flight: the input disables. */
  isPending?: boolean;
};

export type RatingsCardRatings = {
  /** Null renders the "No community ratings yet" line. */
  community: RatingsCardCommunityRating | null;
  /** Null (signed out) hides the "Your rating" input entirely. */
  viewer: RatingsCardViewerRating | null;
};

export type RatingsCardProps = {
  /** The community + viewer rating view-model. */
  ratings: RatingsCardRatings;
  /**
   * The viewer's rating change, with the star pressed — or null
   * when the viewer pressed their current star again (clearing
   * the rating). Pass undefined for a read-only card: the input
   * renders non-interactive.
   */
  onViewerRatingChange?: ((stars: number | null) => void) | undefined;
};

// Stale-rating hint copy, verbatim from the app's client constants.
const STALE_COMMUNITY_RATING_HINT =
  "Some community ratings were left on earlier recipe versions and count at half weight in the average.";
const STALE_VIEWER_RATING_HINT =
  "Your rating was left on an earlier version of the recipe. Tap a star to update it for the current version.";

function EyebrowLabel({ children }: { children: string }) {
  return (
    <YStack paddingBlockEnd="$1">
      <Text variant="label">{children}</Text>
    </YStack>
  );
}

/** The viewer's star input with the app adapter's semantics
 * preserved: pressing the current star clears the rating (null),
 * and a pending rating disables the input. The non-interactive
 * states are the input's own (`readOnly` when the card has no
 * change handler, `disabled` while a rating is pending), so the
 * semantics reach the star controls themselves — a pointerEvents
 * wrapper would leave the stars focusable and announced as
 * enabled on web while silently dropping their presses. */
function ViewerRatingInput({
  value,
  isPending = false,
  onChange,
}: {
  value: number | null;
  isPending?: boolean;
  onChange: ((stars: number | null) => void) | undefined;
}) {
  return (
    <StarRatingInput
      value={value ?? 0}
      readOnly={onChange === undefined}
      disabled={isPending}
      onChange={(star) => {
        if (!isPending && onChange) {
          onChange(value === star ? null : star);
        }
      }}
    />
  );
}

/**
 * The ratings card (#119): a muted card pairing the community
 * rating (stars + label, with the stale-ratings notice when
 * some ratings predate the current version) with the viewer's
 * own star input (with its own stale notice). Extracted from
 * RecipeDetailPage's engagement stack; the card owns its frame
 * and internal rhythm, and its separation from surrounding
 * content is the parent stack's. The rating strings are
 * caller-supplied pre-composed values, so the card serves any
 * app's rated content.
 */
export function RatingsCard({ ratings, onViewerRatingChange }: RatingsCardProps) {
  return (
    <Card variant="muted">
      <EyebrowLabel>Community rating</EyebrowLabel>
      {ratings.community ? (
        <>
          <XStack paddingBlockEnd="$3" alignItems="center" gap="$2">
            <Text color={tokens.colors.warning.warning5}>{ratings.community.stars}</Text>
            <Text fontSize={tokens.typography.fontSize.sm} color={tokens.colors.gray.gray9}>
              {ratings.community.label}
            </Text>
          </XStack>
          {ratings.community.hasStaleRatings ? (
            <YStack paddingBlockEnd="$3">
              <Text fontSize={tokens.typography.fontSize.xs} color={tokens.colors.warning.warning9}>
                {STALE_COMMUNITY_RATING_HINT}
              </Text>
            </YStack>
          ) : null}
        </>
      ) : (
        <YStack paddingBlockEnd="$3">
          <Text fontSize={tokens.typography.fontSize.sm} color={tokens.colors.gray.gray7}>
            No community ratings yet
          </Text>
        </YStack>
      )}
      {ratings.viewer ? (
        <>
          <EyebrowLabel>Your rating</EyebrowLabel>
          <ViewerRatingInput
            value={ratings.viewer.value}
            isPending={ratings.viewer.isPending ?? false}
            onChange={onViewerRatingChange}
          />
          {ratings.viewer.isStale ? (
            <YStack paddingBlockStart="$2">
              <Text fontSize={tokens.typography.fontSize.xs} color={tokens.colors.warning.warning9}>
                {STALE_VIEWER_RATING_HINT}
              </Text>
            </YStack>
          ) : null}
        </>
      ) : null}
    </Card>
  );
}
