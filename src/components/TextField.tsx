import { useId } from "react";
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
  // `secureTextEntry` passes through unchanged and the web-only
  // `type` is dropped.
  const secureProps = Object.fromEntries(
    Object.entries(
      isWeb ? { type: type ?? (secureTextEntry ? "password" : undefined) } : { secureTextEntry },
    ).filter(([, value]) => value !== undefined),
  ) as Pick<StyledInputProps, "type" | "secureTextEntry">;

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
      />
      {error ? (
        <Text variant="error" id={errorId}>
          {error}
        </Text>
      ) : null}
    </YStack>
  );
}
