import { ListLoadingState } from "./ListLoadingState.js";

export type ListLoadingFooterProps = {
  /** The spinner's accessible label. */
  label: string;
};

/**
 * A list's loading-more footer (#119): the spinner shown at
 * the list's end while the next page loads. Both catalog pages
 * (RecipesPage, DiscoverPage) hand-rolled this identical
 * footer; extracted for the #119 page de-styling program so
 * the catalogs share it. The footer carries no padding band
 * of its own (Stephen's ruling on PR #311: the parent list
 * controls the spacing around its footer).
 *
 * The rendering is ListLoadingState's — one implementation
 * (#119 dedupe, cluster B11): a lone centered spinner is the
 * same element in both slots, and the two names exist because
 * the slots are different jobs (first load vs loading more),
 * per the named-for-content rule.
 */
export function ListLoadingFooter({ label }: ListLoadingFooterProps) {
  return <ListLoadingState label={label} />;
}
