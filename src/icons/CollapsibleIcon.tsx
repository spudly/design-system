import { YStack } from "tamagui";
import { Icon, type IconComponentProps, type IconElement } from "./Icon.js";

/**
 * The official Feather chevron-right element data (feathericons/feather,
 * MIT licensed) — copied from the Feather SVG source, not redrawn.
 */
const chevronRightElements: IconElement[] = [{ kind: "polyline", points: "9 18 15 12 9 6" }];

export type CollapsibleIconProps = IconComponentProps & {
  /** Whether the disclosure this icon marks is currently expanded. */
  isOpen: boolean;
};

/**
 * The disclosure indicator for collapsible content: ONE chevron-right
 * glyph that rotates 90° to point down while open (Stephen,
 * spudly/design-system#455 — a single icon rotating between states,
 * never a switch between two glyphs; this supersedes the #250
 * CollapsedIcon/ExpandedIcon composition for this indicator). The
 * rotation runs on the DS "fast" transition (Tamagui v3's
 * `transition` prop — the `animation` prop compiles to a 0s
 * keyframe reference on web and never animates, #457), matching
 * the Collapsible height transition it accompanies.
 */
export function CollapsibleIcon({ isOpen, ...props }: CollapsibleIconProps) {
  return (
    <YStack transition="fast" rotate={isOpen ? "90deg" : "0deg"}>
      <Icon elements={chevronRightElements} {...props} />
    </YStack>
  );
}
