import { Separator as TamaguiSeparator, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledSeparator = styled(TamaguiSeparator, {
  name: "SpudlyDivider",

  borderColor: tokens.colors.gray.gray3,
});

type StyledSeparatorProps = GetProps<typeof StyledSeparator>;

export interface DividerProps extends StyledSeparatorProps {
  vertical?: boolean;
}

/**
 * Hairline divider for separating list rows and content sections.
 * Pass `vertical` for a vertical rule.
 */
export function Divider({ vertical = false, ...rest }: DividerProps) {
  return <StyledSeparator vertical={vertical} {...rest} />;
}
