import { Center } from "./Center.js";
import { Spinner } from "./Spinner.js";

export type ListLoadingStateProps = {
  /** The spinner's accessible label. */
  label: string;
};

/**
 * A list's loading state (#119): the spinner, centered by
 * <Center> — the dedicated centering component — with no offset
 * of its own (Stephen's ruling on PR #311: a top padding inside
 * the leaf is a top-margin in disguise; parents own the spacing
 * between their children). Extracted from the catalog pages for
 * the #119 page de-styling program, so every catalog renders its
 * first-load the same way.
 */
export function ListLoadingState({ label }: ListLoadingStateProps) {
  return (
    <Center>
      <Spinner label={label} />
    </Center>
  );
}
