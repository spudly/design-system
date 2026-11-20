import type { ReactNode } from "react";
import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";

export type CatalogRowProps = {
  /** The row's content (a heading, a card, a filter bar). */
  children: ReactNode;
};

/**
 * One catalog row's separation (#119): the 12px bottom space
 * every row of the catalog lists carries under itself — the
 * rhythm the sections' headings, cards, and filter header all
 * share on the web column, where the column itself adds no gap.
 * The row owns its separation; call sites pass only the row's
 * content.
 */
export function CatalogRow({ children }: CatalogRowProps) {
  return <YStack paddingBlockEnd={tokens.spacing[3]}>{children}</YStack>;
}
