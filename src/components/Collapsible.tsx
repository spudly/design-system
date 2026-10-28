import { useState, type ReactNode } from "react";
import { View, YStack } from "tamagui";

export type CollapsibleProps = {
  /**
   * Whether the content is expanded. The frame's height animates
   * between 0 (closed) and the content's natural height (open)
   * whenever this changes. Defaults to false.
   */
  isOpen?: boolean;
  children?: ReactNode;
};

/**
 * Animated expand/collapse container (spudly/design-system#178,
 * adopting the shuoink/ui Collapsible with the old component as spec,
 * re-implemented in DS conventions).
 *
 * The content is measured through the inner wrapper's onLayout:
 * children lay out at their natural height inside the clipped frame
 * in both states, so the measured height is the true content height
 * and later toggles animate between real numbers. While closed (or
 * animating) the frame clips with overflow hidden; content that
 * mounts already open renders at its natural height with no
 * animation, then joins the animated contract once measured. The
 * animation is the shared "fast" spring from the Tamagui config —
 * the same driver every DS config installs.
 *
 * Accessibility: closed content is aria-hidden — a collapsed region
 * must leave the accessibility tree along with the visual one.
 */
export function Collapsible({ isOpen = false, children }: CollapsibleProps) {
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  return (
    <YStack overflow="hidden" animation="fast" height={isOpen ? (contentHeight ?? undefined) : 0}>
      <View
        aria-hidden={!isOpen}
        onLayout={(event) => {
          setContentHeight(event.nativeEvent.layout.height);
        }}
      >
        {children}
      </View>
    </YStack>
  );
}
