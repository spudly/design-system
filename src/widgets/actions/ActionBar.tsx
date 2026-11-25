import { Col } from "../layout/Col.js";
import type { ColProps } from "../layout/Col.js";
import { tokens } from "../../tokens/index.js";

export type ActionBarProps = ColProps & {
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
 * with consistent gaps — compose rows with Row. All colors come from
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
  // #746 (Option B): the former styled root's base and variant
  // geometry restated on a Col — the edge insets ride the style
  // channel (the subset omits the position-inset props), the
  // placement variant picks its inner-edge border and shadow
  // direction in code, and the viewport pinning variant's
  // platform-split position/max-height/overflow ride the props
  // they rode in the styled config.
  const isViewport = pinning === "viewport";
  return (
    <Col
      name="ActionBar"
      position={isViewport ? { default: "absolute", web: "fixed" } : "absolute"}
      zIndex={1}
      backgroundColor="$surface"
      borderColor="$borderColor"
      borderWidth={0}
      borderBottomWidth={placement === "top" ? 1 : undefined}
      borderTopWidth={placement === "bottom" ? 1 : undefined}
      shadowColor={tokens.shadows.lg.shadowColor}
      shadowOpacity={tokens.shadows.lg.shadowOpacity}
      shadowRadius={tokens.shadows.lg.shadowRadius}
      shadowOffset={{
        width: 0,
        height:
          placement === "top"
            ? tokens.shadows.lg.shadowOffset.height
            : -tokens.shadows.lg.shadowOffset.height,
      }}
      {...(isViewport ? { maxHeight: { web: "100%" }, overflow: { web: "auto" } } : {})}
      p="l"
      gap="m"
      style={[
        {
          left: 0,
          right: 0,
          ...(placement === "top" ? { top: 0 } : { bottom: 0 }),
        },
        ...composedStyle,
      ]}
      {...rest}
    />
  );
}
