import { useId } from "react";
import { Input as TamaguiInput, Label, XStack, YStack, isWeb, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

/**
 * Line height for the ⌕ glyph, matched to its 36px font size. A numeric
 * lineHeight reaches web CSS unitless (both via a raw `style` object and
 * via Tamagui's own style engine), where CSS reads it as a multiplier:
 * line-height:36 at a 36px font is a 1296px line box, which forced the
 * 44px row — and the page — to grow past the viewport. Web therefore
 * needs the px string; React Native takes the plain number.
 */
const glyphLineHeight = isWeb
  ? `${tokens.typography.fontSize["4xl"]}px`
  : tokens.typography.fontSize["4xl"];

const StyledContainer = styled(XStack, {
  name: "SpudlySearchField",

  backgroundColor: "$surface",
  borderWidth: 1,
  // $textMuted, not $borderColor: input boundaries need ≥3:1 against
  // adjacent colors (WCAG 1.4.11) in both modes — see TextField.
  borderColor: "$textMuted",
  borderRadius: tokens.radii.md,
  paddingLeft: tokens.spacing[3],
  paddingRight: tokens.spacing[1],
  minHeight: 44,
  alignItems: "center",
  gap: tokens.spacing[2],
  // The focus ring belongs on the whole field, not the inner input (whose
  // own outline is suppressed below): when anything inside is focused, the
  // container shows the ring. Tamagui v3 condition clauses in the value.
  outlineWidth: "0px focus-within:2px",
  outlineStyle: "none focus-within:solid",
  outlineColor: "$link",
  outlineOffset: 2,
});

const StyledInput = styled(TamaguiInput, {
  name: "SpudlySearchFieldInput",

  flex: 1,
  borderWidth: 0,
  // The umbrella Input skin's default size variant sets borderRadius to
  // the bare token name "md"; this package's radius scale is keyed by
  // number, so the unresolved string is expanded into the native text
  // input's four corner radii and Android throws ClassCastException
  // (String -> Double) when the input mounts (spudly/eciperay#150). The
  // input is borderless by design — the container owns the visible
  // radius — so pin the numeric zero here rather than relying on every
  // app wrapper to pin it (the eciperay wrappers do, as a stopgap).
  borderRadius: tokens.radii.zero,
  backgroundColor: "transparent",
  paddingHorizontal: 0,
  fontSize: tokens.typography.fontSize.md,
  color: "$color",
  // No ring on the input itself — the container carries it (focus-within).
  outlineWidth: 0,
  outlineStyle: "none",
});

type StyledInputProps = GetProps<typeof StyledInput>;

export interface SearchFieldProps extends Omit<StyledInputProps, "value" | "onChangeText"> {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  id?: string;
}

/**
 * Search input with a leading "⌕" glyph and a clear (×) button that appears
 * when there is a value. The clear button is a real button with
 * `accessibilityLabel="Clear search"` and a 44px touch target. An optional
 * visible `label` is associated via `htmlFor`.
 */
export function SearchField({
  value,
  onChangeText,
  label,
  id: idProp,
  placeholder,
  ...rest
}: SearchFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;

  return (
    <YStack gap={tokens.spacing[1]}>
      {label ? (
        <Label htmlFor={id} fontSize={tokens.typography.fontSize.sm}>
          {label}
        </Label>
      ) : null}
      <StyledContainer>
        <Text
          aria-hidden
          // ~2x the previous lg (18px) glyph so the search affordance
          // reads at a glance; lineHeight keeps it inside the 44px row
          // (see glyphLineHeight above for why it is platform-split).
          fontSize={tokens.typography.fontSize["4xl"]}
          lineHeight={glyphLineHeight}
          color="$textMuted"
        >
          ⌕
        </Text>
        <StyledInput
          id={id}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          {...rest}
        />
        {value ? (
          <XStack
            onPress={() => onChangeText("")}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            alignItems="center"
            justifyContent="center"
            minWidth={44}
            minHeight={44}
          >
            <Text
              aria-hidden
              style={{
                fontSize: tokens.typography.fontSize.lg,
                color: "$textMuted",
              }}
            >
              ×
            </Text>
          </XStack>
        ) : null}
      </StyledContainer>
    </YStack>
  );
}
