import { XStack, YStack, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

const StyledChip = styled(XStack, {
  name: "SpudlyToggleChip",

  borderWidth: 1,
  borderColor: "$borderColor",
  borderRadius: tokens.radii.full,
  backgroundColor: "$surface",
  paddingHorizontal: tokens.spacing[4],
  minHeight: 44,
  alignItems: "center",
  justifyContent: "center",

  variants: {
    selected: {
      true: {
        backgroundColor: "$primary",
        borderColor: "$primary",
      },
    },
  } as const,
});

export interface ToggleChipOption {
  value: string;
  label: string;
}

export interface ToggleChipGroupProps {
  options: ToggleChipOption[];
  mode: "single" | "multiple";
  /** Selected value in `single` mode. */
  value?: string | undefined;
  /** Selected values in `multiple` mode. */
  values?: string[] | undefined;
  /**
   * Called with the value of the toggled chip. The parent owns selection
   * state, e.g.:
   *
   *   // single:   onChange={(v) => setValue(v === value ? undefined : v)}
   *   // multiple: onChange={(v) => setValues(toggleIn(values, v))}
   */
  onChange: (value: string) => void;
  label?: string;
}

/**
 * Pill-button chips for single- or multi-select (e.g. recipe tag pickers).
 * Each chip is a real button with `aria-pressed` reflecting selection and a
 * 44px minimum touch target; the selected chip uses primary colors (white
 * text on primary passes WCAG AA).
 */
export function ToggleChipGroup({
  options,
  mode,
  value,
  values = [],
  onChange,
  label,
}: ToggleChipGroupProps) {
  const isSelected = (optionValue: string) =>
    mode === "single" ? optionValue === value : values.includes(optionValue);

  return (
    <YStack gap={tokens.spacing[2]}>
      {label ? <Text variant="body">{label}</Text> : null}
      <XStack flexWrap="wrap" gap={tokens.spacing[2]}>
        {options.map((opt) => {
          const selected = isSelected(opt.value);
          return (
            <StyledChip
              key={opt.value}
              selected={selected}
              onPress={() => onChange(opt.value)}
              accessibilityRole="button"
              accessibilityLabel={opt.label}
              aria-pressed={selected}
            >
              <Text
                style={{
                  color: selected ? "$onPrimary" : "$color",
                  fontWeight: selected
                    ? tokens.typography.fontWeight.semibold
                    : tokens.typography.fontWeight.regular,
                }}
              >
                {opt.label}
              </Text>
            </StyledChip>
          );
        })}
      </XStack>
    </YStack>
  );
}
