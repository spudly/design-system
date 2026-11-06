import { useMemo } from "react";
import { StepList } from "./StepList.js";

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

export type RecipeInstructionsPanelStep = {
  id: string;
  stepNumber: number;
  body: string;
};

export type RecipeInstructionsPanelProps = {
  instructions: RecipeInstructionsPanelStep[];
};

export function RecipeInstructionsPanel({ instructions }: RecipeInstructionsPanelProps) {
  const sorted = useMemo(
    () => [...instructions].sort((a, b) => a.stepNumber - b.stepNumber),
    [instructions],
  );
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
