import { useId } from "react";
import { TextArea as TamaguiTextArea, Label, YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

const StyledTextArea = styled(TamaguiTextArea, {
  name: "SpudlyMultilineField",

  backgroundColor: "#ffffff",
  borderWidth: 1,
  borderColor: tokens.colors.gray.gray4,
  borderRadius: tokens.radii.md,
  paddingHorizontal: tokens.spacing[3],
  paddingVertical: tokens.spacing[3],
  minHeight: 44,
  fontSize: tokens.typography.fontSize.md,
  color: tokens.colors.gray.gray10,

  variants: {
    error: {
      true: {
        borderColor: tokens.colors.danger.danger6,
      },
    },
  } as const,
});

type StyledTextAreaProps = GetProps<typeof StyledTextArea>;

export interface MultilineFieldProps extends StyledTextAreaProps {
  label?: string;
  error?: string;
  id?: string;
  numberOfLines?: number;
}

/**
 * Labeled multi-line text input (Tamagui TextArea) with error-state support.
 * Same label/error/a11y wiring as TextField: the label is associated via
 * `htmlFor`, error text is wired through `aria-describedby`/`aria-invalid`.
 * `numberOfLines` defaults to 4.
 */
export function MultilineField({
  label,
  error,
  id: idProp,
  numberOfLines = 4,
  ...rest
}: MultilineFieldProps) {
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
