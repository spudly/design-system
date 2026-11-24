import type { ReactNode } from "react";
import { YStack, isWeb } from "tamagui";
import { tokens } from "../../tokens/index.js";
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
 *
 * Platform split (#751, the ScrollRegion / BigFooterShell
 * precedent under Stephen's #547 page-scroll model):
 *
 * - Web: the document scrolls the whole page through
 *   BigFooterShell's whole-page composition, whose content
 *   column (PageContentColumn) is a growing column with no
 *   definite height. A `flex: 1` frame there takes a
 *   zero flex basis, so the frame's box collapses and its
 *   content paints past the frame over the footer band —
 *   and bounding that collapsed box (`minHeight: 0` +
 *   `overflow: hidden`) clips the content away entirely.
 *   The web frame is therefore a growing column
 *   (`flexGrow: 1`), exactly like ScrollRegion's web form:
 *   the content flows at its full height inside the column
 *   and the footer sits after it in flow.
 * - Native: BigFooterShell's own ScrollView (default "shell"
 *   mode) bounds the page, so the frame keeps `flex: 1`;
 *   the scrollable form also keeps `minHeight: 0` so
 *   ScrollRegion's ScrollView receives the bounded height
 *   the shell leaves it.
 */
export function SessionShell({ scrollable = false, children }: SessionShellProps) {
  if (scrollable) {
    if (isWeb) {
      return (
        <YStack flexGrow={1} flexDirection="column" backgroundColor={tokens.colors.gray.gray1}>
          <ScrollRegion>
            <YStack
              paddingHorizontal="$4"
              paddingTop="$4"
              gap="$4"
              paddingBottom={tokens.spacing[8]}
            >
              {children}
            </YStack>
          </ScrollRegion>
        </YStack>
      );
    }
    return (
      <YStack flex={1} minHeight={0} backgroundColor={tokens.colors.gray.gray1}>
        <ScrollRegion>
          <YStack paddingHorizontal="$4" paddingTop="$4" gap="$4" paddingBottom={tokens.spacing[8]}>
            {children}
          </YStack>
        </ScrollRegion>
      </YStack>
    );
  }
  if (isWeb) {
    return (
      <YStack
        flexGrow={1}
        flexDirection="column"
        backgroundColor={tokens.colors.gray.gray1}
        paddingHorizontal="$4"
        paddingTop="$4"
        gap="$4"
      >
        {children}
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
