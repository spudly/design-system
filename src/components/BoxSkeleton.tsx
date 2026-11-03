import { tokens } from "../tokens/index.js";
import { SkeletonBone } from "./SkeletonClock.js";

export type BoxSkeletonProps = {
  /** Bone width in density-independent units; omit to fill the parent (100%). */
  width?: number | `${number}%`;
  /** Bone height in density-independent units (default 120). */
  height?: number;
};

/**
 * A rectangular skeleton bone (#278) — media blocks, cards, chart
 * areas, image placeholders. Pulses on the shared SkeletonClock;
 * hidden from assistive tech (the region it stands in for carries
 * the busy state). Geometry is semantic (width/height numbers);
 * the corner radius is the design system's card radius, not a
 * styling prop.
 */
export function BoxSkeleton({ width = "100%", height = 120 }: BoxSkeletonProps) {
  return <SkeletonBone width={width} height={height} borderRadius={tokens.radii.md} />;
}
