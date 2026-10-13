import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "./Button.js";
import { Text } from "./Text.js";

export interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

/**
 * Increment/decrement stepper: [−] value [+]. The value display announces
 * changes via `aria-live="polite"`. The −/+ buttons disable at the min/max
 * bounds and are always ≥44px targets. An optional `label` names the group
 * for assistive technology.
 */
export function NumberStepper({ value, onChange, min, max, step = 1, label }: NumberStepperProps) {
  const canDecrement = min === undefined || value - step >= min;
  const canIncrement = max === undefined || value + step <= max;

  return (
    <YStack gap={tokens.spacing[1]}>
      {label ? <Text variant="hint">{label}</Text> : null}
      <XStack
        alignItems="center"
        gap={tokens.spacing[2]}
        accessibilityRole={label ? "group" : undefined}
        accessibilityLabel={label}
      >
        <Button
          variant="secondary"
          size="md"
          disabled={!canDecrement}
          onPress={() => onChange(value - step)}
          accessibilityLabel={label ? `Decrease ${label}` : "Decrease value"}
        >
          −
        </Button>
        <Text variant="body" textAlign="center" minWidth={tokens.spacing[8]} aria-live="polite">
          {value}
        </Text>
        <Button
          variant="secondary"
          size="md"
          disabled={!canIncrement}
          onPress={() => onChange(value + step)}
          accessibilityLabel={label ? `Increase ${label}` : "Increase value"}
        >
          +
        </Button>
      </XStack>
    </YStack>
  );
}
