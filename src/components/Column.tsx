import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

/**
 * The layout scale steps Column shares with Row (#119): named
 * steps on the spacing scale — pages name a step, never a value.
 * The steps run none/sm/md/lg/xl/2xl = 0/8/12/16/24/32px (spacing
 * tokens 0/2/3/4/6/8). The tables are duplicated from Row's rather
 * than imported: each layout block stays self-contained, and the
 * two components' contract tests pin both to the same scale.
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

const StyledColumn = styled(YStack, {
  name: "Column",

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
  } as const,

  defaultVariants: {
    spacing: "sm",
    align: "start",
    spaceBefore: "none",
    spaceAfter: "none",
  },
});

type StyledColumnProps = GetProps<typeof StyledColumn>;

export type ColumnProps = StyledColumnProps & {
  /** Gap between the column's children, a step on the layout scale:
   * `sm` (8px, the default), `md` (12px), `lg` (16px), `xl` (24px),
   * `2xl` (32px), or `none`. */
  spacing?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  /** Horizontal alignment of the column's children. Defaults to
   * `start`. */
  align?: "start" | "center" | "end" | "stretch";
  /** Space above the column, separating it from the content before
   * it, on the layout scale. Defaults to `none`. */
  spaceBefore?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  /** Space below the column, separating it from the content after
   * it, on the layout scale. Defaults to `none`. */
  spaceAfter?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
};

/**
 * Vertical layout column with token-driven gaps (#119): the
 * vertical counterpart to Row — the layout wrapper pages compose
 * instead of rendering a Tamagui stack with styling props of their
 * own. All spacing is chosen through the semantic scale steps
 * (`spacing` / `spaceBefore` / `spaceAfter`, shared with Row) and
 * cross-axis alignment through `align` — pages name the intent,
 * this component owns the style values.
 */
export function Column({
  spacing = "sm",
  align = "start",
  spaceBefore = "none",
  spaceAfter = "none",
  ...rest
}: ColumnProps) {
  return (
    <StyledColumn
      spacing={spacing}
      align={align}
      spaceBefore={spaceBefore}
      spaceAfter={spaceAfter}
      {...rest}
    />
  );
}
