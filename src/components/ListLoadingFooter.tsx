import { YStack } from "tamagui";
import { Spinner } from "./Spinner.js";

export type ListLoadingFooterProps = {
  /** The spinner's accessible label. */
  label: string;
};

/**
 * A list's loading-more footer (#119): a centered spinner in a
 * padded band at the list's end, shown while the next page loads.
 * Both catalog pages (RecipesPage, DiscoverPage) hand-rolled this
 * identical footer; extracted for the #119 page de-styling
 * program so the catalogs share it.
 */
export function ListLoadingFooter({ label }: ListLoadingFooterProps) {
  return (
    <YStack alignItems="center" justifyContent="center" paddingVertical="$4">
      <Spinner label={label} />
    </YStack>
  );
}
