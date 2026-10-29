import { XStack, YStack, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Text } from "./Text.js";

const STAR_STEPS = [1, 2, 3, 4, 5] as const;

// Touch-target geometry for the pressable form: a ≥44dp target
// centering its glyphs (the StarRatingInput precedent).
const StyledRatingTarget = styled(YStack, {
  name: "RatingStarTarget",

  minWidth: 44,
  minHeight: 44,
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
});

type RatingStarsBase = {
  /** Display rating, 0–5, or null/absent when unrated. The app
   * computes it by its display-rating rule; the component
   * renders it and never formats it into text. */
  rating?: number | null | undefined;
};

export type RatingStarsProps =
  | (RatingStarsBase & { onPress?: undefined; accessibilityLabel?: string | undefined })
  | (RatingStarsBase & { onPress: () => void; accessibilityLabel: string });

/**
 * A five-star display rating in the DS star language (the
 * StarRatingInput glyph treatment at reading size): ★ in
 * warning amber when filled, gray when not. The rating is a
 * display average as often as a personal star count, so the
 * stars fill by rounding to the nearest whole star. No
 * lineHeight is set on the glyphs (the #162 containment rule).
 *
 * With `onPress` the stars become the button for an action on
 * the rated item — a list row whose rating is its log-cook
 * control is the shape this serves. A rated item renders its
 * five stars as the button; an unrated item renders a single
 * unfilled star, no text — one glyph, same tone. The press
 * handler cancels the click's default action before firing:
 * the control typically renders inside a link (a row's text
 * target), and on web the platform press handling stops the
 * click's propagation but does not cancel its default, so
 * without the cancellation the wrapping anchor would also
 * navigate. On native the call is inert — the innermost press
 * target wins the responder. The button form requires its
 * accessible name in the type (the stars alone would announce
 * as a rating, not as the action they trigger), and it is
 * keyboard-operable on web: a focus stop with Enter/Space
 * activation (the CardRow pattern — a plain stack with onPress
 * is not a tab stop).
 */
export function RatingStars(props: RatingStarsProps) {
  if (!props.onPress) {
    return <RatingStarRow rating={props.rating} />;
  }
  const { rating, onPress, accessibilityLabel } = props;
  const handlePress = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    onPress();
  };
  const handleKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onPress();
    }
  };
  return (
    <StyledRatingTarget
      onPress={handlePress}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      {...platformAccessibilityProps({
        accessibilityRole: "button",
        accessibilityLabel,
      })}
    >
      {rating !== null && rating !== undefined && rating > 0 ? (
        <RatingStarRow rating={rating} />
      ) : (
        <Text style={{ fontSize: tokens.typography.fontSize.lg, color: tokens.colors.gray.gray4 }}>
          ★
        </Text>
      )}
    </StyledRatingTarget>
  );
}

/** The five glyphs themselves, filled by the rounded rating. */
function RatingStarRow({ rating }: { rating?: number | null | undefined }) {
  const filled =
    rating !== null && rating !== undefined && rating > 0
      ? Math.min(5, Math.max(1, Math.round(rating)))
      : 0;
  return (
    <XStack gap={tokens.spacing[1]} alignItems="center">
      {STAR_STEPS.map((star) => (
        <Text
          key={star}
          style={{
            fontSize: tokens.typography.fontSize.lg,
            color: star <= filled ? tokens.colors.warning.warning6 : tokens.colors.gray.gray4,
          }}
        >
          ★
        </Text>
      ))}
    </XStack>
  );
}
