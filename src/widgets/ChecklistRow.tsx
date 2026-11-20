import { Checkbox as TamaguiCheckbox, XStack, YStack, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Text } from "./Text.js";

const StyledCheckbox = styled(TamaguiCheckbox, {
  name: "ChecklistCheckbox",

  width: tokens.spacing[6],
  height: tokens.spacing[6],
  borderRadius: tokens.radii.sm,
  borderWidth: 2,
  // Visual direction (#713): the box is unfilled in both states with
  // a $primary outline in both states — no fill, no outline change;
  // the checked/unchecked distinction is carried by the $primary
  // check glyph, matching CheckboxField's shared box treatment.
  borderColor: "$primary",
  backgroundColor: "$surface",
  alignItems: "center",
  justifyContent: "center",
});

export type ChecklistRowProps = {
  label: string;
  metadata?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

/**
 * Checkbox row: a real Tamagui Checkbox (focusable, with `role="checkbox"`
 * semantics) next to a label. The label area is also pressable so the whole
 * row is an easy target, and the row keeps a 44px minimum height. The label
 * gets a strikethrough and muted color when checked. The box carries the
 * shared visual-direction treatment (#713): unfilled in both states,
 * $primary outline in both states, $primary check glyph when checked.
 */
export function ChecklistRow({ label, metadata, checked, onCheckedChange }: ChecklistRowProps) {
  const toggle = () => onCheckedChange(!checked);

  return (
    <XStack
      alignItems="center"
      gap={tokens.spacing[3]}
      minHeight={44}
      paddingVertical={tokens.spacing[1]}
    >
      <StyledCheckbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        {...platformAccessibilityProps({ accessibilityLabel: label })}
      >
        <TamaguiCheckbox.Indicator>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: "$primary" }}>✓</Text>
        </TamaguiCheckbox.Indicator>
      </StyledCheckbox>
      <YStack flex={1} onPress={toggle} cursor="pointer">
        <Text
          style={
            checked
              ? {
                  textDecorationLine: "line-through",
                  color: "$textMuted",
                }
              : undefined
          }
        >
          {label}
        </Text>
        {metadata ? <Text variant="hint">{metadata}</Text> : null}
      </YStack>
    </XStack>
  );
}
