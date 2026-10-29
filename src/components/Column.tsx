import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledColumn = styled(YStack, {
  name: "Column",

  variants: {
    variant: {
      // A page's section stack: the major blocks of a page in
      // order (title, meta, sections, actions). The role's gap is
      // the page rhythm — every section separation on the page is
      // this one value, identical by construction.
      sections: {
        gap: tokens.spacing[8],
        alignItems: "stretch",
      },
      // A content group inside a card: closely related rows and
      // blocks (a card's label/value rows with their lead and
      // follow-up lines) at the card-content rhythm.
      group: {
        gap: tokens.spacing[3],
        alignItems: "stretch",
      },
      // A list stack: rows of one list, each row carrying its own
      // internal padding, separated by the list rhythm.
      list: {
        gap: tokens.spacing[2],
        alignItems: "stretch",
      },
      // A state block: a page state shown in place of content (a
      // loading spinner, an empty notice), centered.
      state: {
        gap: tokens.spacing[2],
        alignItems: "center",
      },
    },
  } as const,
});

type StyledColumnProps = GetProps<typeof StyledColumn>;

export type ColumnProps = StyledColumnProps & {
  /** What the column IS — the role pins the column's gap and
   * alignment inside the component, so every section stack,
   * content group, list, and state block in the system is spaced
   * identically: `sections` (a page's major blocks), `group`
   * (related content inside a card), `list` (rows of one list),
   * or `state` (a centered page-state block). */
  variant: "sections" | "group" | "list" | "state";
};

/**
 * Vertical layout column (#119): Row's vertical counterpart —
 * the layout wrapper pages compose instead of rendering a
 * Tamagui stack with styling props of their own. A Column takes
 * ONE semantic prop — its `variant`, the role the column plays —
 * and the role owns every style value (gap and alignment).
 * Call sites never pass spacing, and there are no per-block
 * margin props: separation between blocks is the parent stack's
 * role gap, so blocks wrapped in margin columns are not a shape
 * this API offers.
 */
export function Column({ variant, ...rest }: ColumnProps) {
  return <StyledColumn variant={variant} {...rest} />;
}
