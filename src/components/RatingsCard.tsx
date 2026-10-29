import { View, XStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Card } from "./Card.js";
import { StarRatingInput } from "./StarRatingInput.js";
import { Text } from "./Text.js";

/**
 * The community + viewer ratings card: the engagement block the
 * two recipe surfaces (RecipeDetailPage and PublicRecipePage)
 * render identically from the same ratings view-model — a
 * community average with its star string, an optional stale-rating
 * hint (ratings left on earlier versions count at half weight),
 * and the viewer's own star input with the same stale treatment.
 * Both pages carried this card inline before it moved here
 * (#119); the view-model shape is declared here structurally so
 * either page's ratings object composes it without a second
 * shape to drift. The card carries no outer spacing — separation
 * from the sections around it is the parent stack's.
 */

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
  ratings: RatingsCardRatings;
  onViewerRatingChange?: ((stars: number | null) => void) | undefined;
};

// Stale-rating hint copy, verbatim from the app's client
// constants (carried by both recipe surfaces).
const STALE_COMMUNITY_RATING_HINT =
  "Some community ratings were left on earlier recipe versions and count at half weight in the average.";
const STALE_VIEWER_RATING_HINT =
  "Your rating was left on an earlier version of the recipe. Tap a star to update it for the current version.";

function EyebrowLabel({ children }: { children: string }) {
  return (
    <Text
      marginBlockEnd="$1"
      fontSize={tokens.typography.fontSize.xs}
      fontWeight={tokens.typography.fontWeight.medium}
      letterSpacing={0.3}
      color={tokens.colors.gray.gray6}
      textTransform="uppercase"
    >
      {children}
    </Text>
  );
}

/** The viewer's star input with the app adapter's semantics
 * preserved: pressing the current star clears the rating (null),
 * and a pending rating disables the input behind a
 * non-interactive wrapper. */
function ViewerRatingInput({
  value,
  isPending = false,
  onChange,
}: {
  value: number | null;
  isPending?: boolean;
  onChange: ((stars: number | null) => void) | undefined;
}) {
  const interactive = !isPending && onChange !== undefined;
  return (
    <View
      pointerEvents={interactive ? "auto" : "none"}
      opacity={isPending ? 0.5 : undefined}
      {...platformAccessibilityProps({ accessibilityState: { disabled: isPending } })}
    >
      <StarRatingInput
        value={value ?? 0}
        onChange={(star) => {
          if (!isPending && onChange) {
            onChange(value === star ? null : star);
          }
        }}
      />
    </View>
  );
}

export function RatingsCard({ ratings, onViewerRatingChange }: RatingsCardProps) {
  return (
    <Card variant="muted">
      <EyebrowLabel>Community rating</EyebrowLabel>
      {ratings.community ? (
        <>
          <XStack marginBlockEnd="$3" alignItems="center" gap="$2">
            <Text color={tokens.colors.warning.warning5}>{ratings.community.stars}</Text>
            <Text fontSize={tokens.typography.fontSize.sm} color={tokens.colors.gray.gray9}>
              {ratings.community.label}
            </Text>
          </XStack>
          {ratings.community.hasStaleRatings ? (
            <Text
              marginBlockEnd="$3"
              fontSize={tokens.typography.fontSize.xs}
              color={tokens.colors.warning.warning9}
            >
              {STALE_COMMUNITY_RATING_HINT}
            </Text>
          ) : null}
        </>
      ) : (
        <Text
          marginBlockEnd="$3"
          fontSize={tokens.typography.fontSize.sm}
          color={tokens.colors.gray.gray7}
        >
          No community ratings yet
        </Text>
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
            <Text
              marginBlockStart="$2"
              fontSize={tokens.typography.fontSize.xs}
              color={tokens.colors.warning.warning9}
            >
              {STALE_VIEWER_RATING_HINT}
            </Text>
          ) : null}
        </>
      ) : null}
    </Card>
  );
}
