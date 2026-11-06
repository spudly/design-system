import type { ReactNode } from "react";
import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";

export type PinnedHeaderShellProps = {
  /** The pinned header content (a page title, a tab bar):
   * rendered in the shell's padded header block and held above
   * the content region while the content scrolls itself. */
  header: ReactNode;
  /** The shell's content region: it fills the height the header
   * leaves and manages its own scrolling (a page composed under
   * the chrome, a list). */
  children: ReactNode;
};

/**
 * A page shell with its header pinned above the content
 * (#119): the shell paints the page background (gray step 1)
 * and holds the header block — padded at the page inset — out
 * of the content's scroll. It exists for hub-shaped screens
 * whose chrome must stay put while the content under it is a
 * self-scrolling page in its own right: nesting that page
 * inside the shell's scroll view instead would put a
 * same-direction scroller inside a scroller, which captures
 * the content region's gestures without scrolling (the #188
 * nested-shell failure). The header's own internal rhythm
 * belongs to the header content (a SectionStack, say); the
 * shell adds none.
 */
export function PinnedHeaderShell({ header, children }: PinnedHeaderShellProps) {
  return (
    <YStack flex={1} backgroundColor={tokens.colors.gray.gray1}>
      <YStack paddingHorizontal="$4" paddingTop="$4">
        {header}
      </YStack>
      {children}
    </YStack>
  );
}
