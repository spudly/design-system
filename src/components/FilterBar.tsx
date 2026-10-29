import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledFilterBar = styled(YStack, {
  name: "FilterBar",

  gap: tokens.spacing[3],
  alignItems: "stretch",
  paddingBlockStart: tokens.spacing[4],
  paddingBlockEnd: tokens.spacing[2],
});

type StyledFilterBarProps = GetProps<typeof StyledFilterBar>;

export type FilterBarProps = Omit<
  StyledFilterBarProps,
  "gap" | "alignItems" | "paddingBlockStart" | "paddingBlockEnd"
>;

/**
 * The filter bar that heads a list (#119): a search row, a
 * filter chooser, and the added filters' controls, stacked at
 * the 12px field rhythm. The bar owns its own inset — 16px
 * above, 8px below — because it renders as a list's header
 * (inside the list's content container, which already supplies
 * the horizontal page inset): the top inset sets it off from
 * the shell's edge and the bottom one is its separation from
 * the first row. Call sites pass only the bar's rows: there
 * are no spacing props, by design.
 */
export function FilterBar({ ...rest }: FilterBarProps) {
  return <StyledFilterBar {...rest} />;
}
