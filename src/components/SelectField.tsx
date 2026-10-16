import { useId } from "react";
import { Adapt, Label, Select as TamaguiSelect, Sheet, YStack, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

const StyledTrigger = styled(TamaguiSelect.Trigger, {
  name: "SpudlySelectFieldTrigger",

  backgroundColor: "$surface",
  borderWidth: 1,
  // Input boundary: $textMuted holds ≥3:1 against page and surface in every
  // brand and mode; $borderColor fell to 1.94–2.29:1 in dark mode.
  borderColor: "$textMuted",
  borderRadius: tokens.radii.md,
  paddingHorizontal: tokens.spacing[3],
  minHeight: 44,
  justifyContent: "space-between",

  variants: {
    error: {
      true: {
        borderColor: "$danger",
      },
    },
  } as const,
});

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  id?: string;
}

/**
 * Labeled select. On touch devices the options open in a bottom sheet (via
 * Tamagui Adapt); elsewhere they render in a popover. Associates the label
 * via `htmlFor`, wires error text through `aria-describedby`/`aria-invalid`,
 * and enforces a 44px minimum target.
 */
export function SelectField({
  label,
  options,
  value,
  onValueChange,
  placeholder = "Select…",
  error,
  id: idProp,
}: SelectFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const errorId = `${id}-error`;

  return (
    <YStack gap={tokens.spacing[1]}>
      {label ? (
        <Label htmlFor={id} fontSize={tokens.typography.fontSize.sm}>
          {label}
        </Label>
      ) : null}
      <TamaguiSelect value={value ?? ""} onValueChange={(v) => onValueChange?.(v)} zIndex={200000}>
        <StyledTrigger
          id={id}
          error={!!error}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        >
          <TamaguiSelect.Value placeholder={placeholder} />
          <Text style={{ color: "$textMuted" }}>▾</Text>
        </StyledTrigger>

        <Adapt platform="touch">
          <Sheet modal dismissOnSnapToBottom>
            <Sheet.Overlay />
            <Sheet.ScrollView>
              <Adapt.Contents />
            </Sheet.ScrollView>
          </Sheet>
        </Adapt>

        <TamaguiSelect.Content>
          <TamaguiSelect.Viewport minWidth={200}>
            {options.map((option) => (
              <TamaguiSelect.Item key={option.value} value={option.value}>
                <TamaguiSelect.ItemText>{option.label}</TamaguiSelect.ItemText>
                <TamaguiSelect.ItemIndicator marginLeft="auto">
                  <Text style={{ color: "$primary" }}>✓</Text>
                </TamaguiSelect.ItemIndicator>
              </TamaguiSelect.Item>
            ))}
          </TamaguiSelect.Viewport>
        </TamaguiSelect.Content>
      </TamaguiSelect>
      {error ? (
        <Text variant="error" id={errorId}>
          {error}
        </Text>
      ) : null}
    </YStack>
  );
}
