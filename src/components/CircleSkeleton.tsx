import { tokens } from "../tokens/index.js";
import { SkeletonBone } from "./SkeletonClock.js";

export type CircleSkeletonProps = {
  /** Diameter in density-independent units (default 40, the Avatar default). */
  size?: number;
};

/**
 * A circular skeleton bone (#278) — avatar and icon placeholders.
 * Pulses on the shared SkeletonClock; hidden from assistive tech
 * (the region it stands in for carries the busy state).
 */
export function CircleSkeleton({ size = 40 }: CircleSkeletonProps) {
  return <SkeletonBone width={size} height={size} borderRadius={tokens.radii.full} />;
}
