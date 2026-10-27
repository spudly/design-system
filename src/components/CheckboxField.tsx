import { useId } from "react";
import type { ReactNode } from "react";
import { Checkbox as TamaguiCheckbox, Label, XStack, YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

/**
 * The ✓ glyph must NOT get an explicit lineHeight: it previously
 * received one equal to its font size (14), which Tamagui's style
 * engine resolves as a multiplier of the font size — the same defect
 * that stretched SearchField's row to full screen height on Android
 * (spudly/eciperay#162; see the note in SearchField.tsx). With no
 * lineHeight prop the glyph takes the font's line height, and
 * StyledBox's fixed size + hidden overflow keep it inside the box.
 */

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
  overflow: "hidden",
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
  /**
   * Supporting text under the label. A plain string renders in the hint
   * style; richer text content (a fragment mixing strings with DS `Text`
   * / `TextLink` elements — e.g. a consent line with an inline Privacy
   * Policy link) renders in the same hint style wrapped around the
   * nodes, so inline links stay pressable. Block-level content does not
   * belong here — use `children` for that.
   */
  description?: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: string;
  id?: string;
  /**
   * Extra content slotted below the field, inside its layout stack —
   * e.g. an environment warning shown under the description. Rendered
   * as-is; the caller styles it (typically with DS `Text`).
   */
  children?: ReactNode;
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
  children,
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
      {children}
      {error ? (
        <Text variant="error" id={errorId}>
          {error}
        </Text>
      ) : null}
    </YStack>
  );
}
