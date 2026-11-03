import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledActionBar = styled(YStack, {
  name: "ActionBar",

  // Pinned to the screen edge by default; override `position` (and the
  // anchored edge) through stack props when the bar should sit in flow.
  position: "absolute",
  left: 0,
  right: 0,
  zIndex: 1,
  backgroundColor: "$surface",
  borderColor: "$borderColor",
  borderWidth: 0,
  padding: tokens.spacing[4],
  gap: tokens.spacing[3],
  shadowColor: tokens.shadows.lg.shadowColor,
  shadowOpacity: tokens.shadows.lg.shadowOpacity,
  shadowRadius: tokens.shadows.lg.shadowRadius,

  variants: {
    placement: {
      // Border on the inner edge only; the shadow falls toward the content.
      top: {
        top: 0,
        borderBottomWidth: 1,
        shadowOffset: { width: 0, height: tokens.shadows.lg.shadowOffset.height },
      },
      bottom: {
        bottom: 0,
        borderTopWidth: 1,
        shadowOffset: { width: 0, height: -tokens.shadows.lg.shadowOffset.height },
      },
    },
    pinning: {
      // The bar pins to its nearest positioned ancestor (its screen
      // container): the absolute base styles above already say this,
      // so the default mode adds nothing.
      container: {},
      // The bar pins to the viewport itself (#405). On web that is
      // `position: fixed`: an absolutely-positioned bar pins to its
      // nearest positioned ancestor and scrolls with the document, so
      // the bar could scroll out of view. A fixed bar also cannot be
      // reached by page scroll, so on web it is capped at the viewport
      // height (a fixed element's containing block is the viewport, so
      // `maxHeight: "100%"` is the viewport height) and scrolls
      // internally: a bar taller than the viewport — short screens,
      // high zoom — keeps its content reachable instead of pushing it
      // past the viewport edge. On native there is no
      // viewport/document split — absolute edge-pinning inside the
      // full-screen container is correct — so the native form keeps
      // the absolute base. These styles live here, in ActionBar's own
      // styled definition: DS components own their styles, so callers
      // select this mode through the semantic `pinning` prop and never
      // pass the style props themselves.
      viewport: {
        position: { default: "absolute", web: "fixed" },
        maxHeight: { web: "100%" },
        overflow: { web: "auto" },
      },
    },
  } as const,

  defaultVariants: {
    placement: "bottom",
    pinning: "container",
  },
});

type StyledActionBarProps = GetProps<typeof StyledActionBar>;

export type ActionBarProps = StyledActionBarProps & {
  /** Which screen edge the bar pins to. Defaults to "bottom". */
  placement?: "top" | "bottom";
  /**
   * What the bar pins to: its screen "container" (default) or the
   * "viewport" itself. Viewport pinning is for bars that must stay at
   * the screen edge regardless of page scroll (consent bars, install
   * prompts): on web the bar is viewport-fixed, capped at the viewport
   * height, and scrolls internally; on native it pins absolute inside
   * its container, exactly like container pinning.
   */
  pinning?: "container" | "viewport";
};

/**
 * Sticky action bar: a bordered, shadowed surface pinned to the top or
 * bottom edge of a screen, holding a screen's primary actions (and an
 * optional message above them). Children are laid out in a vertical stack
 * with consistent gaps — compose rows with XStack. All colors come from
 * semantic theme tokens; the border sits on the bar's inner edge. The
 * `pinning` prop selects what the bar pins to — its screen container, or
 * the viewport itself (see ActionBarProps).
 */
export function ActionBar({
  placement = "bottom",
  pinning = "container",
  style,
  ...rest
}: ActionBarProps) {
  // Android shadow: `elevation` comes from the same lg shadow token as the
  // iOS shadow props above and is applied via `style`, because Tamagui v3's
  // styled() typing accepts it in neither the static config nor this
  // component's props. It is composed as a style array under the caller's
  // style (React Native flattens arrays left to right), so unrelated caller
  // styles — including caller style arrays — preserve the shadow and an
  // explicit caller elevation wins.
  const composedStyle = [{ elevation: tokens.shadows.lg.elevation }, style];
  return (
    <StyledActionBar placement={placement} pinning={pinning} style={composedStyle} {...rest} />
  );
}
