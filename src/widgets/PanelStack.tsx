import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledPanelStack = styled(YStack, {
  name: "PanelStack",

  padding: tokens.spacing[4],
  gap: tokens.spacing[4],
  alignItems: "stretch",
});

type StyledPanelStackProps = GetProps<typeof StyledPanelStack>;

export type PanelStackProps = Omit<StyledPanelStackProps, "padding" | "gap" | "alignItems">;

/**
 * A section panel's content column (#119): the padded stack a
 * detail page's sections render their blocks through — panel
 * inset and block separation are both spacing[4] (16px), owned by
 * the stack outright, so pages compose a panel by listing its
 * blocks (a hero, a stat band, action rows, a list) and never
 * space them by hand. Sibling of SectionStack (a page's sections
 * at 32px) and CardStack (a card list at 8px): each stack is
 * named for what it contains and owns its rhythm completely.
 */
export function PanelStack({ ...rest }: PanelStackProps) {
  return <StyledPanelStack {...rest} />;
}
