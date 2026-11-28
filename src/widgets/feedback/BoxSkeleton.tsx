import { tokens } from "../../tokens/index.js";

import { SkeletonBone } from "./SkeletonClock.js";

export type BoxSkeletonProps = {
  /** Bone width in density-independent units; omit to fill the parent (100%). */
  width?: number | `${number}%`;
  /** Bone height in density-independent units (default 120).
   * Ignored when `aspectRatio` is set. */
  height?: number;
  /** Aspect ratio (width / height) the bone holds instead of a
   * fixed height — for bones standing in for aspect-shaped media
   * (Thumbnail's hero frame, #721). */
  aspectRatio?: number;
};

/**
 * A rectangular skeleton bone (#278) — media blocks, cards, chart
 * areas, image placeholders. Pulses on the shared SkeletonClock;
 * hidden from assistive tech (the region it stands in for carries
 * the busy state). Geometry is semantic (width/height numbers);
 * the corner radius is the design system's card radius, not a
 * styling prop.
 */
export function BoxSkeleton({ width = "100%", height = 120, aspectRatio }: BoxSkeletonProps) {
  return (
    <SkeletonBone
      width={width}
      {...(aspectRatio === undefined ? { height } : { aspectRatio })}
      borderRadius={tokens.radii.md}
    />
  );
}
