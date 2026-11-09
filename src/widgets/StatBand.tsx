import type { ReactNode } from "react";
import { XStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { LoadingScope, useLoadingScope } from "./LoadingScope.js";
import { StatCard } from "./StatCard.js";

export type StatBandProps = {
  /** The band's stats — StatCards, composed by the caller. */
  children: ReactNode;
  /** Loading state (#278): the band renders exactly 3 dummy
   * stats, each in its own loading state (propagated through
   * LoadingScope), in place of its children. An enclosing
   * composite's LoadingScope can also put the band into this
   * state without prop-drilling. */
  loading?: boolean;
};

// The loading band's dummy stats (#278): exactly 3 placeholder
// items, from a frozen module-level constant with stable keys —
// never generated per render. Their content is inert: a loading
// StatCard renders skeletons only.
const LOADING_STAT_KEYS = ["loading-1", "loading-2", "loading-3"] as const;

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
export function StatBand({ children, loading = false }: StatBandProps) {
  const showSkeleton = useLoadingScope(loading);
  if (showSkeleton) {
    // Loading (#278): the same recessed band, holding exactly 3
    // dummy stats — each skeletonized through the LoadingScope
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
          {LOADING_STAT_KEYS.map((key) => (
            <StatCard key={key} value="" label="" />
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
