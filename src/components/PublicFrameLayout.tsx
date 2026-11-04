import type { ReactNode } from "react";
import { ScrollView, View, YStack, isWeb } from "tamagui";
import { mainRoleProps } from "./accessibility.js";

/**
 * The wide public column: the web layout's max-w-3xl (768px),
 * shared by the public frame's header band, content column, and
 * footer band (PublicFrameHeader / BigFooter import this
 * constant), and the same column the legal prose renders into
 * (LegalDocumentPage's PROSE_MAX_WIDTH).
 */
export const COLUMN_MAX_WIDTH = 768;

export type PublicFrameLayoutProps = {
  /** The frame's header band (a PublicFrameHeader). */
  header: ReactNode;
  /** The frame's footer band (a BigFooter, #410). */
  footer: ReactNode;
  /** The page content, rendered into the wide centered column. */
  children: ReactNode;
};

/**
 * The public frame's shell (#119): a full-height column on the
 * page background with the header band pinned above and the
 * footer band below the wide centered content column. The frame
 * itself does not scroll — the page inside owns its scroll, the
 * same split as the web PublicPageLayout it replaces, whose
 * header and footer sit outside the scrolling document flow.
 *
 * Extracted from PublicPageFrame for the #119 page de-styling
 * program: the frame's composition (PublicPageFrame) passes its
 * header and footer bands as slots and its page as the child;
 * every layout decision (the background, the column's width and
 * centering, the column's share of the height) stays here.
 *
 * Landmarks (#366): on web the content column is the page's
 * `main` landmark (via `mainRoleProps` from the shared
 * accessibility translation); the header and footer bands carry
 * their own banner / contentinfo landmarks. This frame is the
 * outermost chrome on public surfaces, so it is the landmark
 * owner — pages composed inside it must not add duplicates.
 * Native is unaffected.
 *
 * Native footer scroll path (CodeRabbit review, PR #413): the
 * "frame does not scroll" split above covers the header and the
 * content column, but BigFooter has no internal scroll region,
 * so on native a footer taller than the space left after the
 * header was clipped with no scroll path to its lower links.
 * On native the footer therefore renders inside its own
 * bounded scroll region — the same pattern as BigFooterShell:
 * a ScrollView that takes the footer's intrinsic height when
 * it fits (flexGrow 0) but can shrink below it (flexShrink 1),
 * so the region caps at the available space and the lower
 * links scroll into reach. Web renders the footer bare: the
 * document scrolls the whole frame, so the same links stay
 * reachable there. The scroll region wraps ONLY the footer —
 * the header and the page content keep their existing layout
 * and scroll behavior.
 */
export function PublicFrameLayout({ header, footer, children }: PublicFrameLayoutProps) {
  return (
    <YStack flex={1} backgroundColor="$background">
      {header}
      <View flex={1} width="100%" maxWidth={COLUMN_MAX_WIDTH} alignSelf="center" {...mainRoleProps}>
        {children}
      </View>
      {isWeb ? (
        footer
      ) : (
        <ScrollView flexGrow={0} flexShrink={1} keyboardShouldPersistTaps="handled">
          {footer}
        </ScrollView>
      )}
    </YStack>
  );
}
