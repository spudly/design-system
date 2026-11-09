import { View } from "tamagui";
import { tokens } from "../tokens/index.js";
import { SkeletonBone } from "./SkeletonClock.js";

/** The text sizes a line can stand in for (the type scale's keys). */
export type TextSkeletonSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";

export type TextSkeletonProps = {
  /** Number of text lines to stand in for (default 1). */
  lines?: number;
  /** The size of the text the lines stand in for (default
   * "md"): each line occupies that size's line box, so the
   * skeleton keeps the vertical rhythm of the text it replaces. */
  size?: TextSkeletonSize;
};

// Line widths are layout the component owns, not caller styling:
// full lines, then a shorter last line, the way real text wraps.
const LINE_WIDTHS: readonly `${number}%`[] = ["100%", "92%", "84%", "88%"];
const LAST_LINE_WIDTH: `${number}%` = "64%";

// Each size's line box and bone: the box is the height one line
// of that text occupies as rendered — measured against the
// loaded components, it is the browser-normal line height for
// the DS font stack (about 1.15x the size; text set with a raw
// font size does not take the font config's 1.5 scale), and the
// bone centers in it, shorter than the box the way glyphs sit
// inside their line height. A bone in a flat, size-less box —
// or in the font scale's taller box — instead drifts off the
// text line and compresses or stretches the rhythm the loaded
// text keeps: the misalignment Stephen's overlay stories
// exposed on #551, verified by measuring both layers. Exported
// as the ONE source of truth for skeleton text geometry: the
// Button ghost-label bone and StatCard's per-run bones read
// their heights from this table rather than restating them.
export const LINE_BOXES: Record<TextSkeletonSize, { lineBox: number; bone: number }> = {
  xs: { lineBox: 14, bone: 10 },
  sm: { lineBox: 16, bone: 11 },
  md: { lineBox: 18, bone: 12 },
  lg: { lineBox: 21, bone: 14 },
  xl: { lineBox: 23, bone: 15 },
  "2xl": { lineBox: 27, bone: 18 },
  "3xl": { lineBox: 34, bone: 24 },
  "4xl": { lineBox: 41, bone: 28 },
};

/**
 * A text-shaped skeleton (#278): one or more line bones with the
 * ragged right edge of real text. A line stands in for a text
 * line AT A SIZE, occupying its line box with the bone centered
 * in the box, so stacked lines stack the way real lines of that
 * text do. Every line pulses on the shared SkeletonClock; the
 * block is hidden from assistive tech (the region it stands in
 * for carries the busy state).
 */
export function TextSkeleton({ lines = 1, size = "md" }: TextSkeletonProps) {
  // Non-finite counts fall back to a single line: NaN would render
  // zero bones and Infinity would throw in Array.from.
  const count = Number.isFinite(lines) ? Math.max(1, Math.floor(lines)) : 1;
  const { lineBox, bone } = LINE_BOXES[size];
  return (
    <View width="100%">
      {Array.from({ length: count }, (_, index) => (
        <View key={index} height={lineBox} justifyContent="center">
          <SkeletonBone
            width={
              index === count - 1 && count > 1
                ? LAST_LINE_WIDTH
                : (LINE_WIDTHS[index % LINE_WIDTHS.length] ?? "100%")
            }
            height={bone}
            borderRadius={tokens.radii.md}
          />
        </View>
      ))}
    </View>
  );
}
