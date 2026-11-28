/* eslint-disable max-lines -- single cohesive card component (props, styles, render in one definition); splitting it would scatter one component across files (#902 T4) */
import { View } from "tamagui";

import { Row } from "../layout/Row.js";
import { Col } from "../layout/Col.js";
import { Spacer } from "../layout/Spacer.js";
import { tokens } from "../../tokens/index.js";
import { LoadingScope, useLoadingScope } from "../../contexts/LoadingScope.js";
import { BoxSkeleton } from "../feedback/BoxSkeleton.js";
import { Card } from "../layout/Card.js";
import { Center } from "../layout/Center.js";
import { StarRatingInput } from "../form/StarRatingInput.js";
import { useVoice } from "../../voice/index.js";
import { TextSkeleton } from "../feedback/TextSkeleton.js";

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
  /** Loading state (#278): the card renders skeletons mirroring
   * its layout — eyebrow bones at the label size, a star-line
   * bone and label bone for the community rating, and five star
   * bones in the star input's own 44dp cells for the viewer's
   * rating — with no real ratings and no live star controls.
   * The card's sections mirror the loaded card: a null community
   * rating skeletonizes as its single line, a null viewer rating
   * renders no viewer section, and stale hints skeletonize in
   * their slots. An enclosing composite's LoadingScope can also
   * put the card into this state without prop-drilling. */
  loading?: boolean;
};

// Stale-rating hint copy lives in the voice object (#539 tranche 1b):
// voice.ratingsCard.staleCommunityRatingHint / staleViewerRatingHint.

// The viewer star row's five cells (#278), mirroring the star
// input's own five stars.
const LOADING_STAR_KEYS = [
  "loading-1",
  "loading-2",
  "loading-3",
  "loading-4",
  "loading-5",
] as const;

function EyebrowLabel({ children }: { children: string }) {
  return (
    <Col>
      <Text variant="label">{children}</Text>
      <Spacer y="xs" />
    </Col>
  );
}

function EyebrowSkeleton() {
  return (
    <Col>
      <View width="45%">
        <TextSkeleton size="xs" lines={1} />
      </View>
      <Spacer y="xs" />
    </Col>
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
export function RatingsCard({ ratings, onViewerRatingChange, loading = false }: RatingsCardProps) {
  const voice = useVoice();
  const showSkeleton = useLoadingScope(loading);
  if (showSkeleton) {
    // Loading (#278): the same muted card and section layout,
    // skeletonized run by run — each eyebrow a bone at the label
    // size in its own slot, the community star line and its
    // label as bones at their sizes in their row, the viewer's
    // stars as five bones centered in the input's own 44dp
    // cells, and stale hints as two-line bones in their slots.
    // No real ratings, no star controls, and the card (through
    // its own loading scope) marks the region busy.
    return (
      <LoadingScope active>
        <Card variant="muted" loading>
          <EyebrowSkeleton />
          {ratings.community ? (
            <>
              <Col>
                <Row middle gap="s">
                  <View width={110}>
                    <TextSkeleton size="md" lines={1} />
                  </View>
                  <View width={64}>
                    <TextSkeleton size="sm" lines={1} />
                  </View>
                </Row>
                <Spacer y="m" />
              </Col>
              {ratings.community.hasStaleRatings ? (
                <Col>
                  <TextSkeleton size="xs" lines={2} />
                  <Spacer y="m" />
                </Col>
              ) : null}
            </>
          ) : (
            <Col>
              <View width="60%">
                <TextSkeleton size="sm" lines={1} />
              </View>
              <Spacer y="m" />
            </Col>
          )}
          {ratings.viewer ? (
            <>
              <EyebrowSkeleton />
              <Row>
                {LOADING_STAR_KEYS.map((key) => (
                  <Center key={key} width={44} height={44}>
                    <BoxSkeleton width={24} height={24} />
                  </Center>
                ))}
              </Row>
              {ratings.viewer.isStale ? (
                <Col>
                  <Spacer y="s" />
                  <TextSkeleton size="xs" lines={2} />
                </Col>
              ) : null}
            </>
          ) : null}
        </Card>
      </LoadingScope>
    );
  }
  return (
    <Card variant="muted">
      <EyebrowLabel>{voice.ratingsCard.communityRatingLabel}</EyebrowLabel>
      {ratings.community ? (
        <>
          <Col>
            <Row middle gap="s">
              <Text color={tokens.colors.warning.warning5}>{ratings.community.stars}</Text>
              <Text fontSize={tokens.typography.fontSize.sm} color={tokens.colors.gray.gray9}>
                {ratings.community.label}
              </Text>
            </Row>
            <Spacer y="m" />
          </Col>
          {ratings.community.hasStaleRatings ? (
            <Col>
              <Text fontSize={tokens.typography.fontSize.xs} color={tokens.colors.warning.warning9}>
                {voice.ratingsCard.staleCommunityRatingHint}
              </Text>
              <Spacer y="m" />
            </Col>
          ) : null}
        </>
      ) : (
        <Col>
          <Text fontSize={tokens.typography.fontSize.sm} color={tokens.colors.gray.gray7}>
            {voice.ratingsCard.noCommunityRatingsLabel}
          </Text>
          <Spacer y="m" />
        </Col>
      )}
      {ratings.viewer ? (
        <>
          <EyebrowLabel>{voice.ratingsCard.yourRatingLabel}</EyebrowLabel>
          <ViewerRatingInput
            value={ratings.viewer.value}
            isPending={ratings.viewer.isPending ?? false}
            onChange={onViewerRatingChange}
          />
          {ratings.viewer.isStale ? (
            <Col>
              <Spacer y="s" />
              <Text fontSize={tokens.typography.fontSize.xs} color={tokens.colors.warning.warning9}>
                {voice.ratingsCard.staleViewerRatingHint}
              </Text>
            </Col>
          ) : null}
        </>
      ) : null}
    </Card>
  );
}
