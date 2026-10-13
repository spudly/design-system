import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledOuter = styled(YStack, {
  name: "SpudlyFormScreenLayout",

  width: "100%",
  alignItems: "center",
  paddingHorizontal: tokens.spacing[4],
  paddingVertical: tokens.spacing[8],
});

const StyledInner = styled(YStack, {
  name: "SpudlyFormScreenLayoutInner",

  width: "100%",
  maxWidth: 480,
  gap: tokens.spacing[4],
});

type StyledOuterProps = GetProps<typeof StyledOuter>;

export type FormScreenLayoutProps = StyledOuterProps;

/**
 * Centered narrow column for forms and auth screens: content is capped at
 * 480px wide and centered horizontally, with comfortable vertical padding.
 */
export function FormScreenLayout({ children, ...rest }: FormScreenLayoutProps) {
  return (
    <StyledOuter {...rest}>
      <StyledInner>{children}</StyledInner>
    </StyledOuter>
  );
}
