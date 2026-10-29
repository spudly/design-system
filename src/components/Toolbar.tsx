import { XStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledToolbar = styled(XStack, {
  name: "Toolbar",

  flexWrap: "wrap",
  alignItems: "center",
  gap: tokens.spacing[2],
  borderBottomWidth: 1,
  borderBottomColor: tokens.colors.gray.gray2,
  paddingHorizontal: tokens.spacing[4],
  paddingVertical: tokens.spacing[3],
});

type StyledToolbarProps = GetProps<typeof StyledToolbar>;

export type ToolbarProps = Omit<
  StyledToolbarProps,
  | "flexWrap"
  | "alignItems"
  | "gap"
  | "borderBottomWidth"
  | "borderBottomColor"
  | "paddingHorizontal"
  | "paddingVertical"
>;

/**
 * A screen's pinned toolbar (#119): the hairline-divided bar a
 * fixed-shell page (ScreenShell) renders above its scroll
 * region — status and context items at their natural size, a
 * growing field (SelectField's `grow`) taking the remaining
 * width, items wrapping onto a second line when the bar
 * narrows. The bar owns its inset, gap, and divider outright;
 * its contents are caller-supplied.
 */
export function Toolbar({ ...rest }: ToolbarProps) {
  return <StyledToolbar {...rest} />;
}
