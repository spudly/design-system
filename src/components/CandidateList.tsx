import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "./Button.js";
import { Text } from "./Text.js";

export type CandidateListItem = {
  /** Stable key for the candidate. */
  id: string;
  /** The candidate's label (e.g. a version's name). */
  label: string;
};

export type CandidateListProps = {
  /** The list's heading (e.g. "Ready to activate"). */
  title: string;
  /** The candidates awaiting activation. */
  candidates: CandidateListItem[];
  /** An activation is in flight: the action buttons disable. */
  isActivationPending?: boolean;
  /**
   * Activation callback, called with the candidate's id. Omit
   * it and the cards render without an action — candidate data
   * alone exposes no dead button.
   */
  onActivatePress?: (candidateId: string) => void;
};

/**
 * A list of candidates awaiting activation (#119): a small
 * heading over one tinted card per candidate, each card
 * carrying the candidate's label and its Activate action.
 * Extracted from RecipeDetailPage's lifecycle section (a newer
 * version proposed for activation); the shape is generic — any
 * app proposing items for a one-tap activation composes it.
 * The list owns its heading rhythm and card treatment; its
 * separation from surrounding content is the parent stack's.
 */
export function CandidateList({
  title,
  candidates,
  isActivationPending = false,
  onActivatePress,
}: CandidateListProps) {
  return (
    <YStack gap="$2">
      <Text
        fontSize={tokens.typography.fontSize.sm}
        fontWeight={tokens.typography.fontWeight.medium}
        color={tokens.colors.gray.gray10}
      >
        {title}
      </Text>
      {candidates.map((candidate) => (
        <YStack
          key={candidate.id}
          borderRadius={tokens.radii.md}
          borderWidth={1}
          borderColor={tokens.colors.terracotta.terracotta3}
          backgroundColor="$primarySubtle"
          padding="$3"
        >
          <YStack paddingBlockEnd="$2">
            <Text fontSize={tokens.typography.fontSize.sm} color={tokens.colors.gray.gray9}>
              {candidate.label}
            </Text>
          </YStack>
          {onActivatePress ? (
            <Button
              variant="primary"
              size="sm"
              alignSelf="flex-start"
              disabled={isActivationPending}
              onPress={() => {
                onActivatePress(candidate.id);
              }}
            >
              Activate
            </Button>
          ) : null}
        </YStack>
      ))}
    </YStack>
  );
}
