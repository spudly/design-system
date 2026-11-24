import { YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../../tokens/index.js";

const StyledSkeletonPanel = styled(YStack, {
  name: "SkeletonPanel",

  width: "100%",
  gap: tokens.spacing[3],
  padding: tokens.spacing[4],
});

type StyledSkeletonPanelProps = GetProps<typeof StyledSkeletonPanel>;

export type SkeletonPanelProps = Omit<StyledSkeletonPanelProps, "width" | "gap" | "padding">;

/**
 * A skeleton panel (#698 tranche 4): the padded, full-width
 * column a loading fallback's bones sit in — a large box
 * bone, text lines, a second box bone — at the 12px rhythm
 * with the 16px panel inset. Call sites pass only the
 * bones (and the busy marker): there are no spacing
 * props, by design.
 */
export function SkeletonPanel({ ...rest }: SkeletonPanelProps) {
  return <StyledSkeletonPanel {...rest} />;
}
