import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../../tokens/index.js";

const StyledContentStack = styled(YStack, {
  name: "ContentStack",

  gap: tokens.spacing[3],
  alignItems: "stretch",
});

type StyledContentStackProps = GetProps<typeof StyledContentStack>;

export type ContentStackProps = Omit<StyledContentStackProps, "gap" | "alignItems">;

/**
 * A stack of a view's content blocks (#698 tranche 3): the
 * blocks of a composed view or card (a heading, a list, a
 * composer, an action) in order, separated by the 12px
 * content rhythm, children stretched. Sibling of FormStack
 * (a form's fields at the same rhythm): this is the
 * non-form content stack, so views compose their blocks
 * without rendering a layout primitive. Call sites pass
 * only the blocks: there are no spacing props, by design.
 */
export function ContentStack({ ...rest }: ContentStackProps) {
  return <StyledContentStack {...rest} />;
}
