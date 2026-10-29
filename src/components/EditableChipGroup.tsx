import { useState } from "react";
import { View, XStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";
import { TextField } from "./TextField.js";
import { ToggleChipGroup, type ToggleChipOption } from "./ToggleChipGroup.js";
import { platformAccessibilityProps } from "./accessibility.js";

export type EditableChipGroupProps = {
  /** The group's label (e.g. "Scale"). */
  label: string;
  /** The preset options. */
  options: ToggleChipOption[];
  /**
   * The selected value: one of the preset option values, or
   * any other string once a custom value has been committed.
   */
  value: string;
  /**
   * Selection changes: a preset's value when a preset chip is
   * pressed, or the committed custom entry (a positive number
   * as a plain string) when the custom editor commits.
   */
  onChange: (value: string) => void;
  /** The trailing chip's resting label (e.g. "Custom"). */
  customLabel: string;
  /**
   * The trailing chip's accessible name, doubling as the custom
   * editor's label (e.g. "Custom scale"). When a custom value
   * is selected, the formatted value joins the name, so the
   * selected multiplier is announced, not just the word Custom.
   */
  customAccessibilityLabel: string;
  /**
   * Formats a committed custom value for the selected chip's
   * visible label and accessible name (e.g. appending a unit
   * suffix). Defaults to the value itself.
   */
  formatCustomValue?: (value: string) => string;
};

/**
 * A chip group with an editable Custom chip (#119): a labeled,
 * non-wrapping row of preset chips (a ToggleChipGroup) plus one
 * trailing chip that turns into a number input when pressed —
 * any value beyond the presets is directly enterable, and once
 * committed the chip shows the applied custom value selected.
 * Extracted from RecipeDetailPage's scale row (#73), which the
 * foundation left to this tranche; the shape is generic — any
 * preset-or-custom quantity (scale, duration, amount) composes
 * it.
 *
 * The editing state is ephemeral view state the group owns, as
 * the page held it: whether the custom chip is currently a
 * number input, and the input's uncommitted text. Committing an
 * entry applies it through the same `onChange` the presets use;
 * an empty, non-numeric, or non-positive entry commits nothing
 * and the chip restores the current value.
 *
 * Web keyboard support (the TextLink pattern): the Custom chip
 * carries the button role on web, and a div with a role is not
 * keyboard-operable on its own, so Enter and Space start the
 * edit exactly like a press. `tabIndex` and `onKeyDown` are
 * web-only props in Tamagui and are ignored on native, where
 * onPress is the activation path.
 */
export function EditableChipGroup({
  label,
  options,
  value,
  onChange,
  customLabel,
  customAccessibilityLabel,
  formatCustomValue,
}: EditableChipGroupProps) {
  const [isCustomEditing, setCustomEditing] = useState(false);
  const [customDraft, setCustomDraft] = useState("");
  const isPreset = options.some((option) => option.value === value);
  const isCustomSelected = !isPreset && !isCustomEditing;
  const formattedCustom = formatCustomValue ? formatCustomValue(value) : value;

  const startCustomEdit = () => {
    setCustomDraft(isPreset ? "" : value);
    setCustomEditing(true);
  };

  const handleCustomKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      startCustomEdit();
    }
  };

  const commitCustom = () => {
    const parsed = Number(customDraft.trim());
    setCustomEditing(false);
    if (Number.isFinite(parsed) && parsed > 0) {
      onChange(String(parsed));
    }
  };

  return (
    <XStack alignItems="center" gap="$2">
      <XStack paddingInlineEnd="$1">
        <Text
          fontSize={tokens.typography.fontSize.sm}
          fontWeight={tokens.typography.fontWeight.medium}
          color={tokens.colors.gray.gray8}
        >
          {label}
        </Text>
      </XStack>
      <ToggleChipGroup
        options={options}
        mode="single"
        wrap={false}
        value={value}
        onChange={(next) => {
          setCustomEditing(false);
          onChange(next);
        }}
      />
      <View flex={0.25}>
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
          <XStack
            minHeight={44}
            alignItems="center"
            justifyContent="center"
            borderRadius={tokens.radii.full}
            borderWidth={1}
            borderColor={isCustomSelected ? "$primary" : "$textMuted"}
            backgroundColor={isCustomSelected ? "$primary" : "$surface"}
            onPress={startCustomEdit}
            {...platformAccessibilityProps({
              accessibilityRole: "button",
              accessibilityLabel: isCustomSelected
                ? `${customAccessibilityLabel} ${formattedCustom}`
                : customAccessibilityLabel,
            })}
            tabIndex={0}
            onKeyDown={handleCustomKeyDown}
            aria-pressed={isCustomSelected}
          >
            <Text
              style={{
                color: isCustomSelected ? "$onPrimary" : "$color",
                fontWeight: isCustomSelected
                  ? tokens.typography.fontWeight.semibold
                  : tokens.typography.fontWeight.regular,
              }}
            >
              {isCustomSelected ? formattedCustom : customLabel}
            </Text>
          </XStack>
        )}
      </View>
    </XStack>
  );
}
