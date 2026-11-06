import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledSectionStack = styled(YStack, {
  name: "SectionStack",

  gap: tokens.spacing[8],
  alignItems: "stretch",
});

type StyledSectionStackProps = GetProps<typeof StyledSectionStack>;

export type SectionStackProps = Omit<StyledSectionStackProps, "gap" | "alignItems">;

/**
 * A stack of a page's sections (#119): the page's major blocks
 * in order (title, meta lines, section cards, action bars),
 * separated by the 32px page rhythm. Because the stack owns the
 * gap, every section separation on the page is the same value by
 * construction — blocks never wrap themselves in margin columns
 * to set their own separation. Call sites pass only the blocks:
 * there are no spacing props, by design.
 */
export function SectionStack({ ...rest }: SectionStackProps) {
  return <StyledSectionStack {...rest} />;
}
