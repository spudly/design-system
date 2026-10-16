import { Text as TamaguiText, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledVerseText = styled(TamaguiText, {
  name: "SpudlyVerseText",

  color: "$color",
  fontSize: tokens.typography.fontSize.lg,
  fontFamily: tokens.typography.fontFamily.serif,
});

type StyledVerseTextProps = GetProps<typeof StyledVerseText>;

export type VerseTextProps = StyledVerseTextProps;

/**
 * Scripture / long-form reading block: serif, large, comfortable for
 * extended reading. A thin semantic wrapper over Text's `verse` styling
 * that makes drill and reading text a distinct component. Accepts inline
 * interactive children such as `BlankWord`.
 */
export function VerseText({ children, ...rest }: VerseTextProps) {
  return <StyledVerseText {...rest}>{children}</StyledVerseText>;
}
