import { useState } from "react";
import { XStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { groupRoleProps, platformAccessibilityProps } from "./accessibility.js";
import { Button } from "./Button.js";
import { Text } from "./Text.js";
import { TextField } from "./TextField.js";

export type PresetValueOption = {
  value: string;
  label: string;
};

export type PresetValueSelectorProps = {
  /** The selector's label (e.g. "Scale"). */
  label: string;
  /** The preset options. */
  options: PresetValueOption[];
  /**
   * The selected value: one of the preset option values, or
   * any other string once a custom value has been committed.
   */
  value: string;
  /**
   * Selection changes: a preset's value when a preset button is
   * pressed, or the committed custom entry (a positive number
   * as a plain string) when the custom editor commits.
   */
  onChange: (value: string) => void;
  /** The custom slot's resting label (e.g. "Custom"). */
  customLabel: string;
  /**
   * The custom slot's accessible name, doubling as the custom
   * editor's label (e.g. "Custom scale"). When a custom value
   * is selected, the formatted value joins the name, so the
   * selected amount is announced, not just the word Custom.
   */
  customAccessibilityLabel: string;
  /**
   * Formats a committed custom value for the selected button's
   * visible label and accessible name (e.g. appending a unit
   * suffix). Defaults to the value itself.
   */
  formatCustomValue?: (value: string) => string;
};

/**
 * A preset-or-custom value selector (#119 dedupe): a labeled,
 * non-wrapping row of preset toggle Buttons plus one trailing
 * button that turns into a number input when pressed — any
 * value beyond the presets is directly enterable, and once
 * committed the button shows the applied custom value
 * selected. The generic shape for a preset-or-custom quantity
 * (a scale, a duration, an amount).
 *
 * This is the Button-based successor to the recipedetail
 * tranche's EditableChipGroup, rebuilt when the chip
 * components were retired (Stephen's ruling on the #119
 * dedupe: chips are removed entirely; buttons everywhere). The
 * presets and the custom slot are Button's toggle form
 * (`selected`, announced via aria-pressed / the accessibility
 * state) at the small size in the secondary resting treatment,
 * which also retires the hand-rolled chip frame, its separate
 * keyboard shim, and its duplicated toggle a11y — a real
 * button is keyboard-operable by construction.
 *
 * The editing state is ephemeral view state the selector
 * owns: whether the custom slot is currently a number input,
 * and the input's uncommitted text. Committing an entry
 * applies it through the same `onChange` the presets use; an
 * empty, non-numeric, or non-positive entry commits nothing
 * and the slot restores the current value.
 */
export function PresetValueSelector({
  label,
  options,
  value,
  onChange,
  customLabel,
  customAccessibilityLabel,
  formatCustomValue,
}: PresetValueSelectorProps) {
  const [isCustomEditing, setCustomEditing] = useState(false);
  const [customDraft, setCustomDraft] = useState("");
  const isPreset = options.some((option) => option.value === value);
  const isCustomSelected = !isPreset && !isCustomEditing;
  const formattedCustom = formatCustomValue ? formatCustomValue(value) : value;

  const startCustomEdit = () => {
    setCustomDraft(isPreset ? "" : value);
    setCustomEditing(true);
  };

  const commitCustom = () => {
    const parsed = Number(customDraft.trim());
    setCustomEditing(false);
    if (Number.isFinite(parsed) && parsed > 0) {
      onChange(String(parsed));
    }
  };

  return (
    <XStack
      alignItems="center"
      gap="$2"
      {...groupRoleProps}
      {...platformAccessibilityProps({ accessibilityLabel: label })}
    >
      <XStack paddingInlineEnd="$1">
        <Text
          fontSize={tokens.typography.fontSize.sm}
          fontWeight={tokens.typography.fontWeight.medium}
          color={tokens.colors.gray.gray8}
        >
          {label}
        </Text>
      </XStack>
      <XStack flex={1} gap="$2">
        {options.map((option) => (
          <Button
            key={option.value}
            variant="secondary"
            size="sm"
            grow
            // Equal shares of a non-wrapping row need a zero
            // basis: Button's `grow` default is a content-sized
            // basis (the wrapping-row treatment), so this caller
            // passes the zero basis and shrink back — a
            // caller-passed flex wins over `grow` by Button's
            // contract.
            flexBasis={0}
            flexShrink={1}
            selected={value === option.value}
            onPress={() => {
              setCustomEditing(false);
              onChange(option.value);
            }}
          >
            {option.label}
          </Button>
        ))}
      </XStack>
      <XStack flex={0.25}>
        {isCustomEditing ? (
          <TextField
            accessibilityLabel={customAccessibilityLabel}
            keyboardType="decimal-pad"
            inputMode="decimal"
            type="number"
            autoFocus
            value={customDraft}
            onChangeText={setCustomDraft}
            onBlur={commitCustom}
            onSubmitEditing={commitCustom}
          />
        ) : (
          <Button
            variant="secondary"
            size="sm"
            grow
            flexBasis={0}
            flexShrink={1}
            selected={isCustomSelected}
            accessibilityLabel={
              isCustomSelected
                ? `${customAccessibilityLabel} ${formattedCustom}`
                : customAccessibilityLabel
            }
            onPress={startCustomEdit}
          >
            {isCustomSelected ? formattedCustom : customLabel}
          </Button>
        )}
      </XStack>
    </XStack>
  );
}
