import { useId } from "react";
import { Label, Switch as TamaguiSwitch, XStack, YStack, styled } from "tamagui";
import { tokens } from "../../tokens/index.js";
import { Text } from "../data/Text.js";

const StyledSwitch = styled(TamaguiSwitch, {
  name: "Switch",

  // Explicit dimensions: Tamagui Switch sizes itself from the `$size`
  // token scale (its dynamic size variant looks up a named size), but this
  // design system's size tokens are the numeric spacing scale, so the
  // lookup resolved to nothing and the switch rendered with no width or
  // height at all. 48x32 track; the thumb travel is driven from the
  // switch state by a direct `x` prop on the thumb (see there).
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
});

export type SwitchProps = {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** When true, the switch is inert and dimmed; it cannot be toggled. */
  disabled?: boolean;
};

/**
 * Labeled switch row. The label is associated via `htmlFor` so it toggles
 * the switch; the row carries a 44px minimum height for the touch target.
 */
export function Switch({ label, description, checked, onCheckedChange, disabled = false }: SwitchProps) {
  const id = useId();
  return (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      gap={tokens.spacing[3]}
      minHeight={44}
      paddingVertical={tokens.spacing[2]}
      opacity={disabled ? 0.5 : 1}
    >
      <YStack flex={1} gap={tokens.spacing[1]}>
        <Label htmlFor={id} fontSize={tokens.typography.fontSize.md}>
          {label}
        </Label>
        {description ? <Text variant="hint">{description}</Text> : null}
      </YStack>
      <StyledSwitch
        id={id}
        checked={checked}
        onCheckedChange={(next) => {
          if (disabled) {
            return;
          }
          onCheckedChange(next);
        }}
        disabled={disabled}
        aria-disabled={disabled || undefined}
        on={checked}
      >
        {/* transition="fast" is the shared spring from the Tamagui config —
            the mechanism the CSS animation driver turns into a real
            transition (the `animation` prop compiles to a 0s keyframe
            reference in this repo and never visibly animates; see
            Collapsible). It transitions the thumb's `x` offset on toggle.
            The travel is a DIRECT prop, not a styled variant (#750):
            Tamagui's createSwitch Thumb HOC computes the thumb's `x`
            itself from runtime layout measurement and renders it before
            spreading the thumb's props, so a direct `x` here overrides
            the HOC's value deterministically, while a variant `x` —
            part of the styled component's own styles — always loses to
            the HOC's direct prop, which is why the thumb stayed left
            when on. Travel is deterministic from this file's geometry:
            48px track − 24px thumb − 2×2px frame padding = 20px.
            `alignSelf` is likewise pinned to flex-start: the HOC sets
            the thumb's alignment from the INITIAL checked state
            (flex-end when mounted checked, paired with its own
            compensating x), so the offset's origin must be fixed here
            for the direct `x` to mean the same thing however the
            switch was mounted. */}
        <StyledThumb alignSelf="flex-start" x={checked ? 20 : 0} transition="fast" />
      </StyledSwitch>
    </XStack>
  );
}
