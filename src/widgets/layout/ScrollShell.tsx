import type { ReactNode } from "react";
import { isWeb } from "tamagui";

import { Col } from "./Col.js";
import { ScrollRegion } from "./ScrollRegion.js";

export type ScrollShellProps = {
  /** The page's blocks, stacked in the shell's inset column. */
  children: ReactNode;
};

/**
 * A page's scrolling shell: a surface-painted, full-height frame
 * whose single scroll region holds the page's blocks in an inset
 * column — $4 padding on every side and the $4 (16px) rhythm
 * between blocks, owned here so the page composes blocks without
 * padding or spacing any of them itself (#119).
 *
 * The paint is the point: a public page renders inside a frame
 * that paints the theme background around its column,
 * and the page's own surface paint is what the
 * column's content sits on — in Warm Harvest that is #fffdf8 over
 * the frame's #faf6f0, so dropping the paint would visibly re-tint
 * every section. ScreenContainer is the unpainted alternative for
 * pages whose host already paints the surface; this shell is for
 * pages that own their paint and their scroll, the shape
 * RecipeDetailPage's guest mode (#757) renders inside.
 *
 * The shell is a composition, not a re-declared frame (#119
 * dedupe): the surface frame is inlined below and ScrollRegion
 * supplies the scroll, and this shell adds only the inset
 * column the blocks stack in. The frame is the retired
 * ScreenShell's (#741, inlined here and into RecipeDetailPage —
 * its only two compositions): a full-height, surface-filled
 * column with the #547 platform split — on native the frame's
 * `flex: 1` (Col's grow shrink) fills the bounded frame
 * BigFooterShell's "content" mode gives it; on web the document
 * scrolls the whole page, so the frame renders as a plain
 * growing surface column (grow only), since `flex: 1`'s zero
 * basis collapsed it inside BigFooterShell's unbounded
 * space-between column and left the footer at the viewport's
 * bottom edge while the content overflowed past it (the
 * rendered-Storybook audit on PR #556).
 *
 * The column is capped and centered: at most
 * SCROLL_SHELL_COLUMN_MAX_WIDTH (768px, the retired public
 * frame's COLUMN_MAX_WIDTH — the web layout's max-w-3xl) wide,
 * centered in the scroll region, so a public page's sections
 * keep the wide public column's measure on desktop instead of
 * stretching edge to edge (#473: the cap moved here from the
 * retired PublicFrameLayout, whose column this shell's
 * consumer — RecipeDetailPage's guest mode since #757 —
 * renders inside). The footer is
 * not the shell's: BigFooterShell renders it outside this
 * column, uncapped.
 */
const SCROLL_SHELL_COLUMN_MAX_WIDTH = 768;

export function ScrollShell({ children }: ScrollShellProps) {
  const region = (
    <ScrollRegion>
      <Col width="100%" maxWidth={SCROLL_SHELL_COLUMN_MAX_WIDTH} alignSelf="center" p="l" gap="l">
        {children}
      </Col>
    </ScrollRegion>
  );
  if (isWeb) {
    return (
      <Col grow backgroundColor="$surface">
        {region}
      </Col>
    );
  }
  return (
    <Col grow shrink backgroundColor="$surface">
      {region}
    </Col>
  );
}
