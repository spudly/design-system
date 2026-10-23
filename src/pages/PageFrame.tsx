import type { ReactNode } from "react";
import { View } from "tamagui";
import { ScreenContainer } from "../components/ScreenContainer.js";

/**
 * Phone-width page frame for the full-page demo stories (#44): the apps
 * are mobile-first, so every page story renders inside the same fixed
 * 430px-wide frame. A fixed frame width is also what keeps the page
 * screenshots comparable run to run — a fluid width would let the
 * capture viewport, not the layout, decide where things wrap.
 * `scrollable={false}`: the story canvas, not an inner scroll view,
 * owns the page height, so the screenshot captures the whole page.
 */
export function PageFrame({
  children,
  variant,
}: {
  children: ReactNode;
  /** ScreenContainer shell mode — pass "list" for list screens whose
   * content manages its own padding, like the real Recipes screen. */
  variant?: "default" | "padded" | "list" | "auth";
}) {
  return (
    <View width={430} maxWidth="100%">
      <ScreenContainer scrollable={false} {...(variant ? { variant } : {})}>
        {children}
      </ScreenContainer>
    </View>
  );
}
