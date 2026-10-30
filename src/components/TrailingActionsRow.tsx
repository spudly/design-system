import type { ReactNode } from "react";
import { XStack } from "tamagui";
import { tokens } from "../tokens/index.js";

export type TrailingActionsRowProps = {
  /** The row's leading group: the field or content the actions
   * serve (a color picker, a badge), held at the row's start. */
  leading: ReactNode;
  /** The trailing actions, laid out at the row's end in their
   * own group at the 12px action gap. */
  children: ReactNode;
};

/**
 * A row of a field and its actions, spread to opposite ends
 * (#119): the leading group at the start, the actions at the
 * end, vertically centered on each other. The row wraps when
 * the two groups cannot fit side by side — the actions drop
 * below the field instead of overflowing off-screen (the #219
 * failure: an unwrapped field + action row pushed its action
 * out of reach at narrow widths) — and the leading field is
 * expected to shrink as it narrows (ColorPickerField's root
 * does). Form rows (a picker over its Add button) and content
 * rows (a badge over its Edit / Delete actions) share the
 * shape; what the groups contain is the caller's composition.
 */
export function TrailingActionsRow({ leading, children }: TrailingActionsRowProps) {
  return (
    <XStack flexWrap="wrap" gap="$2" alignItems="center" justifyContent="space-between">
      {leading}
      <XStack gap={tokens.spacing[3]} alignItems="center">
        {children}
      </XStack>
    </XStack>
  );
}
