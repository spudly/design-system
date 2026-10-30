import { useId } from "react";
import { XStack, YStack, isWeb, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
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
 * the same stars render as a static, non-interactive display. With
 * `disabled`, the stars leave the focus order on both platforms —
 * `focusable={false}` on native, `tabIndex={-1}` on web (the Badge /
 * TextAction disabled treatment) — and the disabled state is
 * announced consistently: the translator's `aria-disabled` is
 * restated explicitly on web after the Tamagui `disabled` prop, so
 * a disabled star can never render with a contradictory
 * `aria-disabled="false"` (#316).
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
          {...platformAccessibilityProps({
            accessibilityRole: "image",
            accessibilityLabel: `Rated ${value} out of 5 stars`,
          })}
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
          {...platformAccessibilityProps({ accessibilityRole: "radiogroup" })}
          aria-labelledby={label ? labelId : undefined}
          aria-label={label ? undefined : "Star rating"}
          opacity={disabled ? 0.5 : 1}
        >
          {stars.map((star) => {
            const selected = star <= value;
            const style = starStyle(star);
            // Web keyboard activation for an enabled star (the
            // CardRow pattern): a view carrying a role is made
            // focusable by its tabIndex, and the button keys —
            // Enter and Space — invoke the same change as a press.
            // A held key's repeats are ignored, matching a native
            // button. Disabled stars never activate.
            const handleKeyDown = (event: {
              key: string;
              repeat?: boolean;
              preventDefault: () => void;
            }) => {
              if (!disabled && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                if (!event.repeat) {
                  onChange(allowClear && star === value ? 0 : star);
                }
              }
            };
            return (
              <StarButton
                key={star}
                {...platformAccessibilityProps({
                  accessibilityRole: "radio",
                  accessibilityState: { disabled },
                  accessibilityLabel: `Rate ${star} out of 5 stars`,
                })}
                aria-checked={selected}
                disabled={disabled}
                {...(disabled && !isWeb
                  ? // Native focus removal (#316): React Native's
                    // `focusable={false}` takes a disabled star out of
                    // the keyboard / switch-access focus order. The
                    // prop is an RN View prop Tamagui's stack types do
                    // not declare, so it rides a native-only spread
                    // (the Slider nativeAdjustProps pattern); Tamagui
                    // forwards it to the RN View at runtime. Web gets
                    // `tabIndex={-1}` below instead.
                    ({ focusable: false } as Record<string, unknown>)
                  : null)}
                tabIndex={disabled ? -1 : 0}
                {...(isWeb ? { "aria-disabled": disabled } : null)}
                onPress={() => {
                  if (disabled) {
                    return;
                  }
                  onChange(allowClear && star === value ? 0 : star);
                }}
                onKeyDown={handleKeyDown}
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
