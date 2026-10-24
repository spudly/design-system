import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { groupRoleProps } from "./accessibility.js";
import { Button } from "./Button.js";
import { Text } from "./Text.js";

export interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  /**
   * "stacked" (default): the label sits on its own line above the
   * stepper. "inline": label and stepper share one row (label left,
   * stepper right) — for compact control rows where the stacked form
   * wastes a line and pushes surrounding content down (#73).
   */
  layout?: "stacked" | "inline";
}

/**
 * Increment/decrement stepper: [−] value [+]. The value display announces
 * changes via `aria-live="polite"`. The −/+ buttons disable at the min/max
 * bounds and are always ≥44px targets. An optional `label` names the group
 * for assistive technology (the grouping role itself is web-only —
 * `group` is not a valid React Native `accessibilityRole`; see
 * `accessibility.ts`, spudly/eciperay#156).
 *
 * The value box is a fixed width (spacing[10]) so a digit-count change
 * (9 → 10) never shifts the + button — no layout jumps (#73).
 */
export function NumberStepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  layout = "stacked",
}: NumberStepperProps) {
  const canDecrement = min === undefined || value - step >= min;
  const canIncrement = max === undefined || value + step <= max;

  const controls = (
    <XStack
      alignItems="center"
      gap={tokens.spacing[2]}
      {...(label ? groupRoleProps : {})}
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
      <Text variant="body" textAlign="center" minWidth={tokens.spacing[10]} aria-live="polite">
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
  );

  if (layout === "inline") {
    return (
      <XStack alignItems="center" justifyContent="space-between" gap={tokens.spacing[3]}>
        {label ? (
          <Text
            fontSize={tokens.typography.fontSize.sm}
            fontWeight={tokens.typography.fontWeight.medium}
            color={tokens.colors.gray.gray8}
          >
            {label}
          </Text>
        ) : null}
        {controls}
      </XStack>
    );
  }

  return (
    <YStack gap={tokens.spacing[1]}>
      {label ? <Text variant="hint">{label}</Text> : null}
      {controls}
    </YStack>
  );
}
