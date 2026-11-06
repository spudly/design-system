import type { ReactNode } from "react";
import { XStack } from "tamagui";
import { tokens } from "../tokens/index.js";

export type StatBandProps = {
  /** The band's stats — StatCards, composed by the caller. */
  children: ReactNode;
};

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
export function StatBand({ children }: StatBandProps) {
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
