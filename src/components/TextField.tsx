import { useId } from "react";
import { Input as TamaguiInput, Label, YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";
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
export function TextField({ label, error, id: idProp, ...rest }: TextFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const errorId = `${id}-error`;

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
        {...rest}
      />
      {error ? (
        <Text variant="error" id={errorId}>
          {error}
        </Text>
      ) : null}
    </YStack>
  );
}
