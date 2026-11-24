import type { ReactNode } from "react";
import { ScrollView, YStack } from "tamagui";
import { tokens } from "../../tokens/index.js";

export type FramedScrollRegionProps = {
  /**
   * Loading state (#278): the frame's border turns
   * transparent — no visible hairline around the skeleton
   * rows the region renders while loading.
   */
  loading?: boolean;
  children: ReactNode;
};

/**
 * A bounded scroll region in a bordered frame (#698
 * tranche 3): the scrollable list a picker frames with a
 * hairline border and the extra-large radius, capped at
 * 256px tall — beyond that the list scrolls inside its
 * frame instead of growing the view. The frame and the
 * cap live here so views compose the region without
 * rendering a layout primitive or a raw ScrollView.
 */
export function FramedScrollRegion({ loading = false, children }: FramedScrollRegionProps) {
  return (
    <YStack
      borderWidth={1}
      borderColor={loading ? "transparent" : tokens.colors.gray.gray3}
      borderRadius={tokens.radii.xl}
      maxHeight={256}
      overflow="hidden"
    >
      <ScrollView>{children}</ScrollView>
    </YStack>
  );
}
