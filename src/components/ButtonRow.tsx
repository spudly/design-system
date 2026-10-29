import { XStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledButtonRow = styled(XStack, {
  name: "ButtonRow",

  gap: tokens.spacing[3],
  flexWrap: "wrap",
  alignItems: "flex-start",
  marginTop: tokens.spacing[2],
});

type StyledButtonRowProps = GetProps<typeof StyledButtonRow>;

export type ButtonRowProps = Omit<
  StyledButtonRowProps,
  "gap" | "alignItems" | "flexWrap" | "marginTop"
>;

/**
 * A row of action buttons (#119): the button bar that follows
 * content — a detail page's primary actions, a card's footer
 * buttons. The component owns the bar's whole treatment: the
 * 12px gap between buttons, wrapping onto the next line at
 * narrow widths instead of overflowing, and the standard 8px
 * separation from the content it follows (its parents — bare
 * cards, section stacks — do not supply that separation
 * uniformly, so the bar carries it as part of what a button row
 * is). Call sites pass only the buttons: there are no spacing
 * props, by design — per-call-site spacing is how page layout
 * drifts.
 */
export function ButtonRow({ ...rest }: ButtonRowProps) {
  return <StyledButtonRow {...rest} />;
}
