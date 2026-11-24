import { isWeb } from "tamagui";
import { Col } from "./Col.js";
import type { ColProps } from "./Col.js";

export type ScreenShellProps = Omit<ColProps, "backgroundColor">;

/**
 * The fixed-shell screen frame (#119): a full-height,
 * surface-filled column for pages that pin their own chrome (a
 * Toolbar) above a scrolling region (a ScrollRegion) — the
 * shell ScreenContainer cannot be, since ScreenContainer pads
 * its content and (since #547) renders no scroller of its own.
 * Children compose the shell's structure: typically the pinned
 * chrome, then the scroll region, then any pinned footer.
 *
 * Platform split (#547, Stephen's page-scroll model): on native
 * the frame's `flex: 1` makes the shell fill the bounded
 * frame BigFooterShell's "content" mode gives it, and the
 * ScrollRegion inside is the page's single scroller. On web the
 * page has no bounded frame — the document scrolls — so the
 * shell renders as a plain growing surface column instead:
 * `flex: 1`'s zero basis collapses the shell's height inside
 * BigFooterShell's unbounded space-between column, which left
 * the footer sitting at the viewport's bottom edge while the
 * page's content overflowed past it (the rendered-Storybook
 * audit on PR #556: RecipeDetailPage and PublicRecipePage,
 * through ScrollShell, rendered their footer at the top of a
 * multi-viewport document). The surface paint is the shell's
 * on both platforms.
 *
 * #746 (Option B): both branches render Col — the native
 * branch's flex: 1 is the plan's `grow shrink` translation.
 * No styled root.
 */
export function ScreenShell({ ...rest }: ScreenShellProps) {
  if (isWeb) {
    return <Col grow backgroundColor="$surface" {...rest} />;
  }
  return <Col grow shrink backgroundColor="$surface" {...rest} />;
}
