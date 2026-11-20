import type { ReactNode } from "react";
import { YStack, isWeb } from "tamagui";

/**
 * PageContentColumn (#628, Stephen's directive 2026-11-14 as
 * amended): on desktop web, a page's content renders inside a
 * centered column at most PAGE_CONTENT_MAX_WIDTH (1200px) wide,
 * so wide viewports do not stretch page content edge to edge.
 * Stephen amended the originally proposed 1280px width to
 * 1200px when he approved the plan, and directed that the
 * AppTopBar's content constrain to the same column while the
 * Big Footer stays full-width.
 *
 * Ownership: this is an INTERNAL widget — it is not exported
 * from the widgets barrel or the package (#298, pages-only
 * surface). Page shells (BigFooterShell) and views (AppTopBar)
 * compose it by direct file import, the BigFooter precedent.
 * It owns its geometry completely and accepts no styling
 * props; the caller supplies only children (content).
 *
 * No new padding token: the column owns NO horizontal padding.
 * Pages keep whatever gutters their own content already
 * carries; adding a column-owned gutter would double-pad
 * screens whose content already insets itself (Stephen's
 * approved-plan decision for #628).
 *
 * Narrower caps compose inside: a screen with its own cap
 * (ScreenContainer's 480px form column, ScrollShell's 768px
 * column) renders inside this column and its narrower cap
 * keeps winning on that screen — this column is only the
 * outermost desktop measure.
 *
 * Native pass-through: the desktop measure is a web concern.
 * On native, screens are device-width, so the column renders
 * its children in a plain full-width stack with no maxWidth
 * and no centering constraint.
 */
export const PAGE_CONTENT_MAX_WIDTH = 1200;

export type PageContentColumnProps = {
  /** The page (or bar) content constrained to the column. */
  children: ReactNode;
  /**
   * Fill the shell's bounded height instead of sizing to the
   * content (#729): a page whose content is an absolutely-
   * positioned full-region overlay (StepOverlay) contributes
   * no intrinsic height, so the column must stretch to the
   * shell's height for the overlay to cover the region.
   */
  fillHeight?: boolean;
};

/**
 * The centered desktop content column (#628): on web, a
 * full-width stack capped at PAGE_CONTENT_MAX_WIDTH and
 * centered with alignSelf "center"; on native, a plain
 * full-width stack. The web stack is positioned, so an
 * absolutely-positioned full-region child of the page content
 * (the #547 StepOverlay case) anchors to the column, which
 * is the page's content area.
 */
export function PageContentColumn({ children, fillHeight }: PageContentColumnProps) {
  if (!isWeb) {
    return <YStack width="100%">{children}</YStack>;
  }
  return (
    <YStack
      width="100%"
      maxWidth={PAGE_CONTENT_MAX_WIDTH}
      alignSelf="center"
      position="relative"
      flex={fillHeight ? 1 : undefined}
    >
      {children}
    </YStack>
  );
}

export type FullBleedProps = {
  /** Content that breaks out of the column to full viewport width on web. */
  children: ReactNode;
};

/**
 * FullBleed (#628): the breakout companion to
 * PageContentColumn. Content that must span the full viewport
 * width from inside the centered column — a hero band, a
 * full-bleed media strip — wraps in FullBleed instead of
 * escaping the column by hand.
 *
 * Web mechanism (Stephen's approved plan for #628): negative
 * margins of calc(50% - 50vw) on both sides. The column is
 * centered, so its midpoint is the viewport midpoint; pulling
 * each side out by the difference between half the viewport
 * and half the column lands the content exactly on the
 * viewport edges at any viewport width. The values are
 * arbitrary web CSS that Tamagui's typed props do not carry,
 * so they go through the plain `style` prop — the established
 * route in this repo for web-only CSS values a Tamagui prop
 * cannot express.
 *
 * Native pass-through: there is no column to break out of on
 * native (PageContentColumn is a pass-through there and
 * screens are device-width), so FullBleed renders its
 * children in a plain stack with no margins — a no-op.
 */
export function FullBleed({ children }: FullBleedProps) {
  if (!isWeb) {
    return <YStack>{children}</YStack>;
  }
  return (
    <YStack
      style={{
        marginLeft: "calc(50% - 50vw)",
        marginRight: "calc(50% - 50vw)",
      }}
    >
      {children}
    </YStack>
  );
}
