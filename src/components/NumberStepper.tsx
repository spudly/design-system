import { useState } from "react";
import { Input as TamaguiInput, XStack, YStack, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import { groupRoleProps, platformAccessibilityProps } from "./accessibility.js";
import { Button } from "./Button.js";
import { Text } from "./Text.js";

const StyledValueInput = styled(TamaguiInput, {
  name: "NumberStepperValue",

  backgroundColor: "$surface",
  borderWidth: 1,
  // Input boundaries need ≥3:1 against adjacent colors (WCAG 1.4.11) —
  // $textMuted, as in TextField.
  borderColor: "$textMuted",
  borderRadius: tokens.radii.md,
  minHeight: 44,
  paddingHorizontal: tokens.spacing[2],
  fontSize: tokens.typography.fontSize.md,
  color: "$color",
  textAlign: "center",
});

export type NumberStepperProps = {
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
  /**
   * The value display becomes a directly editable numeric field
   * (default false: the value is read-only text, stepped only via
   * the −/+ buttons). Editable renders a text input with the
   * numeric keypad (`keyboardType` / `inputMode`) so a user can
   * type an arbitrary value instead of stepping to it one tap at
   * a time (#73). It deliberately does NOT use a number-type
   * input on web: browsers render their own native spin buttons
   * inside one, duplicating this stepper's own −/+ buttons
   * (#181) — and the commit path below already parses, snaps, and
   * clamps the typed text, so the native number semantics are not
   * load-bearing. Typing does
   * not commit per keystroke: the entry commits on blur or submit,
   * snapped to the nearest `step` and clamped to `min`/`max`; an
   * empty or non-numeric entry commits nothing and the field
   * restores the current value.
   */
  editable?: boolean;
};

/**
 * Increment/decrement stepper: [−] value [+]. The value display announces
 * changes via `aria-live="polite"`. The −/+ buttons disable at the min/max
 * bounds and are always ≥44px targets. An optional `label` names the group
 * for assistive technology (the grouping role itself is web-only —
 * `group` is not a valid React Native `accessibilityRole`; see
 * `accessibility.ts`, spudly/eciperay#156).
 *
 * The value box is a fixed width (spacing[10]) so a digit-count change
 * (9 → 10) never shifts the + button — no layout jumps (#73). With
 * `editable`, the value box is a fixed-width (spacing[16]) number
 * input instead, wide enough for the large values direct entry
 * exists for; the buttons keep their positions either way.
 */
export function NumberStepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  layout = "stacked",
  editable = false,
}: NumberStepperProps) {
  // The editable field's uncommitted text; null while not editing, so
  // the field shows the (externally owned) value.
  const [draft, setDraft] = useState<string | null>(null);
  const canDecrement = min === undefined || value - step >= min;
  const canIncrement = max === undefined || value + step <= max;

  const commitDraft = () => {
    if (draft === null) {
      return;
    }
    // Number("") is 0, not NaN: without this guard a cleared field
    // would commit 0 (snapped/clamped) instead of committing
    // nothing, as documented on the `editable` prop.
    if (draft.trim() === "") {
      setDraft(null);
      return;
    }
    const parsed = Number(draft.trim());
    setDraft(null);
    if (!Number.isFinite(parsed)) {
      return;
    }
    // Snap to the step grid, then clamp into the bounds the buttons
    // disable at: a typed 0 with min 1 lands on 1 rather than being
    // rejected, and an over-max entry lands on max.
    let next = Number((Math.round(parsed / step) * step).toFixed(10));
    if (min !== undefined) {
      next = Math.max(min, next);
    }
    if (max !== undefined) {
      next = Math.min(max, next);
    }
    if (next !== value) {
      onChange(next);
    }
  };

  const controls = (
    <XStack
      alignItems="center"
      gap={tokens.spacing[2]}
      {...(label ? groupRoleProps : {})}
      {...platformAccessibilityProps({ accessibilityLabel: label })}
    >
      <Button
        variant="secondary"
        size="md"
        disabled={!canDecrement}
        onPress={() => {
          setDraft(null);
          onChange(value - step);
        }}
        accessibilityLabel={label ? `Decrease ${label}` : "Decrease value"}
      >
        −
      </Button>
      {editable ? (
        <StyledValueInput
          type="text"
          keyboardType="numeric"
          inputMode="numeric"
          aria-live="polite"
          {...platformAccessibilityProps({
            accessibilityLabel: label ? `${label} value` : "Value",
          })}
          minWidth={tokens.spacing[10]}
          width={tokens.spacing[16]}
          value={draft ?? String(value)}
          onChangeText={setDraft}
          onBlur={commitDraft}
          onSubmitEditing={commitDraft}
          selectTextOnFocus
        />
      ) : (
        <Text variant="body" textAlign="center" minWidth={tokens.spacing[10]} aria-live="polite">
          {value}
        </Text>
      )}
      <Button
        variant="secondary"
        size="md"
        disabled={!canIncrement}
        onPress={() => {
          setDraft(null);
          onChange(value + step);
        }}
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
