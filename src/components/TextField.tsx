import { useId, useRef } from "react";
import { Input as TamaguiInput, Label, YStack, isWeb, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Text } from "./Text.js";

const StyledInput = styled(TamaguiInput, {
  name: "TextField",

  backgroundColor: "$surface",
  borderWidth: 1,
  // Input boundaries are functional, not decorative: WCAG 1.4.11 asks
  // ≥3:1 against adjacent colors. $borderColor falls to 1.2:1 in light
  // mode and 1.9–2.3:1 in dark, so field borders use $textMuted, which
  // holds ≥4.5:1 against both the page background and the $surface fill
  // in every brand and mode.
  borderColor: "$textMuted",
  borderRadius: tokens.radii.md,
  paddingHorizontal: tokens.spacing[3],
  minHeight: 44,
  fontSize: tokens.typography.fontSize.md,
  color: "$color",

  variants: {
    error: {
      true: {
        borderColor: "$danger",
      },
    },
    // A field whose value differs from the version it was derived
    // from (the recipe form's parent-version diff): the warning wash
    // REPLACES the $surface fill outright — warning step 5 border,
    // step 1 fill — so the two fills never combine. Semantic prop, so
    // pages pass `changed` instead of styling the field themselves
    // (#119).
    changed: {
      true: {
        borderColor: tokens.colors.warning.warning5,
        backgroundColor: tokens.colors.warning.warning1,
      },
    },
  } as const,
});

type StyledInputProps = GetProps<typeof StyledInput>;

export type TextFieldProps = StyledInputProps & {
  label?: string;
  error?: string;
  id?: string;
};

/**
 * Labeled text input with error-state support. Associates the label via
 * `htmlFor`, wires error text through `aria-describedby`/`aria-invalid`,
 * and enforces a 44px minimum touch target. Pass `secureTextEntry` for
 * password fields.
 */
export function TextField({
  label,
  error,
  id: idProp,
  secureTextEntry,
  type,
  onSubmitEditing,
  onCompositionStart,
  onCompositionEnd,
  accessible,
  accessibilityElementsHidden,
  accessibilityHint,
  accessibilityLabel,
  accessibilityLabelledBy,
  accessibilityLiveRegion,
  accessibilityRole,
  accessibilityState,
  accessibilityValue,
  ...rest
}: TextFieldProps) {
  const a11yProps = platformAccessibilityProps({
    accessible,
    accessibilityElementsHidden,
    accessibilityHint,
    accessibilityLabel,
    accessibilityLabelledBy,
    accessibilityLiveRegion,
    accessibilityRole,
    accessibilityState,
    accessibilityValue,
  });
  const autoId = useId();
  const id = idProp ?? autoId;
  const errorId = `${id}-error`;
  // `secureTextEntry` is a React Native prop; Tamagui's web Input
  // destructures it out and discards it, so a password field rendered
  // as a plain text input and showed the password as typed (#262,
  // found on Eciperay web as spudly/eciperay#292). Translate it per
  // platform, the same way the accessibility props above are
  // translated: on web it becomes `type="password"` (a caller-supplied
  // `type` wins) and the RN prop is not forwarded; on native
  // `secureTextEntry` passes through unchanged and a caller-supplied
  // `type` is forwarded alongside it — Tamagui's native Input
  // translates `type="password"` to `secureTextEntry` when the RN
  // prop itself is unset, so dropping `type` there would silently
  // unmask a field the caller marked as a password field.
  const secureProps = Object.fromEntries(
    Object.entries(
      isWeb
        ? { type: type ?? (secureTextEntry ? "password" : undefined) }
        : { secureTextEntry, type },
    ).filter(([, value]) => value !== undefined),
  ) as Pick<StyledInputProps, "type" | "secureTextEntry">;

  // IME composition guard (web): Tamagui's Input fires
  // `onSubmitEditing` from its Enter keydown handler without
  // checking composition, so a CJK user confirming a candidate
  // with Enter would submit mid-typing. Track composition on
  // the field itself and hold submit-editing while it is
  // active; composition events do not exist on native, where
  // the return key never fires during composition.
  //
  // The flag alone is not enough: Safari fires
  // `compositionend` BEFORE the confirming Enter keydown, so
  // the flag is already cleared when Tamagui's handler runs —
  // and the event Tamagui passes to `onSubmitEditing` carries
  // only the field text (no isComposing/keyCode to check
  // here). The guard therefore also holds submit-editing for
  // a short grace window after composition ends: the
  // confirming keydown follows `compositionend` within the
  // same task sequence, while a deliberate Enter press lands
  // well after the window.
  const composingRef = useRef(false);
  // Monotonic clock (performance.now): a wall-clock step must
  // not stretch or shrink the grace window. -Infinity means
  // "no composition has ended yet" (performance.now() starts
  // near 0, so 0 would falsely hold submits in the first
  // 100 ms after mount).
  const compositionEndedAtRef = useRef(Number.NEGATIVE_INFINITY);
  const handleCompositionStart: typeof onCompositionStart = (event) => {
    composingRef.current = true;
    onCompositionStart?.(event);
  };
  const handleCompositionEnd: typeof onCompositionEnd = (event) => {
    composingRef.current = false;
    compositionEndedAtRef.current = performance.now();
    onCompositionEnd?.(event);
  };
  const handleSubmitEditing: typeof onSubmitEditing = (event) => {
    if (
      isWeb &&
      (composingRef.current || performance.now() - compositionEndedAtRef.current < 100)
    ) {
      return;
    }
    onSubmitEditing?.(event);
  };

  return (
    <YStack gap={tokens.spacing[1]}>
      {label ? (
        <Label htmlFor={id} fontSize={tokens.typography.fontSize.sm}>
          {label}
        </Label>
      ) : null}
      <StyledInput
        id={id}
        error={!!error}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...a11yProps}
        {...rest}
        {...secureProps}
        {...(onSubmitEditing ? { onSubmitEditing: handleSubmitEditing } : {})}
        {...(isWeb
          ? {
              onCompositionStart: handleCompositionStart,
              onCompositionEnd: handleCompositionEnd,
            }
          : {
              ...(onCompositionStart ? { onCompositionStart } : {}),
              ...(onCompositionEnd ? { onCompositionEnd } : {}),
            })}
      />
      {error ? (
        <Text variant="error" id={errorId}>
          {error}
        </Text>
      ) : null}
    </YStack>
  );
}
