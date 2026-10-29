import type { ReactNode } from "react";
import { XStack } from "tamagui";

export type CardGridProps = {
  /** The grid's cards, in display order. */
  children: ReactNode;
};

/**
 * A wrapping card grid (#119): a row of cards that wraps onto
 * further rows as the width runs out, the gap between cards
 * owned here. The cards size themselves (FeatureCard carries its
 * own flex and wrap basis); the grid is only the wrap and the
 * separation. Extracted from LandingPage for the #119 page
 * de-styling program.
 */
export function CardGrid({ children }: CardGridProps) {
  return (
    <XStack flexWrap="wrap" gap="$3">
      {children}
    </XStack>
  );
}
