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
 * that paints the theme background around its column
 * (PublicPageFrame), and the page's own surface paint is what the
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
 */
export function ScrollShell({ children }: ScrollShellProps) {
  return (
    <ScreenShell>
      <ScrollRegion>
        <YStack padding="$4" gap="$4">
          {children}
        </YStack>
      </ScrollRegion>
    </ScreenShell>
  );
}
