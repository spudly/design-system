import { useId } from "react";
import { Label, Switch as TamaguiSwitch, XStack, YStack, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

const StyledSwitch = styled(TamaguiSwitch, {
  name: "SpudlySwitch",

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
