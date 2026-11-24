import type { ReactNode } from "react";
import { YStack } from "tamagui";
import { tokens } from "../../tokens/index.js";

export type StackedButtonRowProps = {
  children: ReactNode;
};

/**
 * A call-to-action row that stacks narrow and rows on wide
 * (#119): the buttons stack in a centered column on native
 * and sit in a centered row on web — a flat `web:` clause on
 * a column stack, the ScreenContainer idiom, because the DS
 * Tamagui config defines no width breakpoints and the row
 * deliberately does not wrap (a wrapping row could seat two
 * CTAs side by side at a narrow viewport, which is not the
 * contracted stack). The row owns the 12px gap and the
 * centering; call sites pass only the buttons.
 */
export function StackedButtonRow({ children }: StackedButtonRowProps) {
  return (
    <YStack
      flexDirection="web:row"
      gap={tokens.spacing[3]}
      alignItems="center"
      justifyContent="center"
    >
      {children}
    </YStack>
  );
}
