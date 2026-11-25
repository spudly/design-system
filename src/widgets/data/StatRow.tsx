import type { ReactNode } from "react";
import { Row } from "../layout/Row.js";
import type { RowProps } from "../layout/Row.js";
import { tokens } from "../../tokens/index.js";
import { useLoadingScope } from "../../contexts/LoadingScope.js";
import { platformAccessibilityProps } from "../accessibility.js";
import { LoadingStatTiles } from "../feedback/LoadingStatTiles.js";

export type StatRowProps = RowProps & {
  children?: ReactNode;
  /** Loading state (#278): the row renders exactly 3 dummy
   * stats, each in its own loading state (propagated through
   * LoadingScope, the StatBand treatment) and each taking an
   * equal share of the row's width, in place of its children.
   * An enclosing composite's LoadingScope can also put the row
   * into this state without prop-drilling. */
  loading?: boolean;
};

// The loading row's dummy stats (#278): exactly 3 placeholder
// items, from a frozen module-level constant with stable keys —
// never generated per render. Their content is inert: a loading
// StatCard renders skeletons only.
const LOADING_STAT_KEYS = ["loading-1", "loading-2", "loading-3"] as const;

/**
 * Recessed band that spreads a row of StatCards across the width of a
 * screen section (a recipe's servings / prep / cook stats, a plan's
 * totals): gray step-1 fill, large radius, and space-around distribution
 * so each stat centers in its share of the band. Children are typically
 * StatCards; layout props (margins, gap) pass through to the band.
 */
export function StatRow({ children, loading = false, ...rest }: StatRowProps) {
  const showSkeleton = useLoadingScope(loading);
  if (showSkeleton) {
    // Loading (#278): the same recessed band, holding exactly 3
    // dummy stats — each skeletonized through the LoadingScope
    // this row provides, so no loading prop is drilled into
    // them — and the region marked busy.
    return (
      <Row
        around
        backgroundColor={tokens.colors.gray.gray1}
        borderRadius={tokens.radii.lg}
        py="l"
        {...rest}
        {...platformAccessibilityProps({ accessibilityState: { busy: true } })}
      >
        <LoadingStatTiles keys={LOADING_STAT_KEYS} />
      </Row>
    );
  }
  return (
    <Row
      around
      backgroundColor={tokens.colors.gray.gray1}
      borderRadius={tokens.radii.lg}
      py="l"
      {...rest}
    >
      {children}
    </Row>
  );
}
