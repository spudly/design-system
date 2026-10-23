import { Text as TamaguiText, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledVerseText = styled(TamaguiText, {
  name: "SpudlyVerseText",

  color: "$color",
  fontSize: tokens.typography.fontSize.lg,
  // The registered `verse` font: the family follows the app's brand
  // config — the base serif stack, or Alegreya under Quiet Dawn
  // (Memorize, #66) — never a family named here.
  fontFamily: "$verse",
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
  // Instance `fontFamily` prop carrying the BARE font name for the
  // same reason as in Text (#69): Tamagui only emits the
  // font-context class (`font_verse`) that defines `--f-family`
  // when a text component receives a registered font name in that
  // form; the styled() "$verse" declaration alone resolves to
  // `var(--f-family)` with nothing defining it, so verse text fell
  // back to the page's inherited family instead of the verse font.
  // A caller-passed `fontFamily` in `rest` still wins.
  return (
    <StyledVerseText fontFamily="verse" {...rest}>
      {children}
    </StyledVerseText>
  );
}
