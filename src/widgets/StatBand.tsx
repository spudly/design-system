import type { ReactNode } from "react";
import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { LoadingScope, useLoadingScope } from "../contexts/LoadingScope.js";
import { StatCard } from "./StatCard.js";

export type StatBandProps = {
  /** The band's stats — StatCards, composed by the caller. */
  children: ReactNode;
  /** Loading state (#278): the band renders dummy stats
   * (3 by default; see `loadingCount`), each in its own
   * loading state (propagated through
   * LoadingScope) and each taking an equal share of the band's
   * width — a skeleton tile has no text to size it, so without
   * the equal share the boxes collapse narrow and empty
   * (Stephen on #551). In place of its children. An enclosing
   * composite's LoadingScope can also put the band into this
   * state without prop-drilling. */
  loading?: boolean;
  /** How many dummy stats the loading band renders. Defaults
   * to 3 — the program-wide dummy-item convention (#278). A
   * composite whose loaded stat count is conditional (e.g.
   * RecipeOverviewPanel, where the prep/cook cards exist only
   * when their labels do) passes its real count so the skeleton
   * mirrors the loaded composition instead of always showing 3. */
  loadingCount?: number;
};

// The loading band's dummy stats (#278): placeholder items
// from a frozen module-level constant with stable keys —
// never generated per render. Their content is inert: a loading
// StatCard renders skeletons only.
const LOADING_STAT_KEYS = [
  "loading-1",
  "loading-2",
  "loading-3",
  "loading-4",
  "loading-5",
  "loading-6",
] as const;

/**
 * The stat band on a detail page: a recessed gray band that spreads
 * its stats (StatCards) evenly across the page width — the
 * servings/prep/cook band RecipeDetailPage and PublicRecipePage each
 * hand-styled as a gray rounded row. Extracted as a shared
 * component for the #119 page de-styling program: the band owns its
 * fill, radius, vertical padding, and the space-around spread; the
 * caller supplies the stats themselves, so the band serves any
 * app's detail pages. The band carries no outer spacing —
 * separation from the sections around it is the parent stack's.
 */
export function StatBand({ children, loading = false, loadingCount = 3 }: StatBandProps) {
  const showSkeleton = useLoadingScope(loading);
  if (showSkeleton) {
    const dummyKeys = LOADING_STAT_KEYS.slice(0, Math.max(1, loadingCount));
    // Loading (#278): the same recessed band, holding
    // `loadingCount` dummy stats (3 by default) — each
    // skeletonized through the LoadingScope
    // this band provides, so no loading prop is drilled into
    // them — and the region marked busy.
    return (
      <XStack
        backgroundColor={tokens.colors.gray.gray1}
        borderRadius={tokens.radii.lg}
        paddingVertical="$4"
        justifyContent="space-around"
        {...platformAccessibilityProps({ accessibilityState: { busy: true } })}
      >
        <LoadingScope active>
          {dummyKeys.map((key) => (
            <YStack key={key} flex={1} paddingHorizontal={tokens.spacing[2]}>
              <StatCard value="" label="" />
            </YStack>
          ))}
        </LoadingScope>
      </XStack>
    );
  }
  return (
    <XStack
      backgroundColor={tokens.colors.gray.gray1}
      borderRadius={tokens.radii.lg}
      paddingVertical="$4"
      justifyContent="space-around"
    >
      {children}
    </XStack>
  );
}
