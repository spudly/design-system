import { ScrollView, YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledContent = styled(YStack, {
  name: "SpudlyScreenContainer",

  flex: 1,
  paddingHorizontal: tokens.spacing[4],
  paddingVertical: tokens.spacing[4],
  gap: tokens.spacing[4],
});

type StyledContentProps = GetProps<typeof StyledContent>;

export interface ScreenContainerProps extends StyledContentProps {
  /** Wrap content in a scroll view. Defaults to true. */
  scrollable?: boolean;
}

/**
 * Page scaffold: full-height container with horizontal page padding and
 * consistent vertical spacing between sections. Scrollable by default;
 * pass `scrollable={false}` for fixed-height screens.
 */
export function ScreenContainer({ scrollable = true, children, ...rest }: ScreenContainerProps) {
  const content = <StyledContent {...rest}>{children}</StyledContent>;
  if (!scrollable) {
    return content;
  }
  return <ScrollView>{content}</ScrollView>;
}
