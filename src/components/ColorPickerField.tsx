import { useId } from "react";
import { XStack, YStack, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

const Swatch = styled(YStack, {
  name: "SpudlyColorSwatch",

  width: 44,
  height: 44,
  borderRadius: tokens.radii.full,
  borderWidth: 2,
  borderColor: tokens.colors.gray.gray3,
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",

  variants: {
    selected: {
      true: {
        borderColor: tokens.colors.gray.gray10,
      },
    },
  } as const,
});

export interface ColorPickerFieldProps {
  label?: string;
  /** Hex color values to choose from. */
  colors: string[];
  value?: string;
  onChange?: (color: string) => void;
  error?: string;
  id?: string;
}

/**
 * Labeled color swatch selector (e.g. for tag colors). Each swatch is a
 * ≥44px round button showing its color, with `aria-pressed` reflecting
 * selection and an accessible label like "Select color #c2410c". The
 * selected swatch gets a visible dark ring. Error wiring matches TextField.
 */
export function ColorPickerField({
  label,
  colors,
  value,
  onChange,
  error,
  id: idProp,
}: ColorPickerFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;

  return (
    <YStack gap={tokens.spacing[2]}>
      {label ? (
        <Text id={labelId} style={{ fontSize: tokens.typography.fontSize.sm }}>
          {label}
        </Text>
      ) : null}
      <XStack
        flexWrap="wrap"
        gap={tokens.spacing[2]}
        accessibilityRole="group"
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : "Choose a color"}
        aria-describedby={error ? errorId : undefined}
      >
        {colors.map((color) => {
          const selected = color.toLowerCase() === value?.toLowerCase();
          return (
            <Swatch
              key={color}
              selected={selected}
              backgroundColor={color}
              accessibilityRole="button"
              aria-pressed={selected}
              accessibilityLabel={`Select color ${color}`}
              onPress={() => onChange?.(color)}
            />
          );
        })}
      </XStack>
      {error ? (
        <Text variant="error" id={errorId}>
          {error}
        </Text>
      ) : null}
    </YStack>
  );
}
