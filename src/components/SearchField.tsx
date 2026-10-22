import { useId } from "react";
import { Input as TamaguiInput, Label, View, XStack, YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

/**
 * The ⌕ glyph must NOT get an explicit lineHeight. It previously received
 * one equal to its font size (36), on the theory that web needed a "36px"
 * string (a unitless 36 is read by CSS as a multiplier — a 1296px line
 * box) while React Native "takes the plain number". The native half of
 * that theory was wrong: an on-device uiautomator dump for
 * spudly/eciperay#162 (Pixel 8a, Android) shows the glyph's host view and
 * this field's container stretched to the full content height (1826px,
 * clipped at the region's bottom edge), with every sibling control and
 * the recipe list missing from the layout — Tamagui's style engine
 * resolves the numeric lineHeight the same multiplying way on native.
 * With no lineHeight prop the glyph takes the font's line height
 * (size × 1.5), and it renders inside StyledGlyphBox — a fixed-height
 * clipping box — so a mis-measured glyph can never again grow the
 * field, while the row itself keeps a minHeight so a caller-sized
 * input (SearchField forwards input props via ...rest) can still
 * grow it.
 *
 * The glyph's SIZE is also capped by that box (spudly/design-system#45):
 * at 36px its natural line box is ~54px — taller than the 44px glyph
 * box — so the box centered the oversized line box, not the glyph ink,
 * and on Android the ink rode visibly above center. Shrinking the
 * character to 24px (line box ~36px, fits the box) was tried next and
 * was STILL off-center (Stephen, on-device check, 2026-10-22): the ⌕
 * character's ink is not centered inside its own em box at any size,
 * and Android's fallback font for the codepoint shifts it further —
 * no font size centers asymmetric ink. The search icon is therefore
 * no longer a text glyph at all: SearchGlyph below draws it from two
 * fixed-dimension shapes (a bordered circle + a rotated bar) inside a
 * 24px box, so the flex centering of StyledGlyphBox centers the icon
 * by construction, identically on web and native. Do not reintroduce
 * a text glyph for this icon, and do not "fix" centering with an
 * explicit lineHeight — that is the explosion above.
 */

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
  // minHeight, deliberately not a fixed height: the row must stay
  // able to grow for a caller-sized input (props forward via ...rest).
  // What must never grow it is the glyph — that is capped separately
  // by StyledGlyphBox below (on Android this container reached 1826px
  // when the glyph's line box exploded; see the note at the top).
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

const StyledGlyphBox = styled(XStack, {
  name: "SpudlySearchFieldGlyphBox",

  // Fixed height + hidden overflow: the glyph's own box. If the
  // glyph's measurement ever explodes again, it clips inside this
  // 44px box instead of stretching the row (eciperay#162).
  height: 44,
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  flexShrink: 0,
});

/**
 * The search icon, drawn from fixed-dimension shapes rather than the
 * "⌕" text glyph — see the note at the top of this file (#45). The
 * lens is a bordered circle; the handle is a rounded bar rotated 45°,
 * overlapping the lens edge on its lower-right diagonal. Both are
 * absolutely positioned inside a fixed 24px box, so the icon's own
 * geometry — not a font's metrics — decides where the ink sits, and
 * StyledGlyphBox's flex centering centers the icon itself.
 */
function SearchGlyph() {
  return (
    <View aria-hidden position="relative" width={24} height={24} flexShrink={0}>
      <View
        position="absolute"
        left={3}
        top={3}
        width={13}
        height={13}
        borderRadius={7}
        borderWidth={2}
        borderColor="$textMuted"
      />
      <View
        position="absolute"
        left={13.5}
        top={15.5}
        width={7.5}
        height={2.6}
        borderRadius={1.3}
        backgroundColor="$textMuted"
        rotate="45deg"
      />
    </View>
  );
}

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
 * Search input with a leading search icon (drawn shapes, not a text
 * glyph — see the note at the top of this file) and a clear (×) button
 * that appears
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
        <StyledGlyphBox>
          <SearchGlyph />
        </StyledGlyphBox>
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
