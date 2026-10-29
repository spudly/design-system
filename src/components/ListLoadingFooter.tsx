import { Center } from "./Center.js";
import { Spinner } from "./Spinner.js";

export type ListLoadingFooterProps = {
  /** The spinner's accessible label. */
  label: string;
};

/**
 * A list's loading-more footer (#119): the spinner, centered by
 * <Center>, shown while the next page loads. The footer carries
 * no padding band of its own (Stephen's ruling on PR #311: the
 * parent list controls the spacing around its footer). Both
 * catalog pages (RecipesPage, DiscoverPage) hand-rolled this
 * identical footer; extracted for the #119 page de-styling
 * program so the catalogs share it.
 */
export function ListLoadingFooter({ label }: ListLoadingFooterProps) {
  return (
    <Center>
      <Spinner label={label} />
    </Center>
  );
}
