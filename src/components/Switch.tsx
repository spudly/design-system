import { useId } from "react";
import { Label, Switch as TamaguiSwitch, XStack, YStack, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

const StyledSwitch = styled(TamaguiSwitch, {
  name: "SpudlySwitch",

  // Explicit dimensions: Tamagui Switch sizes itself from the `$size`
  // token scale (its dynamic size variant looks up a named size), but this
  // design system's size tokens are the numeric spacing scale, so the
  // lookup resolved to nothing and the switch rendered with no width or
  // height at all. 48x32 track; the thumb travel distance is measured by
  // Tamagui at runtime, so it stays correct with explicit sizes.
  width: tokens.spacing[12],
  height: tokens.spacing[8],
  borderRadius: tokens.radii.full,
  borderWidth: 0,

  variants: {
    on: {
      true: {
        backgroundColor: tokens.colors.primary.primary7,
      },
      false: {
        backgroundColor: tokens.colors.gray.gray4,
      },
    },
  } as const,
});

const StyledThumb = styled(TamaguiSwitch.Thumb, {
  name: "SpudlySwitchThumb",

  width: tokens.spacing[6],
  height: tokens.spacing[6],
  borderRadius: tokens.radii.full,
  backgroundColor: tokens.colors.gray.gray1,
});

export interface SwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

/**
 * Labeled switch row. The label is associated via `htmlFor` so it toggles
 * the switch; the row carries a 44px minimum height for the touch target.
 */
export function Switch({ label, description, checked, onCheckedChange }: SwitchProps) {
  const id = useId();
  return (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      gap={tokens.spacing[3]}
      minHeight={44}
      paddingVertical={tokens.spacing[2]}
    >
      <YStack flex={1} gap={tokens.spacing[1]}>
        <Label htmlFor={id} fontSize={tokens.typography.fontSize.md}>
          {label}
        </Label>
        {description ? <Text variant="hint">{description}</Text> : null}
      </YStack>
      <StyledSwitch id={id} checked={checked} onCheckedChange={onCheckedChange} on={checked}>
        <StyledThumb />
      </StyledSwitch>
    </XStack>
  );
}
