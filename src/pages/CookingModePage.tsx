import { BigFooterShell, type BigFooterData } from "../components/BigFooter.js";
import { PrevNextNav } from "../components/PrevNextNav.js";
import { StepDots } from "../components/StepDots.js";
import { StepOverlay } from "../components/StepOverlay.js";
import { ScaledIngredientsView } from "../views/ScaledIngredientsView.js";

/**
 * CookingModePage (#438 Part 3): the single-recipe cooking
 * mode — the page-level sibling of MealCookingModePage for one
 * recipe's steps, with the recipe's scaled-ingredients panel
 * riding the overlay between the step label and the body.
 *
 * Why this page exists: the Part 0 audit dispositioned the
 * recipe cooking view's widget imports (StepDots, PrevNextNav,
 * Text) as COVERAGE — the host composed them itself because
 * the design system had a meal cooking page but no recipe
 * cooking page. That supersedes the older G9 note (recorded
 * on MealCookingModePage) that the recipe mode's parts family
 * stays app-side: the step shell, the ingredients panel, and
 * the navigation now compose here. What stays app-side is the
 * swipe shell the host wraps around the mode and the step /
 * scaling computations — gestures and business logic, not
 * presentation.
 *
 * The contract mirrors MealCookingModePage's: step progression
 * is controlled — steps cross as view-models, `stepIndex` as a
 * prop, prev / next / done as bare callbacks; the screen keeps
 * the index and its clamping. Differences from the meal page,
 * both inherited from the recipe view this ports:
 * - The step label reads the step's own number ("Step 2 of
 *   5"): one recipe's steps never restart numbering, so there
 *   is no combined-sequence position to reconcile (the meal
 *   page's eciperay#324 concern does not arise).
 * - The scaled-ingredients panel renders between the step
 *   label and the body through StepOverlay's accessory slot:
 *   heading and lines cross pre-composed (the host scales and
 *   formats), rendered by ScaledIngredientsView.
 * - Bounds follow the same page convention as the meal page:
 *   the back control is omitted on the first step, Next
 *   disables on the last, and an out-of-range index renders
 *   nothing.
 * - There is no swipe navigation here either: the host's
 *   swipe shell mounts this page per step, as it mounted its
 *   own composition before.
 */

export type CookingModePageStep = {
  /** The step's number within the recipe (1-based). */
  stepNumber: number;
  body: string;
};

export type CookingModePageIngredients = {
  /** The panel heading, pre-composed ("Ingredients · 4 servings (scaled ×2)"). */
  heading: string;
  /** The scaled ingredient lines, pre-formatted. */
  lines: string[];
};

export type CookingModePageProps = {
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
  recipeTitle: string;
  steps: CookingModePageStep[];
  stepIndex: number;
  /** The scaled-ingredients panel; omit (or pass null) to hide it. */
  ingredients?: CookingModePageIngredients | null;
  onPrev: () => void;
  onNext: () => void;
  onDone: () => void;
};

export function CookingModePage(props: CookingModePageProps) {
  const { recipeTitle, steps, stepIndex, ingredients, onPrev, onNext, onDone } = props;
  const current = stepIndex >= 0 ? steps.at(stepIndex) : undefined;
  if (current === undefined) {
    return null;
  }

  return (
    <BigFooterShell footer={props.footer}>
      <StepOverlay
        title={recipeTitle}
        stepLabel={`Step ${current.stepNumber} of ${steps.length}`}
        body={current.body}
        onDone={onDone}
        accessory={
          ingredients ? (
            <ScaledIngredientsView heading={ingredients.heading} lines={ingredients.lines} />
          ) : undefined
        }
      >
        <StepDots count={steps.length} activeIndex={stepIndex} />
        <PrevNextNav
          {...(stepIndex === 0 ? {} : { onBack: onPrev })}
          onNext={onNext}
          backLabel="← Back"
          nextLabel="Next →"
          nextDisabled={stepIndex >= steps.length - 1}
        />
      </StepOverlay>
    </BigFooterShell>
  );
}
