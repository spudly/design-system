import { forwardRef, useId } from "react";
import type { ReactNode } from "react";
import { Input as TamaguiInput, View, XStack, styled } from "tamagui";
import type { GetProps, TamaguiElement } from "tamagui";
import { Row } from "../layout/Row.js";
import { tokens } from "../../tokens/index.js";
import { platformAccessibilityProps } from "../accessibility.js";
import { FieldShell } from "./FieldShell.js";
import { Text } from "../data/Text.js";
import { FieldError } from "./FieldError.js";

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
 * (size × 1.5), and it renders inside GlyphBox — a fixed-height
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
 * 24px box, so the flex centering of GlyphBox centers the icon
 * by construction, identically on web and native. Do not reintroduce
 * a text glyph for this icon, and do not "fix" centering with an
 * explicit lineHeight — that is the explosion above.
 */

/**
 * The field's bordered container. This root KEEPS a styled
 * surface (#746, Option B exception — recorded for the
 * tranche-9 ESLint allowlist): the focus ring belongs on the
 * whole field, not the inner input (whose own outline is
 * suppressed), and Tamagui exposes pseudo-style props
 * (focus-within) only inside styled() configs — a plain
 * function component cannot express the ring. Everything the
 * subset can say is restated here in the styled config; the
 * asymmetric horizontal padding (12px leading, 4px trailing —
 * the clear button carries its own 44px target) and the
 * grow path's height fill stay as before.
 */
const StyledContainer = styled(XStack, {
  name: "SearchField",

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
  // by GlyphBox below (on Android this container reached 1826px
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

  variants: {
    // Embedded (#805): the caller's field frame owns the border,
    // background, and focus ring, so the container renders none
    // of its own.
    // Error state (#804): the container's border takes the
    // danger color, the same error border TextField's styled
    // input carries. The embedded form renders no border of its
    // own, so an embedded field's error border is its frame's
    // owner's concern (AutocompletePicker renders its own error
    // Alert below the frame instead).
    error: {
      true: {
        borderColor: "$danger",
      },
    },
    embedded: {
      true: {
        borderWidth: 0,
        backgroundColor: "transparent",
        paddingLeft: 0,
        paddingRight: 0,
        outlineWidth: "0px",
        outlineStyle: "none",
      },
    },
  },
});

/**
 * The glyph's own box (#746, Option B): fixed height + hidden
 * overflow. If the glyph's measurement ever explodes again, it
 * clips inside this 44px box instead of stretching the row
 * (eciperay#162). The never-shrink rule rides the style
 * channel — Row's shrink prop only adds shrink, it cannot
 * pin 0.
 */
function GlyphBox({ children }: { children: ReactNode }) {
  return (
    <Row middle center height={44} overflow="hidden" style={{ flexShrink: 0 }}>
      {children}
    </Row>
  );
}

/**
 * The search icon, drawn from fixed-dimension shapes rather than the
 * "⌕" text glyph — see the note at the top of this file (#45). The
 * lens is a bordered circle; the handle is a rounded bar rotated 45°,
 * overlapping the lens edge on its lower-right diagonal. Both are
 * absolutely positioned inside a fixed 24px box, so the icon's own
 * geometry — not a font's metrics — decides where the ink sits, and
 * GlyphBox's flex centering centers the icon itself.
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
  name: "SearchFieldInput",

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

export type SearchFieldProps = Omit<StyledInputProps, "value" | "onChangeText"> & {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  id?: string;
  /** Grow to fill the remaining width of a row the field sits in
   * (an inline search row beside a button — #119): the field's root
   * takes flex: 1 so the row's other children keep their natural
   * width. On the grow path the bordered container also fills the
   * root's height (flex: 1, no-label case), so in a FieldRow —
   * whose stretch alignment sets one common height — the field's
   * box matches its button exactly (#476); the 44px glyph box
   * inside stays 44 and centered. Off by default; a standalone
   * field sizes as before. */
  grow?: boolean;
  /** Borderless form for embedding inside a bordered field frame
   * owned by the caller (AutocompletePicker's in-field chips
   * frame, #805): the container drops its own border, background,
   * horizontal padding, and focus ring — the caller's frame owns
   * all four — and the field flexes to share the frame's row with
   * whatever else the frame holds. Used only by the picker; every
   * other consumer renders the standalone bordered field. */
  embedded?: boolean;
  /**
   * Validation error (#804): rendered below the field through
   * the shared FieldError (an Alert), wired to the input with
   * `aria-invalid` / `aria-describedby` at `${id}-error`, and
   * the container's border takes the error treatment.
   */
  error?: string;
};

/**
 * Search input with a leading search icon (drawn shapes, not a text
 * glyph — see the note at the top of this file) and a clear (×) button
 * that appears
 * when there is a value. The clear button is a real button with
 * `accessibilityLabel="Clear search"` and a 44px touch target. An optional
 * visible `label` is associated via `htmlFor`.
 *
 * `disabled` disables the whole field, clear button included: the
 * input takes the prop as before, and the clear button drops its
 * press handler entirely and reports the disabled state through
 * the platform translator (the ListItem disabled treatment) — a
 * disabled field's text cannot be cleared out from under its
 * owner. The component forwards a ref to the inner input, so a
 * caller that must move focus back to the field — the
 * AutocompletePicker after a selection unmounts the focused
 * result row — can do so through the input's own `focus()`.
 */
export const SearchField = forwardRef<TamaguiElement, SearchFieldProps>(function SearchField(
  {
    value,
    onChangeText,
    label,
    id: idProp,
    placeholder,
    grow = false,
    embedded = false,
    error,
    disabled = false,
    onSubmitEditing,
    onCompositionStart,
    onCompositionEnd,
    ...rest
  }: SearchFieldProps,
  ref,
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const errorId = `${id}-error`;

  return (
    <FieldShell
      label={label}
      id={id}
      grow={grow}
      onCompositionStart={onCompositionStart}
      onCompositionEnd={onCompositionEnd}
      onSubmitEditing={onSubmitEditing}
    >
      {({ submitEditingProps, compositionProps }) => (
        <>
          <StyledContainer
            error={!!error}
            {...(embedded ? { flex: 1, minWidth: 120, embedded: true } : {})}
            {...(grow && !label ? { flex: 1 } : {})}
          >
            <GlyphBox>
              <SearchGlyph />
            </GlyphBox>
            <StyledInput
              ref={ref}
              id={id}
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              disabled={disabled}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              {...rest}
              {...submitEditingProps}
              {...compositionProps}
            />
            {value ? (
              <Row
                middle
                center
                minWidth={44}
                minHeight={44}
                onPress={disabled ? undefined : () => onChangeText("")}
                {...platformAccessibilityProps({
                  accessibilityRole: "button",
                  accessibilityLabel: "Clear search",
                  accessibilityState: { disabled },
                })}
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
              </Row>
            ) : null}
          </StyledContainer>
          {error ? <FieldError error={error} id={errorId} /> : null}
        </>
      )}
    </FieldShell>
  );
});
