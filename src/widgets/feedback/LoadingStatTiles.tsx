import { YStack } from "tamagui";
import { tokens } from "../../tokens/index.js";
import { LoadingScope } from "../../contexts/LoadingScope.js";
import { StatCard } from "../data/StatCard.js";

export type LoadingStatTilesProps = {
  /** Stable keys for the dummy stats, one per tile — the caller
   * owns the count and the key scheme (StatRow's fixed 3,
   * StatBand's `loading-<n>` from its loadingCount). */
  keys: readonly string[];
};

/**
 * The loading dummy-stat tiles shared by the stat bands
 * (StatBand, StatRow): each key renders one inert StatCard —
 * a loading StatCard renders skeletons only — in an equal-share
 * cell, all skeletonized through the LoadingScope this component
 * provides so no loading prop is drilled into the cards.
 * Extracted for #587 phase 2 — both bands carried an identical
 * copy of this rendering.
 */
export function LoadingStatTiles({ keys }: LoadingStatTilesProps) {
  return (
    <LoadingScope active>
      {keys.map((key) => (
        <YStack key={key} flex={1} paddingHorizontal={tokens.spacing[2]}>
          <StatCard value="" label="" />
        </YStack>
      ))}
    </LoadingScope>
  );
}
