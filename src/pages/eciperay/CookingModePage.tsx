import { FullScreenShell } from "../../widgets/layout/FullScreenShell.js";
import { LoadingScope } from "../../contexts/LoadingScope.js";
import { TextSkeleton } from "../../widgets/feedback/TextSkeleton.js";
import { Col } from "../../widgets/layout/Col.js";
import { RatingForm } from "../../widgets/form/RatingForm.js";
import { StepOverlay } from "../../widgets/overlays/StepOverlay.js";
import { ScaledIngredientsView } from "../../views/eciperay/ScaledIngredientsView.js";
import { StepNavControls } from "../shared/StepNavControls.js";

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
 * - Loading (#874, following the #278 pattern): while
 *   `loading`, the page renders a skeleton in the full-screen
 *   shell — a title bone, a step-label bone, and body-line
 *   bones inside a LoadingScope — so the host can mount the
 *   page before the recipe's steps resolve instead of gating
 *   on a spinner. The loading state is checked before the
 *   out-of-range rule: a host in this state may legitimately
 *   hold no steps yet.
 *
 * The cook-log form (#871, following the #687 pattern on
 * RecipeDetailPage/RecipesPage): the form is rendered by the
 * page itself — the DS RatingForm in its dark variant (the
 * variant built for this dark overlay), driven by the
 * top-level `cookLogForm` data prop. While the form data is
 * present, the form replaces the step view entirely — the
 * same replacement-state semantics both hosts used for their
 * local forms. The form's rating/notes state stays inside
 * the form; only the submit view-model, the skip intent, and
 * the pending flag cross the boundary. The open/closed state,
 * the mutation, and navigation stay host-side: the host opens
 * the form from its Done handling by passing the prop, and
 * exits cooking mode from its own onSkip / submit-success
 * handling.
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

/** The cook-log form's submit view-model (#871, the #687 shape). */
export type CookingModePageCookLogFormValues = {
  rating: 1 | 2 | 3 | 4 | 5 | null;
  notes: string | null;
};

export type CookingModePageCookLogForm = {
  onSubmit: (values: CookingModePageCookLogFormValues) => void;
  onSkip: () => void;
  isPending: boolean;
  /** Defaults to the voice object's ratingForm title (#539). */
  title?: string;
  /** Defaults to the voice object's ratingForm notesPlaceholder (#539). */
  notesPlaceholder?: string;
  /** Defaults to the voice object's ratingForm secondaryLabel (#539). */
  secondaryLabel?: string;
};

export type CookingModePageProps = {
  recipeTitle: string;
  steps: CookingModePageStep[];
  stepIndex: number;
  /** Loading state (#874): the page renders its skeleton
   * (see the header's loading note) and no step content;
   * `steps` may be empty in this state. */
  loading?: boolean;
  /** The scaled-ingredients panel; omit (or pass null) to hide it. */
  ingredients?: CookingModePageIngredients | null;
  /** The cook-log form as data (#871): when present, the page
   * renders the DS RatingForm (dark variant) itself in place
   * of the step view. The form's rating/notes state stays
   * inside the form; only the submit view-model, the skip
   * intent, and the pending flag cross the boundary — the
   * mutation itself stays app-side. Omit (or pass null) for
   * the normal step view. */
  cookLogForm?: CookingModePageCookLogForm | null;
  onPrev: () => void;
  onNext: () => void;
  onDone: () => void;
};

export function CookingModePage(props: CookingModePageProps) {
  const { recipeTitle, steps, stepIndex, ingredients, cookLogForm, onPrev, onNext, onDone, loading = false } = props;
  if (loading) {
    return (
      <FullScreenShell>
        <LoadingScope active>
          <Col gap="l" p="l">
            <TextSkeleton size="2xl" lines={1} />
            <TextSkeleton size="sm" lines={1} />
            <TextSkeleton size="md" lines={4} />
          </Col>
        </LoadingScope>
      </FullScreenShell>
    );
  }


  // The cook-log form branch resolves before the step guard
  // (#871): the hosts open the form from Done on any step, so
  // its presence replaces the step view independent of the
  // current step state. The form renders through StepOverlay's
  // panel mode — the overlay's dark shell, scroll column, and
  // focus containment, with no step content and no Done pill
  // (the form's Skip/Save are its exits).
  if (cookLogForm) {
    return (
      <FullScreenShell>
        <StepOverlay
          title={recipeTitle}
          panel={
            <RatingForm
              variant="dark"
              onSubmit={cookLogForm.onSubmit}
              onSkip={cookLogForm.onSkip}
              isPending={cookLogForm.isPending}
              title={cookLogForm.title}
              notesPlaceholder={cookLogForm.notesPlaceholder}
              secondaryLabel={cookLogForm.secondaryLabel}
            />
          }
        />
      </FullScreenShell>
    );
  }

  const current = stepIndex >= 0 ? steps.at(stepIndex) : undefined;
  if (current === undefined) {
    return null;
  }

  return (
    <FullScreenShell>
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
        <StepNavControls
          count={steps.length}
          activeIndex={stepIndex}
          onPrev={onPrev}
          onNext={onNext}
        />
      </StepOverlay>
    </FullScreenShell>
  );
}
