import type { ReactNode } from "react";
import { YStack } from "tamagui";
import { Text } from "./Text.js";

export type CatalogHeaderProps = {
  /** The catalog's title, rendered as the list header's heading. */
  title: string;
  /** The header's controls (the CatalogFiltersBar). */
  children: ReactNode;
};

/**
 * A catalog list's header (#119): the catalog's title above its
 * filter bar, rendered as the list's header so the two scroll
 * with the items (the #188 catalog structure — BoundedList's
 * header slot). The header's vertical rhythm (its top/bottom
 * padding and the title-to-bar gap) is owned here; the title is
 * the page's copy and the bar is composed in as the child.
 * Extracted from DiscoverPage for the #119 page de-styling
 * program.
 */
export function CatalogHeader({ children, title }: CatalogHeaderProps) {
  return (
    <YStack paddingBlockStart="$4" paddingBlockEnd="$2" gap="$4">
      <Text variant="heading">{title}</Text>
      {children}
    </YStack>
  );
}
