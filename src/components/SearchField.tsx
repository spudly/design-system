import { useId } from "react";
import { Input as TamaguiInput, Label, XStack, YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

const StyledContainer = styled(XStack, {
  name: "SpudlySearchField",

  backgroundColor: "#ffffff",
  borderWidth: 1,
  borderColor: tokens.colors.gray.gray4,
  borderRadius: tokens.radii.md,
  paddingLeft: tokens.spacing[3],
  paddingRight: tokens.spacing[1],
  minHeight: 44,
  alignItems: "center",
  gap: tokens.spacing[2],
});

const StyledInput = styled(TamaguiInput, {
  name: "SpudlySearchFieldInput",

  flex: 1,
  borderWidth: 0,
  backgroundColor: "transparent",
  paddingHorizontal: 0,
  fontSize: tokens.typography.fontSize.md,
  color: tokens.colors.gray.gray10,
});

type StyledInputProps = GetProps<typeof StyledInput>;

export interface SearchFieldProps extends Omit<StyledInputProps, "value" | "onChangeText"> {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  id?: string;
}

/**
 * Search input with a leading "⌕" glyph and a clear (×) button that appears
 * when there is a value. The clear button is a real button with
 * `accessibilityLabel="Clear search"` and a 44px touch target. An optional
 * visible `label` is associated via `htmlFor`.
 */
export function SearchField({
  value,
  onChangeText,
  label,
  id: idProp,
  placeholder,
  ...rest
}: SearchFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;

  return (
    <YStack gap={tokens.spacing[1]}>
      {label ? (
        <Label htmlFor={id} fontSize={tokens.typography.fontSize.sm}>
          {label}
        </Label>
      ) : null}
      <StyledContainer>
        <Text
          aria-hidden
          style={{
            fontSize: tokens.typography.fontSize.lg,
            color: tokens.colors.gray.gray6,
          }}
        >
          ⌕
        </Text>
        <StyledInput
          id={id}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          {...rest}
        />
        {value ? (
          <XStack
            onPress={() => onChangeText("")}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            alignItems="center"
            justifyContent="center"
            minWidth={44}
            minHeight={44}
          >
            <Text
              aria-hidden
              style={{
                fontSize: tokens.typography.fontSize.lg,
                color: tokens.colors.gray.gray6,
              }}
            >
              ×
            </Text>
          </XStack>
        ) : null}
      </StyledContainer>
    </YStack>
  );
}
