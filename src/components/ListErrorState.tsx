import { Alert } from "./Alert.js";

export type ListErrorStateProps = {
  /** The error message to announce in the alert. */
  message: string;
};

/**
 * A list's error state (#119): the error alert, nothing more.
 * The state carries no offset of its own (Stephen's ruling on
 * PR #311: an internal top padding used as an offset is the
 * margin loophole in another form — separation between a list's
 * elements belongs to the parent composition, the list and its
 * header, never to the leaf). Extracted from the catalog pages
 * for the #119 page de-styling program, so every catalog renders
 * its load failure the same way.
 */
export function ListErrorState({ message }: ListErrorStateProps) {
  return <Alert severity="error">{message}</Alert>;
}
