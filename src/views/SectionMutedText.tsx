import { Text } from "../widgets/data/Text.js";
import { TextSkeleton } from "../widgets/feedback/TextSkeleton.js";

export type SectionMutedTextProps = {
  /** While the section's loading scope is active, the copy is
   * replaced by its skeleton bone. */
  loading: boolean;
  /** The section's intro copy. */
  text: string;
};

/**
 * A section card's muted intro line with its loading treatment,
 * shared by AccountDataView and TransferRecipesView (#587
 * phase 3): while loading, a two-line text bone stands in for
 * the copy — the intro wraps to two lines at the section's
 * width, and a single line left everything below it shifted up
 * by a line (Stephen on #579). Internal helper, not a view
 * component of its own: NOT exported from the views barrel,
 * exercised through the two views' stories.
 */
export function SectionMutedText({ loading, text }: SectionMutedTextProps) {
  return loading ? <TextSkeleton size="md" lines={2} /> : <Text variant="muted">{text}</Text>;
}
