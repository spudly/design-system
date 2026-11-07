import { useId } from "react";
import { Label, Switch as TamaguiSwitch, XStack, YStack, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

const StyledSwitch = styled(TamaguiSwitch, {
  name: "Switch",

  // Explicit dimensions: Tamagui Switch sizes itself from the `$size`
  // token scale (its dynamic size variant looks up a named size), but this
  // design system's size tokens are the numeric spacing scale, so the
  // lookup resolved to nothing and the switch rendered with no width or
  // height at all. 48x32 track; the thumb travel is driven from the
  // switch state by StyledThumb's `on` variant (see there).
  width: tokens.spacing[12],
  height: tokens.spacing[8],
  borderRadius: tokens.radii.full,
  borderWidth: 0,

  variants: {
    on: {
      true: {
        backgroundColor: "$primary",
      },
      false: {
        backgroundColor: tokens.colors.gray.gray4,
      },
    },
  } as const,
});

const StyledThumb = styled(TamaguiSwitch.Thumb, {
  name: "SwitchThumb",

  width: tokens.spacing[6],
  height: tokens.spacing[6],
  borderRadius: tokens.radii.full,
  backgroundColor: tokens.colors.gray.gray1,
  // Vertical centering: Tamagui's frame carries 2px padding and stacks
  // the thumb at the top of its inner wrapper, so the 24px thumb rides
  // 2px high in the 32px track (its center lands at 14px, not 16px). A
  // 2px top margin restores the ideal 4px offset, (32 − 24) / 2. (No 2px
  // spacing token exists — the scale is 4px-based — so the literal is
  // intentional.)
  marginTop: 2,

  variants: {
    on: {
      true: {
        // Horizontal travel is driven from the switch state here, not
        // measured by Tamagui at runtime: the frame's dynamic size
        // machinery resolves to nothing against this repo's numeric
        // spacing-token scale (see StyledSwitch), so the runtime travel
        // was never reliably applied and the knob stayed left when on.
        // Travel is deterministic from this file's geometry: 48px track
        // − 24px thumb − 2×2px frame padding = 20px.
        x: 20,
      },
      false: {
        x: 0,
      },
    },
  } as const,
});

export type SwitchProps = {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

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
        {/* transition="fast" is the shared spring from the Tamagui config —
            the mechanism the CSS animation driver turns into a real
            transition (the `animation` prop compiles to a 0s keyframe
            reference in this repo and never visibly animates; see
            Collapsible). It transitions the thumb's `x` offset on toggle. */}
        <StyledThumb on={checked} transition="fast" />
      </StyledSwitch>
    </XStack>
  );
}
