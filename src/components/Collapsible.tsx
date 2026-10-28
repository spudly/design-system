import { useState, type ReactNode } from "react";
import { View, YStack, isWeb } from "tamagui";

// `inert` reaches the DOM through Tamagui's web renderer (which
// forwards props it does not map — see accessibility.ts), but
// Tamagui's View prop types do not declare it yet, so it travels as
// a pre-built spread object, the platform-split pattern
// accessibility.ts uses for `groupRoleProps`. Native has no Tab
// sequence for closed content to leave, so it gets an empty spread.
const inertPropsWhenClosed = (isOpen: boolean) =>
  isWeb && !isOpen ? ({ inert: true } as const) : ({} as const);

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
 * Accessibility: closed content is aria-hidden AND inert — a
 * collapsed region must leave the accessibility tree along with the
 * visual one, and aria-hidden alone does not remove focusable
 * descendants (a button or link in the content) from the web Tab
 * sequence; inert does, including while the collapse animation runs.
 * Inert is web-only by construction (see inertPropsWhenClosed).
 */
export function Collapsible({ isOpen = false, children }: CollapsibleProps) {
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  return (
    <YStack overflow="hidden" animation="fast" height={isOpen ? (contentHeight ?? undefined) : 0}>
      <View
        aria-hidden={!isOpen}
        {...inertPropsWhenClosed(isOpen)}
        onLayout={(event) => {
          setContentHeight(event.nativeEvent.layout.height);
        }}
      >
        {children}
      </View>
    </YStack>
  );
}
