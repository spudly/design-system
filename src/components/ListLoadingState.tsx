import { YStack } from "tamagui";
import { Spinner } from "./Spinner.js";

export type ListLoadingStateProps = {
  /** The spinner's accessible label. */
  label: string;
};

/**
 * A list's loading state (#119): a centered spinner dropped below
 * the list's header by the state's own top padding — the offset
 * RecipesPage's catalog established for this slot, carried as
 * padding (the parent-side mechanism) rather than a margin.
 * Extracted from the catalog pages for the #119 page de-styling
 * program, so every catalog renders its first-load the same way.
 */
export function ListLoadingState({ label }: ListLoadingStateProps) {
  return (
    <YStack paddingBlockStart="$8" alignItems="center">
      <Spinner label={label} />
    </YStack>
  );
}
