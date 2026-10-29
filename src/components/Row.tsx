import { XStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledRow = styled(XStack, {
  name: "Row",

  variants: {
    spacing: {
      none: { gap: 0 },
      sm: { gap: tokens.spacing[2] },
      md: { gap: tokens.spacing[4] },
    },
    align: {
      start: { alignItems: "flex-start" },
      center: { alignItems: "center" },
      end: { alignItems: "flex-end" },
      stretch: { alignItems: "stretch" },
    },
    spaceBefore: {
      none: { marginTop: 0 },
      sm: { marginTop: tokens.spacing[2] },
      md: { marginTop: tokens.spacing[4] },
    },
  } as const,

  defaultVariants: {
    spacing: "sm",
    align: "start",
    spaceBefore: "none",
  },
});

type StyledRowProps = GetProps<typeof StyledRow>;

export type RowProps = StyledRowProps & {
  /** Gap between the row's children: `sm` (the spacing scale's 8px step,
   * the default), `md` (16px), or `none`. */
  spacing?: "none" | "sm" | "md";
  /** Vertical alignment of the row's children. Defaults to `start`. */
  align?: "start" | "center" | "end" | "stretch";
  /** Space above the row, separating it from the content before it:
   * `sm` (8px), `md` (16px), or `none` (the default). */
  spaceBefore?: "none" | "sm" | "md";
};

/**
 * Horizontal layout row with token-driven gaps (#119): the layout
 * wrapper pages compose instead of rendering a Tamagui stack with
 * styling props of their own. All spacing is chosen through the
 * semantic `spacing` / `spaceBefore` steps and cross-axis alignment
 * through `align` — pages name the intent, this component owns the
 * style values.
 */
export function Row({ spacing = "sm", align = "start", spaceBefore = "none", ...rest }: RowProps) {
  return <StyledRow spacing={spacing} align={align} spaceBefore={spaceBefore} {...rest} />;
}
