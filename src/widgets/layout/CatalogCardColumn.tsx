import type { ReactNode } from "react";
import { YStack } from "tamagui";
import { tokens } from "../../tokens/index.js";

export type CatalogCardColumnProps = {
  /** The column's content (a catalog header, then bare cards). */
  children: ReactNode;
};

/**
 * The public catalog's web column (#119): the standard page
 * inset (16px sides, 32px bottom) with a 12px gap between its
 * children, for a card list whose cards carry no separation of
 * their own — the column owns the rhythm. The column owns its
 * geometry completely; call sites pass only the content.
 */
export function CatalogCardColumn({ children }: CatalogCardColumnProps) {
  return (
    <YStack
      paddingHorizontal={tokens.spacing[4]}
      paddingBottom={tokens.spacing[8]}
      gap={tokens.spacing[3]}
    >
      {children}
    </YStack>
  );
}
