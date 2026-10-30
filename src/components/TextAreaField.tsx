import { useId } from "react";
import { TextArea as TamaguiTextArea, Label, YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Text } from "./Text.js";

const StyledTextArea = styled(TamaguiTextArea, {
  name: "TextAreaField",

  backgroundColor: "$surface",
  borderWidth: 1,
  // $textMuted, not $borderColor: input boundaries need ≥3:1 against
  // adjacent colors (WCAG 1.4.11) in both modes — see TextField.
  borderColor: "$textMuted",
  borderRadius: tokens.radii.md,
  paddingHorizontal: tokens.spacing[3],
  paddingVertical: tokens.spacing[3],
  minHeight: 44,
  fontSize: tokens.typography.fontSize.md,
  color: "$color",

  variants: {
    error: {
      true: {
        borderColor: "$danger",
      },
    },
    // The field's height step, a semantic size rather than a raw
    // minHeight: `md` is the standard field (the base minHeight),
    // `lg` a short multi-paragraph entry (a follow-up message, a
    // comment), and `xl` a long-form composer (a prompt, pasted
    // source text). Pages pick the step; the heights live here
    // (#119 — pages must not set minHeight themselves).
    size: {
      md: {},
      lg: { minHeight: 96 },
      xl: { minHeight: 192 },
    },
    // The version-diff warning wash, same contract as TextField's
    // `changed` variant: warning step 5 border / step 1 fill
    // replacing the $surface fill outright.
    changed: {
      true: {
        borderColor: tokens.colors.warning.warning5,
        backgroundColor: tokens.colors.warning.warning1,
      },
    },
  } as const,
});

type StyledTextAreaProps = GetProps<typeof StyledTextArea>;

export type TextAreaFieldProps = StyledTextAreaProps & {
  label?: string;
  error?: string;
  id?: string;
  numberOfLines?: number;
  /** Height step: `md` (default), `lg`, or `xl` — see the styled
   * variant. A semantic size, never a raw height. */
  size?: "md" | "lg" | "xl";
};

/**
 * Labeled multi-line text input (Tamagui TextArea) with error-state support.
 * Same label/error/a11y wiring as TextField: the label is associated via
 * `htmlFor`, error text is wired through `aria-describedby`/`aria-invalid`.
 * `numberOfLines` defaults to 4. The `size` prop picks the height step
 * (`md` standard, `lg` short multi-paragraph, `xl` long-form composer).
 */
export function TextAreaField({
  label,
  error,
  id: idProp,
  numberOfLines = 4,
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
}: TextAreaFieldProps) {
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

  return (
    <YStack gap={tokens.spacing[1]}>
      {label ? (
        <Label htmlFor={id} fontSize={tokens.typography.fontSize.sm}>
          {label}
        </Label>
      ) : null}
      <StyledTextArea
        id={id}
        numberOfLines={numberOfLines}
        error={!!error}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...a11yProps}
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
