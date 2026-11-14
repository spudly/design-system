import { YStack, isWeb, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledContent = styled(YStack, {
  name: "ScreenContainer",

  paddingHorizontal: tokens.spacing[4],
  paddingVertical: tokens.spacing[4],
  gap: tokens.spacing[4],

  variants: {
    variant: {
      // Standard page: default padding on all sides.
      default: {},
      // Wider page: broader horizontal padding and a larger top offset,
      // for content-led screens (the old ui-screen-shell-padded).
      padded: {
        paddingHorizontal: tokens.spacing[6],
        paddingTop: tokens.spacing[8],
      },
      // Flush: no container padding — callers manage their own, e.g. a
      // FlatList with its own content padding. On native the variant
      // also flexes within the shell frame — see listFlexProps in the
      // component below (eciperay #526).
      list: {
        paddingHorizontal: 0,
        paddingVertical: 0,
      },
      // Auth shell: surface background, wide horizontal padding, and a
      // large top offset for sign-in flows (the old ui-screen-shell-auth).
      // 80px is the shell's fixed top offset; it is not on the spacing scale.
      // This outer layer stays full-width so the $surface paint covers
      // the whole screen; the content column inside it is capped and
      // centered by StyledAuthContent at the FormScreenLayout geometry
      // (480px) — without the cap the auth pages stretched edge-to-edge
      // on desktop web (#265). Centering comes from this layer's
      // alignItems, not alignSelf on the column, so it holds under any
      // parent, flex or block. On phone-width viewports the cap does
      // not bind and nothing changes.
      auth: {
        backgroundColor: "$surface",
        paddingHorizontal: tokens.spacing[6],
        paddingTop: 80,
        alignItems: "center",
      },
    },
  } as const,

  defaultVariants: {
    variant: "default",
  },
});

/**
 * The capped, centered content column rendered inside the `auth`
 * shell (see the auth variant above): 480px wide at most, with the
 * shell's section gap between the page's children.
 */
const StyledAuthContent = styled(YStack, {
  name: "ScreenContainerAuthContent",

  width: "100%",
  maxWidth: 480,
  gap: tokens.spacing[4],
});

type StyledContentProps = GetProps<typeof StyledContent>;

export type ScreenContainerProps = StyledContentProps & {
  /**
   * Shell mode: `default` page padding, `padded` (wider), `list` (flush —
   * caller manages padding), `auth` (surface background, large top offset,
   * content in a centered column capped at 480px).
   * Page background for the other modes stays a caller/stack prop, as
   * before; only `auth` bakes in its surface background.
   */
  variant?: "default" | "padded" | "list" | "auth";
};

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
 */
/**
 * The list variant's bounded-region flex on native (eciperay #526):
 * the variant exists to host a self-bounding list (BoundedList's
 * `flex: 1` FlatList) inside BigFooterShell's frame, and the frame
 * bounds this container only if the container itself flexes. Without
 * it the container sizes to content, and a `flex: 1` list inside an
 * auto-height column computes to height 0 in Yoga — the page renders
 * its chrome with a completely empty body (no filter bar, no rows,
 * no loading state). That is the regression @spudly/ui 9.2.0 shipped
 * when #547 dropped this component's pre-#547 base `flex: 1` /
 * `minHeight: "100%"`. The flex is native-only, applied as a prop
 * rather than in the styled variant, for the reason ScreenShell's
 * platform split documents: on web `flex: 1`'s zero basis collapses
 * a column inside BigFooterShell's unbounded space-between shell,
 * and the list variant's web content must keep flowing in the
 * document. Web therefore gets no flex prop at all.
 */
const listFlexProps = { flex: 1 } as const;

export function ScreenContainer({ children, gap, ...rest }: ScreenContainerProps) {
  return (
    // The gap override is spread only when the caller actually passed
    // one: an explicit `gap={undefined}` overrides StyledContent's
    // static 16px gap in Tamagui's web style merge (the styled rule is
    // generated but the class is never applied), so every shell whose
    // caller passed no gap rendered its children flush on web (#299).
    // Native ignored the undefined and kept the static gap, which is
    // why only web lost the shell's section separation. The
    // conditional spread is the PageFrame idiom for the same hazard.
    <StyledContent
      {...(gap !== undefined ? { gap } : null)}
      {...(rest.variant === "list" && !isWeb ? listFlexProps : null)}
      {...rest}
    >
      {rest.variant === "auth" ? (
        <StyledAuthContent gap={gap ?? tokens.spacing[4]}>{children}</StyledAuthContent>
      ) : (
        children
      )}
    </StyledContent>
  );
}
