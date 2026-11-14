import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { LoadingScope, useLoadingScope } from "../contexts/LoadingScope.js";
import { platformAccessibilityProps } from "../widgets/accessibility.js";
import { Button } from "../widgets/Button.js";
import { Text } from "../widgets/Text.js";
import { TextSkeleton } from "../widgets/TextSkeleton.js";

type CandidateListItem = {
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
  /** Loading state (#278): the title renders as a text
   * skeleton at its own (sm) size and the list renders one
   * skeleton card per candidate — or exactly 3 dummy cards
   * when there are no candidates to mirror — each keeping the
   * tinted card frame with a transparent border (no visible
   * hairline), a label text skeleton, and the Activate action
   * kept inside the loading scope as a rectangle skeleton when
   * `onActivatePress` is provided. An enclosing composite's
   * LoadingScope can also put the list into this state without
   * prop-drilling. */
  loading?: boolean;
};

// The dummy cards for a candidate-less loading list (#278):
// exactly 3 placeholder cards, from a frozen module-level
// constant — never generated per render.
const LOADING_CANDIDATE_IDS = ["loading-1", "loading-2", "loading-3"] as const;

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
  loading = false,
}: CandidateListProps) {
  const showSkeleton = useLoadingScope(loading);
  if (showSkeleton) {
    const skeletonItems: readonly { id: string; label: string }[] =
      candidates.length > 0 ? candidates : LOADING_CANDIDATE_IDS.map((id) => ({ id, label: "" }));
    return (
      <YStack gap="$2" {...platformAccessibilityProps({ accessibilityState: { busy: true } })}>
        <TextSkeleton size="sm" lines={1} />
        <LoadingScope active>
          {skeletonItems.map((candidate) => (
            <YStack
              key={candidate.id}
              width="100%"
              borderRadius={tokens.radii.md}
              borderWidth={1}
              borderColor="transparent"
              backgroundColor="$primarySubtle"
              padding="$3"
            >
              <YStack paddingBlockEnd="$2">
                <TextSkeleton size="sm" lines={1} />
              </YStack>
              {onActivatePress ? (
                <YStack alignItems="flex-start">
                  <Button
                    variant="primary"
                    size="sm"
                    accessibilityLabel={`Activate ${candidate.label}`}
                    disabled={isActivationPending}
                    onPress={() => {
                      onActivatePress(candidate.id);
                    }}
                  >
                    Activate
                  </Button>
                </YStack>
              ) : null}
            </YStack>
          ))}
        </LoadingScope>
      </YStack>
    );
  }
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
              accessibilityLabel={`Activate ${candidate.label}`}
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
