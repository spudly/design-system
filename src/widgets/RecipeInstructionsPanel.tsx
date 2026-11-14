import { useMemo } from "react";
import { View, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { useLoadingScope } from "../contexts/LoadingScope.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { StepList } from "./StepList.js";
import { TextSkeleton } from "./TextSkeleton.js";

/**
 * A recipe's instructions panel: the step cards in step-number
 * order, the tapped card highlighted as the active step. The two
 * recipe surfaces (RecipeDetailPage and PublicRecipePage) render
 * this section identically; each page carried it inline before
 * it moved here (#119), and the step shape is declared here
 * structurally so either page's array composes it without a
 * second shape to drift. The panel carries no outer padding or
 * spacing — the page shell's column insets it, and separation
 * from the sections around it is the parent stack's.
 *
 * The cards themselves are the shared StepList (#119 dedupe):
 * it owns the card treatment, the pressable pattern (button
 * role, focusable, Enter/Space activation on web), and the
 * ephemeral active-step state (first step active by default, as
 * the app's tab held it). What stays here is the recipe
 * section's own wiring: sorting the view-model's steps by
 * number and composing each step's "Step N" eyebrow label —
 * StepList takes pre-composed labels because labels are caller
 * content.
 */

type RecipeInstructionsPanelStep = {
  id: string;
  stepNumber: number;
  body: string;
};

export type RecipeInstructionsPanelProps = {
  instructions: RecipeInstructionsPanelStep[];
  /** Loading state (#278): the panel renders one skeleton step
   * card per step (exactly 3 dummy cards when no steps are
   * known yet), each mirroring a StepList card's geometry —
   * eyebrow bone over a two-line body bone, the card border
   * transparent so no hairline shows in the skeleton state —
   * with no real step text and no pressable cards. An enclosing
   * composite's LoadingScope can also put the panel into this
   * state without prop-drilling. */
  loading?: boolean;
};

// The loading panel's dummy cards (#278): exactly 3 placeholder
// cards when no steps are known, from a frozen module-level
// constant with stable keys — never generated per render. A
// loading panel over known steps mirrors its own step count.
const LOADING_STEP_KEYS = ["loading-1", "loading-2", "loading-3"] as const;

export function RecipeInstructionsPanel({
  instructions,
  loading = false,
}: RecipeInstructionsPanelProps) {
  const showSkeleton = useLoadingScope(loading);
  const sorted = useMemo(
    () => [...instructions].sort((a, b) => a.stepNumber - b.stepNumber),
    [instructions],
  );
  if (showSkeleton) {
    // Loading (#278): skeleton step cards in the StepList cards'
    // own geometry (large radius, $4 padding, eyebrow over body),
    // one per step — no step text, no activation, the card
    // borders transparent, and the region marked busy.
    const keys = sorted.length > 0 ? sorted.map((step) => step.id) : LOADING_STEP_KEYS;
    return (
      <YStack {...platformAccessibilityProps({ accessibilityState: { busy: true } })}>
        {keys.map((key) => (
          <YStack key={key} paddingBlockEnd="$3">
            <YStack
              borderRadius={tokens.radii.lg}
              borderWidth={1}
              padding="$4"
              borderColor="transparent"
              backgroundColor="$surface"
            >
              <YStack paddingBlockEnd="$1">
                <View width={56}>
                  <TextSkeleton size="xs" lines={1} />
                </View>
              </YStack>
              <TextSkeleton size="md" lines={2} />
            </YStack>
          </YStack>
        ))}
      </YStack>
    );
  }
  return (
    <StepList
      steps={sorted.map((step) => ({
        id: step.id,
        label: `Step ${step.stepNumber}`,
        body: step.body,
      }))}
    />
  );
}
