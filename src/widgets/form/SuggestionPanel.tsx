import { Col } from "../layout/Col.js";
import { Spacer } from "../layout/Spacer.js";
import { tokens } from "../../tokens/index.js";
import { Text } from "../data/Text.js";

type SuggestionPanelEntry = {
  /** Stable key for the entry. */
  id: string;
  /** The entry's name (e.g. the item a suggestion replaces). */
  label: string;
  /** The suggestion line for the entry. */
  detail: string;
};

export type SuggestionPanelProps = {
  /** The panel's heading (e.g. "Substitutions"). */
  title: string;
  /** The suggestion entries. */
  entries: SuggestionPanelEntry[];
};

/**
 * A tinted suggestion panel (#119): a primary-tinted panel
 * listing name → suggestion pairs under a small heading —
 * substitutions for missing ingredients, alternatives for an
 * unavailable option, tips keyed to a selection. Extracted
 * from RecipeDetailPage's substitutions panel; the panel owns
 * its tint, frame, and internal rhythm, and its separation
 * from surrounding content is the parent stack's. Content is
 * caller-supplied, so the panel serves any app's suggestions.
 */
export function SuggestionPanel({ title, entries }: SuggestionPanelProps) {
  return (
    <Col borderRadius={tokens.radii.lg} backgroundColor="$primarySubtle" p="l">
      {/* Each block carries its own 8px bottom inset — including
        the last entry's trailing inset inside the panel's
        padding — so the separation is composed per block with a
        Spacer, not a parent gap (#746: a parent gap would drop
        the trailing inset). */}
      <Col>
        <Text
          fontSize={tokens.typography.fontSize.sm}
          fontWeight={tokens.typography.fontWeight.semibold}
          color="$primaryEmphasis"
        >
          {title}
        </Text>
        <Spacer y="s" />
      </Col>
      {entries.map((entry) => (
        <Col key={entry.id}>
          <Text
            fontSize={tokens.typography.fontSize.sm}
            fontWeight={tokens.typography.fontWeight.medium}
          >
            {entry.label}
          </Text>
          <Text fontSize={tokens.typography.fontSize.sm} color={tokens.colors.gray.gray7}>
            {entry.detail}
          </Text>
          <Spacer y="s" />
        </Col>
      ))}
    </Col>
  );
}
