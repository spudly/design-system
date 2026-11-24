import type { ReactNode } from "react";
import { YStack } from "tamagui";
import { tokens } from "../../tokens/index.js";

export type CatalogListColumnProps = {
  /** The column's content (a filter header, then catalog rows). */
  children: ReactNode;
};

/**
 * The signed-in catalog's web column (#119): the standard page
 * inset (16px sides, 32px bottom) with NO gap — its rows are
 * CatalogRows, which carry their own 12px bottom separation,
 * so the column owns only the inset. The column owns its
 * geometry completely; call sites pass only the content.
 */
export function CatalogListColumn({ children }: CatalogListColumnProps) {
  return (
    <YStack paddingHorizontal={tokens.spacing[4]} paddingBottom={tokens.spacing[8]}>
      {children}
    </YStack>
  );
}
