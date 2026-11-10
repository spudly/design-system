import type { ReactNode } from "react";
import { ScrollView, YStack, isWeb } from "tamagui";

export type ScrollRegionProps = {
  children: ReactNode;
};

/**
 * The inner region of a fixed-shell screen: where part of the
 * screen is pinned — a toolbar or chrome above, actions below —
 * the region between them is the page's content block, the
 * treatment RecipeDetailPage, PublicRecipePage, and
 * RecipeFormPage each hand-rolled around their own ScrollView
 * before it was extracted as a shared component for the #119
 * page de-styling program, so the pages compose the region
 * without rendering a layout primitive.
 *
 * Platform split (#547, Stephen's page-scroll model):
 *
 * - Native: the region is the page's single scroller — a
 *   ScrollView that fills the space the shell leaves it
 *   (`flex: 1`) inside the shell's bounded frame and keeps taps
 *   landing on its controls while the keyboard is open
 *   (`keyboardShouldPersistTaps="handled"`). The composing
 *   pages' shells run in BigFooterShell's "content" mode, so
 *   no second ScrollView ever wraps it. The `tabIndex={0}` is
 *   a web-only prop, ignored here (the CardRow pattern).
 * - Web: the region renders NO scroller — just a growing
 *   column. The document scrolls the whole page through
 *   BigFooterShell's whole-page composition (a flex column at
 *   `minHeight: 100dvh` whose two children are the page content
 *   and the footer), so the region's content flows at its full
 *   height and the footer sits after it. A ScrollView on this
 *   path collapses to zero height inside the shell's unbounded
 *   column and swallows the page's content into a bounded
 *   region no reader can see — the survival the
 *   rendered-Storybook audit on PR #556 caught on
 *   RecipeDetailPage, RecipeFormPage, EditRecipePage,
 *   ManualEntryPage, and PublicRecipePage, whose web stories
 *   rendered as chrome and footer with their content inside a
 *   zero-height scroller. Keyboard scrolling on web is the
 *   document's, as on any web page — no focusable region is
 *   needed once nothing is bounded.
 */
export function ScrollRegion({ children }: ScrollRegionProps) {
  if (isWeb) {
    return (
      <YStack flexGrow={1} flexDirection="column">
        {children}
      </YStack>
    );
  }
  return (
    <ScrollView flex={1} keyboardShouldPersistTaps="handled" tabIndex={0}>
      {children}
    </ScrollView>
  );
}
