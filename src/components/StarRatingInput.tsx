import { useId } from "react";
import { XStack, YStack, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

const StarButton = styled(YStack, {
  name: "SpudlyStarButton",

  minWidth: 44,
  minHeight: 44,
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
});

export interface StarRatingInputProps {
  /** Current rating, 0–5. */
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

/**
 * Interactive 5-star rating using ★ glyphs. Uses radiogroup semantics: the
 * container is `role="radiogroup"` and each star is a real button with
 * `role="radio"` and `aria-checked`. Selected stars render in an amber
 * tone, unselected in gray; every star is a ≥44px touch target.
 */
export function StarRatingInput({ value, onChange, label }: StarRatingInputProps) {
  const autoId = useId();
  const labelId = `${autoId}-label`;
  const stars = [1, 2, 3, 4, 5];

  return (
    <YStack gap={tokens.spacing[1]}>
      {label ? <Text id={labelId}>{label}</Text> : null}
      <XStack
        accessibilityRole="radiogroup"
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : "Star rating"}
      >
        {stars.map((star) => {
          const selected = star <= value;
          return (
            <StarButton
              key={star}
              accessibilityRole="radio"
              aria-checked={selected}
              accessibilityLabel={`Rate ${star} out of 5 stars`}
              onPress={() => onChange(star)}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize["3xl"],
                  color: selected ? tokens.colors.warning.warning6 : tokens.colors.gray.gray4,
                }}
              >
                ★
              </Text>
            </StarButton>
          );
        })}
      </XStack>
    </YStack>
  );
}
