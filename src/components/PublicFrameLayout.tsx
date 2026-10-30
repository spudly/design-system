import type { ReactNode } from "react";
import { View, YStack } from "tamagui";

/**
 * The wide public column: the web layout's max-w-3xl (768px),
 * shared by the public frame's header band, content column, and
 * footer band (PublicFrameHeader / PublicFrameFooter import this
 * constant), and the same column the legal prose renders into
 * (LegalDocumentPage's PROSE_MAX_WIDTH).
 */
export const COLUMN_MAX_WIDTH = 768;

export type PublicFrameLayoutProps = {
  /** The frame's header band (a PublicFrameHeader). */
  header: ReactNode;
  /** The frame's footer band (a PublicFrameFooter). */
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
 */
export function PublicFrameLayout({ header, footer, children }: PublicFrameLayoutProps) {
  return (
    <YStack flex={1} backgroundColor="$background">
      {header}
      <View flex={1} width="100%" maxWidth={COLUMN_MAX_WIDTH} alignSelf="center">
        {children}
      </View>
      {footer}
    </YStack>
  );
}
