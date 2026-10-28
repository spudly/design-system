import { useId } from "react";
import { XStack, YStack, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

const StarButton = styled(YStack, {
  name: "StarButton",

  minWidth: 44,
  minHeight: 44,
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
});

const StarCell = styled(YStack, {
  name: "StarCell",

  minWidth: 44,
  minHeight: 44,
  alignItems: "center",
  justifyContent: "center",
});

export type StarRatingTone = "default" | "dark";

export type StarRatingInputProps = {
  /** Current rating, 0–5. */
  value: number;
  onChange: (value: number) => void;
  label?: string;
  /**
   * Color treatment for the stars. `default` renders unselected stars in
   * gray, for light surfaces. `dark` is for dark surfaces (e.g. the
   * cooking-mode overlay): unselected stars render near-white at reduced
   * opacity so they stay visible without competing with selected stars.
   * Selected stars render in the amber tone either way.
   */
  tone?: StarRatingTone;
  /**
   * When true, pressing the star that matches the current rating clears
   * the rating (calls `onChange` with 0). Defaults to false, so call
   * sites that implement toggle-off themselves are unaffected.
   */
  allowClear?: boolean;
  /**
   * When true, the rating renders as a static display: the stars are not
   * buttons and presses do nothing. `onChange` is never called.
   */
  readOnly?: boolean;
  /** When true, the input is inert and dimmed; presses do nothing. */
  disabled?: boolean;
};

/**
 * Interactive 5-star rating using ★ glyphs. Uses radiogroup semantics: the
 * container is `role="radiogroup"` and each star is a real button with
 * `role="radio"` and `aria-checked`. Selected stars render in an amber
 * tone, unselected in gray (or near-white at reduced opacity with
 * `tone="dark"`); every star is a ≥44px touch target. With `readOnly`,
 * the same stars render as a static, non-interactive display.
 */
export function StarRatingInput({
  value,
  onChange,
  label,
  tone = "default",
  allowClear = false,
  readOnly = false,
  disabled = false,
}: StarRatingInputProps) {
  const autoId = useId();
  const labelId = `${autoId}-label`;
  const stars = [1, 2, 3, 4, 5];

  const starStyle = (star: number) => {
    const selected = star <= value;
    if (selected) {
      return { color: tokens.colors.warning.warning6, opacity: 1 };
    }
    return tone === "dark"
      ? { color: tokens.colors.gray.gray1, opacity: 0.3 }
      : { color: tokens.colors.gray.gray4, opacity: 1 };
  };

  return (
    <YStack gap={tokens.spacing[1]}>
      {label ? <Text id={labelId}>{label}</Text> : null}
      {readOnly ? (
        <XStack
          accessibilityRole="image"
          accessibilityLabel={`Rated ${value} out of 5 stars`}
          aria-label={`Rated ${value} out of 5 stars`}
        >
          {stars.map((star) => {
            const style = starStyle(star);
            return (
              <StarCell key={star}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize["3xl"],
                    color: style.color,
                    opacity: style.opacity,
                  }}
                >
                  ★
                </Text>
              </StarCell>
            );
          })}
        </XStack>
      ) : (
        <XStack
          accessibilityRole="radiogroup"
          aria-labelledby={label ? labelId : undefined}
          aria-label={label ? undefined : "Star rating"}
          opacity={disabled ? 0.5 : 1}
        >
          {stars.map((star) => {
            const selected = star <= value;
            const style = starStyle(star);
            return (
              <StarButton
                key={star}
                accessibilityRole="radio"
                aria-checked={selected}
                accessibilityState={{ disabled }}
                disabled={disabled}
                accessibilityLabel={`Rate ${star} out of 5 stars`}
                onPress={() => {
                  if (disabled) {
                    return;
                  }
                  onChange(allowClear && star === value ? 0 : star);
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize["3xl"],
                    color: style.color,
                    opacity: style.opacity,
                  }}
                >
                  ★
                </Text>
              </StarButton>
            );
          })}
        </XStack>
      )}
    </YStack>
  );
}
