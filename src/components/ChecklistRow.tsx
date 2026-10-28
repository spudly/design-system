import { Checkbox as TamaguiCheckbox, XStack, YStack, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

const StyledCheckbox = styled(TamaguiCheckbox, {
  name: "ChecklistCheckbox",

  width: tokens.spacing[6],
  height: tokens.spacing[6],
  borderRadius: tokens.radii.sm,
  borderWidth: 2,
  // Unchecked border is $textMuted, not $borderColor: the box boundary
  // needs ≥3:1 against adjacent colors (WCAG 1.4.11) in both modes —
  // see TextField. The checked border below stays $primary.
  borderColor: "$textMuted",
  backgroundColor: "$surface",
  alignItems: "center",
  justifyContent: "center",
});

export interface ChecklistRowProps {
  label: string;
  metadata?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

/**
 * Checkbox row: a real Tamagui Checkbox (focusable, with `role="checkbox"`
 * semantics) next to a label. The label area is also pressable so the whole
 * row is an easy target, and the row keeps a 44px minimum height. The label
 * gets a strikethrough and muted color when checked.
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
        accessibilityLabel={label}
        backgroundColor={checked ? "$primary" : "$surface"}
        borderColor={checked ? "$primary" : "$textMuted"}
      >
        <TamaguiCheckbox.Indicator>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: "$onPrimary" }}>✓</Text>
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
