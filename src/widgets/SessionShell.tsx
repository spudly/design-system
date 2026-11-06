import type { ReactNode } from "react";
import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { ScrollRegion } from "./ScrollRegion.js";

export type SessionShellProps = {
  /**
   * Scroll the content column (a session in progress, whose
   * transcript grows past the screen). The default fixed
   * column suits a session's start state, whose content is a
   * single form.
   */
  scrollable?: boolean;
  children: ReactNode;
};

/**
 * The frame for a session screen — a guided, multi-step
 * interaction (an AI session, a drill, a wizard): a recessed
 * page background, the standard content padding, and a
 * uniform section rhythm between the session's blocks, which
 * the blocks themselves do not carry. In the scrollable form
 * the column also owns the end-of-scroll breathing room below
 * the last block. Extracted for the #119 page de-styling
 * program from the AI session page, whose two states framed
 * themselves with hand-styled shells.
 *
 * The scrollable form composes ScrollRegion for the scroll
 * itself (#119 dedupe): the shell owns the recessed frame and
 * the padded column, the region owns scrolling — the tranche's
 * first cut hand-rolled a raw ScrollView with the padding on
 * its content container, which bypassed the shell-gap contract
 * the shared region carries.
 */
export function SessionShell({ scrollable = false, children }: SessionShellProps) {
  if (scrollable) {
    return (
      <YStack flex={1} backgroundColor={tokens.colors.gray.gray1}>
        <ScrollRegion>
          <YStack paddingHorizontal="$4" paddingTop="$4" gap="$4" paddingBottom={tokens.spacing[8]}>
            {children}
          </YStack>
        </ScrollRegion>
      </YStack>
    );
  }
  return (
    <YStack
      flex={1}
      backgroundColor={tokens.colors.gray.gray1}
      paddingHorizontal="$4"
      paddingTop="$4"
      gap="$4"
    >
      {children}
    </YStack>
  );
}
