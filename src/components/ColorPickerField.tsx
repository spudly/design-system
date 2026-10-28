import { useId } from "react";
import { XStack, YStack, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import type { TagColorName } from "../themes/tagColors.js";
import { groupRoleProps, platformAccessibilityProps } from "./accessibility.js";
import { useTagColorResolver } from "./tagColors.js";
import { Text } from "./Text.js";

const Swatch = styled(YStack, {
  name: "ColorSwatch",

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

export type ColorPickerFieldProps = {
  label?: string;
  /**
   * Tag color token names to choose from (e.g. "blue", "pink"). Each
   * swatch renders the active theme's hex for its name (#207).
   */
  colors: TagColorName[];
  /**
   * The selected value: a tag color token name (strictly typed — a
   * raw hex is a compile error; stored data converts through
   * `tagColorNameForHex` first).
   */
  value?: TagColorName;
  onChange?: (color: TagColorName) => void;
  error?: string;
  id?: string;
};

/**
 * Labeled tag-color selector. Each swatch is a ≥44px round button
 * showing the active theme's hex for its token name, with
 * `aria-pressed` reflecting selection and an accessible label like
 * "Select color blue". The selected swatch gets a visible dark ring.
 * Error wiring matches TextField. The swatch container's grouping
 * role is web-only — `group` is not a valid React Native
 * `accessibilityRole` (see `accessibility.ts`,
 * spudly/eciperay#156); on native the accessible name carries the
 * grouping.
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
  const resolveTagColor = useTagColorResolver();
  const resolvedValue = value ? resolveTagColor(value) : undefined;

  return (
    <YStack gap={tokens.spacing[2]} flexShrink={1} flexGrow={1} minWidth={0}>
      {label ? (
        <Text id={labelId} style={{ fontSize: tokens.typography.fontSize.sm }}>
          {label}
        </Text>
      ) : null}
      <XStack
        flexWrap="wrap"
        gap={tokens.spacing[2]}
        {...groupRoleProps}
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : "Choose a color"}
        aria-describedby={error ? errorId : undefined}
      >
        {colors.map((color) => {
          const resolvedColor = resolveTagColor(color);
          const selected = resolvedColor === resolvedValue;
          return (
            <Swatch
              key={color}
              selected={selected}
              backgroundColor={resolvedColor}
              {...platformAccessibilityProps({
                accessibilityRole: "button",
                accessibilityLabel: `Select color ${color}`,
              })}
              aria-pressed={selected}
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
