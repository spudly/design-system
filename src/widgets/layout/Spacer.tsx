import { View } from "tamagui";

import { layoutSizeValues } from "../layout.js";
import type { LayoutSize } from "../layout.js";

export type SpacerProps = {
  /** Horizontal size, a t-shirt step of the spacing scale. */
  x?: LayoutSize;
  /** Vertical size, a t-shirt step of the spacing scale. */
  y?: LayoutSize;
};

/**
 * A fixed-size empty space (spudly/design-system#746, tranche 1).
 * Sibling spacing belongs to the parent's `gap` — that is the
 * highly preferred mechanism everywhere. Spacer exists only for
 * the rare case with a very good reason (preserving an existing
 * layout is NOT one), and every use carries a code comment at the
 * call site stating that reason.
 */
export function Spacer({ x, y }: SpacerProps) {
  return (
    <View
      aria-hidden
      flexShrink={0}
      width={x === undefined ? undefined : layoutSizeValues[x]}
      height={y === undefined ? undefined : layoutSizeValues[y]}
    />
  );
}
