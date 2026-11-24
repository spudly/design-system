import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../../tokens/index.js";

const StyledHeroStack = styled(YStack, {
  name: "HeroStack",

  alignItems: "center",
  gap: tokens.spacing[3],
  paddingTop: tokens.spacing[6],
});

type StyledHeroStackProps = GetProps<typeof StyledHeroStack>;

export type HeroStackProps = Omit<StyledHeroStackProps, "alignItems" | "gap" | "paddingTop">;

/**
 * A page hero's stack (#119): a heading and its subtitle,
 * centered, separated by the 12px rhythm, with the 24px top
 * breathing room a hero opens a page with. Call sites pass
 * only the hero's texts: there are no spacing props, by
 * design — the stack owns the geometry so every hero in the
 * system is spaced identically.
 */
export function HeroStack({ ...rest }: HeroStackProps) {
  return <StyledHeroStack {...rest} />;
}
