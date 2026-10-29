import { XStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledRow = styled(XStack, {
  name: "Row",

  variants: {
    variant: {
      // An action bar: the button row that follows content — a
      // detail page's primary actions, a card's footer buttons.
      // The role owns the bar's whole treatment: the gap between
      // actions, wrapping onto the next line at narrow widths,
      // and the standard separation from the content it follows
      // (its parents — bare cards and section stacks — do not
      // supply that separation uniformly, so the bar carries it).
      actions: {
        gap: tokens.spacing[3],
        flexWrap: "wrap",
        alignItems: "flex-start",
        marginTop: tokens.spacing[2],
      },
      // An inline group: controls composed on one line inside
      // content — a field with its submit button — vertically
      // centered on each other.
      inline: {
        gap: tokens.spacing[2],
        alignItems: "center",
      },
    },
  } as const,
});

type StyledRowProps = GetProps<typeof StyledRow>;

export type RowProps = Omit<StyledRowProps, "gap" | "alignItems" | "flexWrap" | "marginTop"> & {
  /** What the row IS — the role pins the row's gap, alignment,
   * and wrapping inside the component, so every action bar and
   * every inline group in the system is spaced identically:
   * `actions` (a button row following content) or `inline`
   * (controls composed on one line within content). The
   * role-owned style keys are omitted from the public type:
   * they cannot be passed at a call site. */
  variant: "actions" | "inline";
};

/**
 * Horizontal layout row (#119): the layout wrapper pages compose
 * instead of rendering a Tamagui stack with styling props of
 * their own. A Row takes ONE semantic prop — its `variant`, the
 * role the row plays — and the role owns every style value (gap,
 * alignment, wrap, and for `actions` the separation from the
 * content above). Call sites never pass spacing: named scale
 * steps at call sites are how page spacing drifts, which is the
 * inconsistency #119 exists to remove.
 */
export function Row({ variant, ...rest }: RowProps) {
  return <StyledRow variant={variant} {...rest} />;
}
