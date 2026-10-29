import type { ReactNode } from "react";
import { ScrollView } from "tamagui";

export type ScrollRegionProps = {
  children: ReactNode;
};

/**
 * The scrollable region of a fixed-shell screen: where part of the
 * screen is pinned — a toolbar or chrome above, actions below — the
 * region between them scrolls. The region fills the space the shell
 * leaves it (`flex: 1`) and keeps taps landing on its controls while
 * the keyboard is open (`keyboardShouldPersistTaps="handled"`), the
 * treatment RecipeDetailPage, PublicRecipePage, and RecipeFormPage
 * each hand-rolled around their own ScrollView. Extracted as a
 * shared component for the #119 page de-styling program, so the
 * pages compose the region without rendering a layout primitive.
 *
 * This is not the whole-page scroller: ScreenContainer owns that
 * (it wraps a page's content in its own ScrollView). ScrollRegion
 * is for the inner region of a shell ScreenContainer does not
 * scroll (`scrollable={false}` or a page-owned fixed layout).
 */
export function ScrollRegion({ children }: ScrollRegionProps) {
  return (
    <ScrollView flex={1} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}
