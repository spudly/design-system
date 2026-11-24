import { isWeb } from "tamagui";
import { Col } from "./Col.js";
import type { ColProps } from "./Col.js";
import type { LayoutSize } from "../layout.js";
import { tokens } from "../../tokens/index.js";

export type ScreenContainerProps = Omit<ColProps, "gap"> & {
  /**
   * Shell mode: `default` page padding, `padded` (wider), `list` (flush —
   * caller manages padding), `auth` (surface background, large top offset,
   * content in a centered column capped at 480px).
   * Page background for the other modes stays a caller/stack prop, as
   * before; only `auth` bakes in its surface background.
   */
  variant?: "default" | "padded" | "list" | "auth";
  /**
   * Separation between the container's sections: a t-shirt
   * size, or a raw pixel number. The number form is the pinned
   * #265 contract (gap={24} renders 24px): numbers on the
   * spacing scale translate to their t-shirt size, and any
   * other number rides the style channel, like Card's.
   */
  gap?: LayoutSize | number;
};

/**
 * The spacing scale in pixels, for translating a numeric caller
 * gap to its t-shirt size.
 */
const gapSizeByPixels: Record<number, LayoutSize> = {
  4: "xs",
  8: "s",
  12: "m",
  16: "l",
  24: "xl",
  32: "xxl",
};

function resolveGap(gap: LayoutSize | number): { size?: LayoutSize; style?: { gap: number } } {
  if (typeof gap === "string") {
    return { size: gap };
  }
  const size = gapSizeByPixels[gap];
  return size !== undefined ? { size } : { style: { gap } };
}

/**
 * Page scaffold: the plain content container for a page — page
 * padding and consistent vertical spacing between sections, and
 * nothing else (#547).
 *
 * Scroll model (#547, Stephen's page-scroll ruling): this
 * container renders NO scroller on either platform. On web the
 * document is the page's scroller; on native the page's single
 * scroller is owned per BigFooterShell's scroll mode — the
 * shell's own ScrollView for plain pages, or the page content's
 * list / scroll region for list and self-scrolling pages. The
 * pre-#547 `scrollable` prop — which wrapped the content in this
 * container's own ScrollView and produced a nested scroller
 * inside the shell's bounded region — is removed, along with
 * every call site that passed it.
 *
 * #746 (Option B): the container renders Col directly and its
 * variants translate to Col props in code — no styled root.
 * The variants' geometry:
 * - default: 16px padding on all sides (px/py "l").
 * - padded: broader horizontal padding (24px, px "xl") and a
 *   larger top offset (32px). The offset is single-side, which
 *   Col's padding props deliberately do not offer, so it rides
 *   the style channel over py "l"'s 16px bottom.
 * - list: flush — no container padding at all; callers manage
 *   their own, e.g. a FlatList with its own content padding. On
 *   native the variant also flexes within the shell frame —
 *   see boundedFlexProps below (eciperay #526).
 * - auth: surface background, wide horizontal padding (24px),
 *   and a large top offset for sign-in flows. 80px is the
 *   shell's fixed top offset; it is not on the spacing scale,
 *   and rides the style channel like padded's. This outer layer
 *   stays full-width so the $surface paint covers the whole
 *   screen; the content column inside it is capped and centered
 *   at the FormScreenLayout geometry (480px) — without the cap
 *   the auth pages stretched edge-to-edge on desktop web
 *   (#265). Centering comes from this layer's `center` (its
 *   alignItems), not alignSelf on the column, so it holds under
 *   any parent, flex or block. On phone-width viewports the cap
 *   does not bind and nothing changes.
 */
