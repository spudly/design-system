import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

export type SuggestionPanelEntry = {
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
    <YStack borderRadius={tokens.radii.lg} backgroundColor="$primarySubtle" padding="$4">
      <YStack paddingBlockEnd="$2">
        <Text
          fontSize={tokens.typography.fontSize.sm}
          fontWeight={tokens.typography.fontWeight.semibold}
          color="$primaryEmphasis"
        >
          {title}
        </Text>
      </YStack>
      {entries.map((entry) => (
        <YStack key={entry.id} paddingBlockEnd="$2">
          <Text
            fontSize={tokens.typography.fontSize.sm}
            fontWeight={tokens.typography.fontWeight.medium}
          >
            {entry.label}
          </Text>
          <Text fontSize={tokens.typography.fontSize.sm} color={tokens.colors.gray.gray7}>
            {entry.detail}
          </Text>
        </YStack>
      ))}
    </YStack>
  );
}
