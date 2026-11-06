import { View } from "tamagui";
import { tokens } from "../tokens/index.js";
import { SkeletonBone } from "./SkeletonClock.js";

export type TextSkeletonProps = {
  /** Number of text lines to stand in for (default 1). */
  lines?: number;
};

// Line widths are layout the component owns, not caller styling:
// full lines, then a shorter last line, the way real text wraps.
const LINE_WIDTHS: readonly `${number}%`[] = ["100%", "92%", "84%", "88%"];
const LAST_LINE_WIDTH: `${number}%` = "64%";
const LINE_HEIGHT = 12;

/**
 * A text-shaped skeleton (#278): one or more line bones with the
 * ragged right edge of real text. Every line pulses on the shared
 * SkeletonClock; the block is hidden from assistive tech (the
 * region it stands in for carries the busy state).
 */
export function TextSkeleton({ lines = 1 }: TextSkeletonProps) {
  // Non-finite counts fall back to a single line: NaN would render
  // zero bones and Infinity would throw in Array.from.
  const count = Number.isFinite(lines) ? Math.max(1, Math.floor(lines)) : 1;
  return (
    <View gap={tokens.spacing[2]} width="100%">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonBone
          key={index}
          width={
            index === count - 1 && count > 1
              ? LAST_LINE_WIDTH
              : (LINE_WIDTHS[index % LINE_WIDTHS.length] ?? "100%")
          }
          height={LINE_HEIGHT}
          borderRadius={tokens.radii.md}
        />
      ))}
    </View>
  );
}
