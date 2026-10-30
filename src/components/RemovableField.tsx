import type { ReactNode } from "react";
import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "./Button.js";

export type RemovableFieldProps = {
  /** Fires when the remove control is pressed. Hiding the
   * field and clearing its values are the caller's side of the
   * press (the collapsed-filter rule: a hidden filter never
   * keeps filtering). */
  onRemove: () => void;
  /** The remove control's accessible name — it names what is
   * being removed (e.g. "Remove Status filter"), because the
   * visible "Remove" text alone does not say which field goes. */
  removeAccessibilityLabel: string;
  /** The field (or field group) the remove control belongs to. */
  children: ReactNode;
};

/**
 * A field with its remove control (#119): one added filter in
 * a collapsed filter bar — the control itself, with a small
 * ghost "Remove" button right-aligned above it at a 4px gap.
 * The component owns the pairing's layout only; what removal
 * means (clear the values, hide the field) is the caller's,
 * driven by `onRemove`.
 */
export function RemovableField({
  onRemove,
  removeAccessibilityLabel,
  children,
}: RemovableFieldProps) {
  return (
    <YStack gap={tokens.spacing[1]}>
      <XStack justifyContent="flex-end">
        <Button
          variant="ghost"
          size="sm"
          accessibilityLabel={removeAccessibilityLabel}
          onPress={onRemove}
        >
          Remove
        </Button>
      </XStack>
      {children}
    </YStack>
  );
}
