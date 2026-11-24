import type { ReactNode } from "react";
import { YStack, isWeb } from "tamagui";
import { tokens } from "../../tokens/index.js";

export type PinnedHeaderShellProps = {
  /** The pinned header content (a page title, a tab bar):
   * rendered in the shell's padded header block and held above
   * the content region while the content scrolls itself. */
  header: ReactNode;
  /** The shell's content region: on native it fills the height
   * the header leaves and manages its own scrolling (a page
   * composed under the chrome, a list); on web it grows in
   * normal document flow (#705 — see the component note). */
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
 * belongs to the header content (a section Col, say); the
 * shell adds none.
 *
 * Platform split (#705, the #547 page-scroll contract): on
 * native the root is the bounded `flex: 1` frame, which gives
 * the content region's own scroller its height. On web there
 * is no content scroller inside a footer shell — the document
 * scrolls — so the root only grows (`flexGrow: 1`, no bounded
 * basis): its height is content-driven, and a footer shell
 * composed around it places its footer below the last content
 * item instead of mid-list over it.
 */
export function PinnedHeaderShell({ header, children }: PinnedHeaderShellProps) {
  return (
    <YStack {...(isWeb ? { flexGrow: 1 } : { flex: 1 })} backgroundColor={tokens.colors.gray.gray1}>
      <YStack paddingHorizontal="$4" paddingTop="$4">
        {header}
      </YStack>
      {children}
    </YStack>
  );
}
