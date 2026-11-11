import type { ReactNode } from "react";
import { XStack, YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";
import { LoadingScope, useLoadingScope } from "../contexts/LoadingScope.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { StatCard } from "./StatCard.js";

const StyledStatRow = styled(XStack, {
  name: "StatRow",

  justifyContent: "space-around",
  backgroundColor: tokens.colors.gray.gray1,
  borderRadius: tokens.radii.lg,
  paddingVertical: tokens.spacing[4],
});

type StyledStatRowProps = GetProps<typeof StyledStatRow>;

export type StatRowProps = StyledStatRowProps & {
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
      <StyledStatRow
        {...rest}
        {...platformAccessibilityProps({ accessibilityState: { busy: true } })}
      >
        <LoadingScope active>
          {LOADING_STAT_KEYS.map((key) => (
            <YStack key={key} flex={1} paddingHorizontal={tokens.spacing[2]}>
              <StatCard value="" label="" />
            </YStack>
          ))}
        </LoadingScope>
      </StyledStatRow>
    );
  }
  return <StyledStatRow {...rest}>{children}</StyledStatRow>;
}
