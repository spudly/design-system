import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledActionBar = styled(YStack, {
  name: "SpudlyActionBar",

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
  } as const,

  defaultVariants: {
    placement: "bottom",
  },
});

type StyledActionBarProps = GetProps<typeof StyledActionBar>;

export interface ActionBarProps extends StyledActionBarProps {
  /** Which screen edge the bar pins to. Defaults to "bottom". */
  placement?: "top" | "bottom";
}

/**
 * Sticky action bar: a bordered, shadowed surface pinned to the top or
 * bottom edge of a screen, holding a screen's primary actions (and an
 * optional message above them). Children are laid out in a vertical stack
 * with consistent gaps — compose rows with XStack. All colors come from
 * semantic theme tokens; the border sits on the bar's inner edge.
 */
export function ActionBar({ placement = "bottom", style, ...rest }: ActionBarProps) {
  // Android shadow: `elevation` comes from the same lg shadow token as the
  // iOS shadow props above and is applied via `style`, because Tamagui v3's
  // styled() typing accepts it in neither the static config nor this
  // component's props. It is composed as a style array under the caller's
  // style (React Native flattens arrays left to right), so unrelated caller
  // styles — including caller style arrays — preserve the shadow and an
  // explicit caller elevation wins.
  const composedStyle = [{ elevation: tokens.shadows.lg.elevation }, style];
  return <StyledActionBar placement={placement} style={composedStyle} {...rest} />;
}
