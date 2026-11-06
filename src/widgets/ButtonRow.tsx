import { XStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledButtonRow = styled(XStack, {
  name: "ButtonRow",

  gap: tokens.spacing[3],
  flexWrap: "wrap",
  alignItems: "flex-start",
});

type StyledButtonRowProps = GetProps<typeof StyledButtonRow>;

export type ButtonRowProps = Omit<StyledButtonRowProps, "gap" | "alignItems" | "flexWrap">;

/**
 * A row of action buttons (#119): the button bar that follows
 * content — a detail page's primary actions, a card's footer
 * buttons. The component owns the bar's internal treatment: the
 * 12px gap between buttons and wrapping onto the next line at
 * narrow widths instead of overflowing. Separation from the
 * content that precedes the bar is owned by the parent — a
 * section stack's gap, a card's internal gap — never by the bar
 * itself: margin props are abolished in all cases, and a parent
 * that supplies no separation gets a flush bar, by design.
 * Call sites pass only the buttons: there are no spacing props,
 * by design — per-call-site spacing is how page layout drifts.
 */
export function ButtonRow({ ...rest }: ButtonRowProps) {
  return <StyledButtonRow {...rest} />;
}
