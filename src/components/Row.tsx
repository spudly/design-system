import { XStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

/**
 * The layout scale steps Row and Column share (#119): named steps
 * on the spacing scale — pages name a step, never a value. The
 * steps run none/sm/md/lg/xl/2xl = 0/8/12/16/24/32px (spacing
 * tokens 0/2/3/4/6/8).
 */
const spacingSteps = {
  none: { gap: 0 },
  sm: { gap: tokens.spacing[2] },
  md: { gap: tokens.spacing[3] },
  lg: { gap: tokens.spacing[4] },
  xl: { gap: tokens.spacing[6] },
  "2xl": { gap: tokens.spacing[8] },
} as const;

const spaceBeforeSteps = {
  none: { marginTop: 0 },
  sm: { marginTop: tokens.spacing[2] },
  md: { marginTop: tokens.spacing[3] },
  lg: { marginTop: tokens.spacing[4] },
  xl: { marginTop: tokens.spacing[6] },
  "2xl": { marginTop: tokens.spacing[8] },
} as const;

const spaceAfterSteps = {
  none: { marginBottom: 0 },
  sm: { marginBottom: tokens.spacing[2] },
  md: { marginBottom: tokens.spacing[3] },
  lg: { marginBottom: tokens.spacing[4] },
  xl: { marginBottom: tokens.spacing[6] },
  "2xl": { marginBottom: tokens.spacing[8] },
} as const;

const StyledRow = styled(XStack, {
  name: "Row",

  variants: {
    spacing: spacingSteps,
    align: {
      start: { alignItems: "flex-start" },
      center: { alignItems: "center" },
      end: { alignItems: "flex-end" },
      stretch: { alignItems: "stretch" },
    },
    spaceBefore: spaceBeforeSteps,
    spaceAfter: spaceAfterSteps,
    wrap: {
      true: { flexWrap: "wrap" },
    },
  } as const,

  defaultVariants: {
    spacing: "sm",
    align: "start",
    spaceBefore: "none",
    spaceAfter: "none",
  },
});

type StyledRowProps = GetProps<typeof StyledRow>;

export type RowProps = StyledRowProps & {
  /** Gap between the row's children, a step on the layout scale:
   * `sm` (8px, the default), `md` (12px), `lg` (16px), `xl` (24px),
   * `2xl` (32px), or `none`. */
  spacing?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  /** Vertical alignment of the row's children. Defaults to `start`. */
  align?: "start" | "center" | "end" | "stretch";
  /** Space above the row, separating it from the content before it,
   * on the layout scale. Defaults to `none`. */
  spaceBefore?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  /** Space below the row, separating it from the content after it,
   * on the layout scale. Defaults to `none`. */
  spaceAfter?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  /** Let the row's children wrap onto the next line when they run
   * out of width (an action row on a narrow screen). */
  wrap?: boolean;
};

/**
 * Horizontal layout row with token-driven gaps (#119): the layout
 * wrapper pages compose instead of rendering a Tamagui stack with
 * styling props of their own. All spacing is chosen through the
 * semantic scale steps (`spacing` / `spaceBefore` / `spaceAfter`,
 * shared with Column) and cross-axis alignment through `align` —
 * pages name the intent, this component owns the style values.
 */
export function Row({
  spacing = "sm",
  align = "start",
  spaceBefore = "none",
  spaceAfter = "none",
  wrap,
  ...rest
}: RowProps) {
  return (
    <StyledRow
      spacing={spacing}
      align={align}
      spaceBefore={spaceBefore}
      spaceAfter={spaceAfter}
      {...(wrap ? { wrap } : {})}
      {...rest}
    />
  );
}
