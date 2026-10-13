import { useId } from "react";
import { Input as TamaguiInput, Label, YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

const StyledInput = styled(TamaguiInput, {
  name: "SpudlyTextField",

  backgroundColor: "#ffffff",
  borderWidth: 1,
  borderColor: tokens.colors.gray.gray4,
  borderRadius: tokens.radii.md,
  paddingHorizontal: tokens.spacing[3],
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

type StyledInputProps = GetProps<typeof StyledInput>;

export interface TextFieldProps extends StyledInputProps {
  label?: string;
  error?: string;
  id?: string;
}

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
