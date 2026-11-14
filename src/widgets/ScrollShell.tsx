import type { ReactNode } from "react";
import { YStack } from "tamagui";
import { ScreenShell } from "./ScreenShell.js";
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
 * PublicRecipePage hand-rolled as a styled YStack around its
 * ScrollView before adopting ScrollRegion for the scroll itself.
 *
 * The shell is a composition, not a re-declared frame (#119
 * dedupe): ScreenShell supplies the surface frame and
 * ScrollRegion the scroll, and this shell adds only the inset
 * column the blocks stack in.
 *
 * The column is capped and centered: at most
 * SCROLL_SHELL_COLUMN_MAX_WIDTH (768px, the retired public
 * frame's COLUMN_MAX_WIDTH — the web layout's max-w-3xl) wide,
 * centered in the scroll region, so a public page's sections
 * keep the wide public column's measure on desktop instead of
 * stretching edge to edge (#473: the cap moved here from the
 * retired PublicFrameLayout, whose column this shell's sole
 * consumer, PublicRecipePage, rendered inside). The footer is
 * not the shell's: BigFooterShell renders it outside this
 * column, uncapped.
 */
const SCROLL_SHELL_COLUMN_MAX_WIDTH = 768;

export function ScrollShell({ children }: ScrollShellProps) {
  return (
    <ScreenShell>
      <ScrollRegion>
        <YStack
          width="100%"
          maxWidth={SCROLL_SHELL_COLUMN_MAX_WIDTH}
          alignSelf="center"
          padding="$4"
          gap="$4"
        >
          {children}
        </YStack>
      </ScrollRegion>
    </ScreenShell>
  );
}
