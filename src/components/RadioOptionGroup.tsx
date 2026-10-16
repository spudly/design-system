import { useId } from "react";
import { RadioGroup as TamaguiRadioGroup, Label, XStack, YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

const StyledItem = styled(TamaguiRadioGroup.Item, {
  name: "SpudlyRadioItem",

  // 44px touch target; the 24px visual circle is centered inside.
  width: 44,
  height: 44,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "transparent",
  borderWidth: 0,
});

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

type RadioGroupProps = GetProps<typeof TamaguiRadioGroup>;

export interface RadioOptionGroupProps extends Omit<
  RadioGroupProps,
  "value" | "onValueChange" | "children"
> {
  label?: string;
  options: RadioOption[];
  value: string;
  onValueChange: (value: string) => void;
  error?: string;
  id?: string;
}

/**
 * Labeled radio group (Tamagui RadioGroup). Radiogroup semantics, arrow-key
 * navigation, and `aria-checked` come from the primitive. Each option is a
 * 44px touch target with a 24px visual circle, and the label selects the
 * option via `onPress` (Tamagui's `htmlFor` only focuses on native, it does
 * not select) with `aria-labelledby` for programmatic association. Option
 * selection is idempotent, so label presses never double-fire.
 */
export function RadioOptionGroup({
  label,
  options,
  value,
  onValueChange,
  error,
  id: idProp,
  ...rest
}: RadioOptionGroupProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const groupLabelId = `${id}-label`;
  const errorId = `${id}-error`;

  return (
    <YStack gap={tokens.spacing[1]}>
      {label ? (
        <Text id={groupLabelId} variant="body">
          {label}
        </Text>
      ) : null}
      <TamaguiRadioGroup
        value={value}
        onValueChange={onValueChange}
        aria-labelledby={label ? groupLabelId : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      >
        <YStack gap={tokens.spacing[1]}>
          {options.map((opt) => {
            const selected = opt.value === value;
            const optionLabelId = `${id}-option-${opt.value}`;
            return (
              <XStack key={opt.value} alignItems="center" gap={tokens.spacing[2]}>
                <StyledItem value={opt.value} aria-labelledby={optionLabelId}>
                  <XStack
                    width={24}
                    height={24}
                    borderRadius={tokens.radii.full}
                    borderWidth={2}
                    // Selected chrome uses $link, the dark-aware interactive
                    // role: $primary falls below the 3:1 state-indicator
                    // minimum in dark mode (border 2.85:1 against the base
                    // dark background), while $link holds ≥5:1 against both
                    // the circle's $surface and the page background in every
                    // brand and mode.
                    borderColor={selected ? "$link" : "$borderColor"}
                    backgroundColor="$surface"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {/* The Indicator itself is the dot: Tamagui sizes the
                        Indicator frame to 50% of the circle (10x10), so a
                        fixed 12x12 child overflowed it from the top-left
                        and rendered off-center. Its color is $link for the
                        same reason as the border above: as $primary it sat
                        at 2.41–2.92:1 against the dark $surface circle. */}
                    <TamaguiRadioGroup.Indicator
                      width={12}
                      height={12}
                      borderRadius={tokens.radii.full}
                      backgroundColor="$link"
                    />
                  </XStack>
                </StyledItem>
                <YStack flex={1} gap={tokens.spacing[1]}>
                  <Label
                    id={optionLabelId}
                    onPress={() => onValueChange(opt.value)}
                    fontSize={tokens.typography.fontSize.md}
                  >
                    {opt.label}
                  </Label>
                  {opt.description ? <Text variant="hint">{opt.description}</Text> : null}
                </YStack>
              </XStack>
            );
          })}
        </YStack>
      </TamaguiRadioGroup>
      {error ? (
        <Text variant="error" id={errorId}>
          {error}
        </Text>
      ) : null}
    </YStack>
  );
}
