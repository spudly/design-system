import type { ReactNode } from "react";
import { YStack } from "tamagui";
import { tokens } from "../../tokens/index.js";

export type DashedPlaceholderProps = {
  children: ReactNode;
};

/**
 * The dashed empty-state box (#698 tranche 3): a dashed,
 * recessed frame that stands where content will go (an
 * image field with no image yet) — medium radius, dashed
 * border, recessed fill, generous vertical padding, its
 * hint line centered. The frame lives here so views render
 * the empty state without styling a box themselves.
 */
export function DashedPlaceholder({ children }: DashedPlaceholderProps) {
  return (
    <YStack
      overflow="hidden"
      borderRadius={tokens.radii.md}
      borderWidth={2}
      borderStyle="dashed"
      borderColor={tokens.colors.gray.gray4}
      backgroundColor={tokens.colors.gray.gray1}
      paddingVertical="$6"
      alignItems="center"
    >
      {children}
    </YStack>
  );
}
