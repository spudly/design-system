import { View } from "tamagui";

export type ScrollSentinelProps = {
  /**
   * The ref the caller's observer logic reads the sentinel's
   * DOM node through. Typed loosely (a mutable current slot):
   * the sentinel is a plain 1px marker, and the caller owns the
   * node-shape it expects.
   */
  sentinelRef: { current: unknown };
};

/**
 * A scroll sentinel (#119): the 1px marker a paginated web
 * list renders at its end so an IntersectionObserver (or the
 * caller's near-bottom fallback) can request the next page as
 * it approaches. The marker owns its geometry and its testID;
 * the observation logic stays with the caller, which reads
 * the node through `sentinelRef`.
 */
export function ScrollSentinel({ sentinelRef }: ScrollSentinelProps) {
  return <View ref={sentinelRef as never} style={{ height: 1 }} testID="catalog-scroll-sentinel" />;
}
