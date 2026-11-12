import { Suspense, type ReactNode } from "react";
import { YStack } from "tamagui";
import { platformAccessibilityProps } from "../widgets/accessibility.js";
import { BoxSkeleton } from "../widgets/BoxSkeleton.js";
import { TextSkeleton } from "../widgets/TextSkeleton.js";
import { ChunkErrorBoundary } from "./ChunkErrorBoundary.js";

export type LazySlotProps = {
  children: ReactNode;
  /**
   * Recovery action for a failed chunk, forwarded to the boundary.
   * Omit it where the boundary's own default is right (a full page
   * reload on web); a native host whose shell needs a different
   * recovery supplies its own here.
   */
  onReload?: () => void;
};

/**
 * LazySlot (#438 Part 5): the internal slot a page renders
 * host-supplied lazy content through, so the host never touches
 * the loading machinery itself. The composition is the one
 * Memorize's app shell hand-rolled before this view existed
 * (memorize#54's shell, lifted into the boundary in #411):
 *
 * - `Suspense` covers a pending chunk with a skeleton
 *   fallback (#278): a neutral content-region skeleton — a
 *   large box bone, three text lines, and a second box bone
 *   filling the slot's width. The incoming chunk's shape is
 *   unknown at this level, so the fallback mirrors no
 *   particular layout; it only holds the region at a
 *   plausible content size, marked busy, while the chunk
 *   loads.
 * - The internal `ChunkErrorBoundary` covers a REJECTED chunk: its
 *   established fallback (an error Alert, "This section failed to
 *   load.", plus the "Reload the app" recovery where a recovery
 *   action exists) renders instead of unmounting the surface.
 *
 * Callers key the slot by the surface it shows (the frame page
 * keys it by the active tab), so switching surfaces clears a
 * failure and the other surfaces stay usable — the boundary's own
 * documented contract. React caches a rejected lazy result, so
 * recovery is the boundary's reload, never a remount retry.
 *
 * Placement: a view (#438 Part 2's category) — internal to this
 * package, NOT exported from the package root. Pages compose it;
 * hosts pass lazy components INTO pages (Stephen's ChunkErrorBoundary
 * ruling on #438) and the pages slot them through here.
 * (#438's final major removed the `ChunkErrorBoundary` root
 * export once both apps rendered through pages that use this
 * slot; the boundary is internal now.)
 */
export function LazySlot({ children, onReload }: LazySlotProps) {
  return (
    <ChunkErrorBoundary {...(onReload !== undefined ? { onReload } : null)}>
      <Suspense
        fallback={
          <YStack
            width="100%"
            gap="$3"
            padding="$4"
            {...platformAccessibilityProps({ accessibilityState: { busy: true } })}
          >
            <BoxSkeleton height={120} />
            <TextSkeleton lines={3} />
            <BoxSkeleton height={80} />
          </YStack>
        }
      >
        {children}
      </Suspense>
    </ChunkErrorBoundary>
  );
}