/**
 * The bounded-region flex on native for the `list` and `default`
 * variants (eciperay #526; design-system #676):
 * the list variant exists to host a self-bounding list (BoundedList's
 * `flex: 1` FlatList) inside BigFooterShell's frame, and the frame
 * bounds this container only if the container itself flexes. Without
 * it the container sizes to content, and a `flex: 1` list inside an
 * auto-height column computes to height 0 in Yoga — the page renders
 * its chrome with a completely empty body (no filter bar, no rows,
 * no loading state). That is the regression @spudly/ui 9.2.0 shipped
 * when #547 dropped this component's pre-#547 base `flex: 1` /
 * `minHeight: "100%"`. PR #619 restored the flex for `list` only.
 * The `default` variant has the same composition on the form shell
 * pages (EditRecipePage, EditVersionPage, ManualEntryPage): each
 * renders this container inside BigFooterShell's content mode, and
 * its content (RecipeFormPage) renders its own content-mode shell
 * whose ScrollRegion is a native `ScrollView flex={1}` inside a
 * `flex: 1` frame — so without the flex here the form body likewise
 * computed to height 0 on Android and the pages rendered only their
 * heading (#676). Before #547 every variant carried the base flex
 * and these pages rendered correctly, so the default variant gets
 * the same treatment; `padded` / `auth` host no self-scrolling
 * region and are untouched. The flex is native-only, applied as a
 * prop rather than in the variant geometry, for the reason
 * ScreenShell's platform split documents: on web `flex: 1`'s zero
 * basis collapses a column inside BigFooterShell's unbounded
 * space-between shell, and these variants' web content must keep
 * flowing in the document. Web therefore gets no flex prop at all.
 *
 * #746 translation: flex: 1 is Col's `grow shrink` (the plan's
 * flex: 1 rule — the same translation SessionShell and
 * FullScreenShell carry). The zero basis is not load-bearing
 * here: the frame's height is definite, so a growing, shrinking
 * child lands at the frame height from either basis, and the
 * hosted list bounds itself against that height.
 */
const boundedFlexProps = { grow: true, shrink: true } as const;

/**
 * The default variant's form of the bounded-region flex (#676):
 * flexGrow: 1 with an automatic basis, NOT flex: 1 — Col's
 * `grow` alone. The default variant also renders inside
 * BigFooterShell's default "shell" mode, whose native ScrollView
 * content column is `flexGrow: 1` / `minHeight: "100%"` with no
 * definite height: there, a flex: 1 (zero-basis) container would
 * contribute none of its content height to the scroller's
 * extent, so a page taller than the viewport would overflow the
 * container and its tail would be unreachable. With an automatic
 * basis the container contributes its full content height in
 * shell mode and merely grows to fill the column when the page
 * is short — while in the content-mode frame (definite height)
 * flexGrow still stretches it to the frame, which is exactly
 * the bounded height the form pages' inner scroll region needs.
 */
const defaultFlexProps = { grow: true } as const;

export function ScreenContainer({
  children,
  gap,
  variant = "default",
  style,
  ...rest
}: ScreenContainerProps) {
  // The container resolves the caller's gap over its own 16px
  // default in code and always passes a defined gap to Col:
  // an explicit undefined gap must never reach the stack, the
  // #299 hazard (an explicit `gap={undefined}` overrode the
  // styled root's static 16px gap in Tamagui's web style merge,
  // so shells whose caller passed no gap rendered their
  // children flush on web; native ignored the undefined, which
  // is why only web lost the shell's section separation).
  const outerGap = resolveGap(gap ?? "l");
  const topOffset = variant === "padded" ? tokens.spacing[8] : variant === "auth" ? 80 : undefined;
  const composedStyle = [
    topOffset !== undefined ? { paddingTop: topOffset } : undefined,
    outerGap.style,
    style,
  ];
  return (
    <Col
      name="ScreenContainer"
      {...(variant !== "list" ? { px: variant === "default" ? "l" : "xl" } : null)}
      {...(variant !== "list" ? { py: "l" } : null)}
      {...(outerGap.size !== undefined ? { gap: outerGap.size } : null)}
      {...(variant === "auth" ? { backgroundColor: "$surface" as const, center: true } : null)}
      {...(variant === "list" && !isWeb ? boundedFlexProps : null)}
      {...(variant === "default" && !isWeb ? defaultFlexProps : null)}
      {...rest}
      style={composedStyle}
    >
      {variant === "auth" ? <AuthContent gap={gap}>{children}</AuthContent> : children}
    </Col>
  );
}

/**
 * The capped, centered content column rendered inside the `auth`
 * shell (see the variant geometry above): 480px wide at most,
 * with the shell's section gap between the page's children.
 */
function AuthContent({
  gap,
  children,
}: {
  gap: LayoutSize | number | undefined;
  children?: ColProps["children"];
}) {
  const authGap = resolveGap(gap ?? "l");
  return (
    <Col
      name="ScreenContainerAuthContent"
      width="100%"
      maxWidth={480}
      {...(authGap.size !== undefined ? { gap: authGap.size } : null)}
      {...(authGap.style !== undefined ? { style: authGap.style } : null)}
    >
      {children}
    </Col>
  );
}
