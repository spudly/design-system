import type { ReactNode } from "react";
import { YStack } from "tamagui";
import { LoadingScope, useLoadingScope } from "../contexts/LoadingScope.js";
import { Text } from "../widgets/Text.js";
import { TextSkeleton } from "../widgets/TextSkeleton.js";

export type CatalogHeaderProps = {
  /** The catalog's title, rendered as the list header's heading. */
  title: string;
  /** The header's controls (the CatalogFiltersBar). */
  children: ReactNode;
  /** Loading state (#278): the title renders as a text
   * skeleton at the heading variant's size (3xl), and the
   * children render inside a loading scope so a filters bar
   * child skeletonizes itself. An enclosing composite's
   * LoadingScope can also put the header into this state
   * without prop-drilling. */
  loading?: boolean;
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
export function CatalogHeader({ children, title, loading = false }: CatalogHeaderProps) {
  const showSkeleton = useLoadingScope(loading);
  return (
    <YStack paddingBlockStart="$4" paddingBlockEnd="$2" gap="$4">
      {showSkeleton ? (
        <TextSkeleton size="3xl" lines={1} />
      ) : (
        <Text variant="heading">{title}</Text>
      )}
      <LoadingScope active={showSkeleton}>{children}</LoadingScope>
    </YStack>
  );
}
