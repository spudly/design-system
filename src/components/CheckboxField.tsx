import { useId } from "react";
import { Checkbox as TamaguiCheckbox, Label, XStack, YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

const StyledCheckbox = styled(TamaguiCheckbox, {
  name: "SpudlyCheckbox",

  // 44px touch target; the 24px visual box is centered inside.
  width: 44,
  height: 44,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "transparent",
  borderWidth: 0,
});

const StyledBox = styled(XStack, {
  name: "SpudlyCheckboxBox",

  width: 24,
  height: 24,
  borderWidth: 2,
  borderRadius: tokens.radii.sm,
  alignItems: "center",
  justifyContent: "center",
});

type StyledCheckboxProps = GetProps<typeof StyledCheckbox>;

export interface CheckboxFieldProps extends Omit<
  StyledCheckboxProps,
  "checked" | "onCheckedChange"
> {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: string;
  id?: string;
}

/**
 * Labeled checkbox with optional description and error text.
 *
 * The checkbox itself is the single interactive element (44px touch target
 * with a 24px visual box centered inside), so there is exactly one toggle
 * per press on web and native. The label toggles the checkbox via `onPress`
 * (Tamagui's `htmlFor` only focuses on native, it does not toggle), and is
 * programmatically associated with `aria-labelledby`.
 */
export function CheckboxField({
  label,
  description,
  checked,
  onCheckedChange,
  error,
  id: idProp,
  ...rest
}: CheckboxFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;
  const toggle = () => onCheckedChange(!checked);

  return (
    <YStack gap={tokens.spacing[1]}>
      <XStack alignItems="center" gap={tokens.spacing[3]} minHeight={44}>
        <StyledCheckbox
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          aria-labelledby={labelId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...rest}
        >
          {/* Unchecked border is $textMuted, not $borderColor: the box
              boundary needs ≥3:1 against adjacent colors (WCAG 1.4.11)
              in both modes — see TextField. Checked stays $primary. */}
          <StyledBox
            borderColor={checked ? "$primary" : "$textMuted"}
            backgroundColor={checked ? "$primary" : "$surface"}
          >
            <TamaguiCheckbox.Indicator>
              <Text
                aria-hidden
                style={{
                  color: "$onPrimary",
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.bold,
                  lineHeight: tokens.typography.fontSize.sm,
                }}
              >
                ✓
              </Text>
            </TamaguiCheckbox.Indicator>
          </StyledBox>
        </StyledCheckbox>
        <YStack flex={1} gap={tokens.spacing[1]}>
          <Label id={labelId} onPress={toggle} fontSize={tokens.typography.fontSize.md}>
            {label}
          </Label>
          {description ? <Text variant="hint">{description}</Text> : null}
        </YStack>
      </XStack>
      {error ? (
        <Text variant="error" id={errorId}>
          {error}
        </Text>
      ) : null}
    </YStack>
  );
}
