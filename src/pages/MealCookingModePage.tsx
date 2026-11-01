import { Alert } from "../components/Alert.js";
import { Button } from "../components/Button.js";
import { PrevNextNav } from "../components/PrevNextNav.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { SectionStack } from "../components/SectionStack.js";
import { StepDots } from "../components/StepDots.js";
import { StepOverlay } from "../components/StepOverlay.js";
import { Text } from "../components/Text.js";

/**
 * MealCookingModePage (#125, B3b): the meal cooking mode's
 * view layer — the split view half of Eciperay's
 * `MealCookingModeView` (the B2 audit's page-view disposition:
 * the cooking overlay's page-level sibling to
 * `CookingModeParts`, which stays app-side under its recorded
 * G9 decision).
 *
 * The contract (proposals on #125; the controlled shape ships
 * as the interim and the recommended option):
 * - Step progression is controlled: the plan's steps cross as
 *   view-models ({ stepNumber, recipeTitle, body } — the
 *   host's step data, pre-shaped), `stepIndex` crosses as a
 *   prop, and prev / next / done are bare callbacks. The
 *   screen keeps the index (and its clamping); nothing here
 *   owns navigation state.
 * - A step's `stepNumber` is its number within its own
 *   recipe, so it restarts when a meal moves to the next
 *   recipe. The header and the progress dots both position
 *   the step within the combined sequence instead: the
 *   header reads `stepIndex + 1` of `steps.length`, the same
 *   combined position StepDots reports (eciperay#324).
 * - The overlay chrome is the generic StepOverlay shell
 *   (#119): the dark full-screen shell, the absolute Done
 *   button, the uppercase step headers. The page composes
 *   the step line and passes its navigation (StepDots,
 *   PrevNextNav) as the shell's children; the recipe cooking
 *   view's parts family stays app-side (G9).
 * - Bounds are the page's presentation of its props: on the
 *   first step the back button is omitted (the DS
 *   PrevNextNav convention the app adapter encodes — the DS
 *   component has no disabled-back state), and Next disables
 *   on the last step. An out-of-range index renders nothing,
 *   as the app view does.
 * - There is no swipe navigation here: the app view has none
 *   (swipe is the recipe mode's app-side shell), and adding
 *   it would be a behavior change, not a port.
 * - Error state (eciperay#338): the props are a union, as on
 *   PublicRecipePage — the error state is carried in the
 *   props, not inferred from missing data. Before this state
 *   existed, a failed cook-plan request (the endpoint can
 *   answer 404 / 409 / 502) left hosts gating on
 *   loading / no-plan forever: the page never mounted and
 *   the user sat on a loading spinner with no error text.
 *   The `{ state: "error" }` member needs no steps at all,
 *   so a host renders it the moment its cook-plan (or meal)
 *   query fails, in place of its loading gate. It renders
 *   the established page-level error pattern — an error
 *   `Alert` (whose error severity carries the alert role;
 *   the wider announcement mechanics are #329's and are not
 *   prejudged here) in the standard page shell — under the
 *   meal's title when the host has it, with the cooking
 *   mode's own Done intent as the way out. The host may
 *   supply `errorMessage` when it has specific wording for
 *   the failure; omitted, the page's own generic copy
 *   renders (the PublicRecipePage DS-owned-copy precedent).
 *   The ready member's `state` stays optional, so existing
 *   hosts passing the flat ready props keep working
 *   unchanged.
 *
 * Documented deviations from the app view's rendering:
 * - The overlay's "white" is the theme's $surface, and its
 *   alpha steps (the Done fill at 10%, the headers at 60%)
 *   are composed with layered opacity instead of the app's
 *   hex-alpha suffixes on one app theme's surface value, so
 *   the page stays theme-correct.
 * - The step body sets no explicit leading: a line height
 *   derived from a font size is the #162 defect class,
 *   banned in this package.
 * - The nav labels keep the app's arrow forms ("← Back" /
 *   "Next →"), passed explicitly — the DS PrevNextNav
 *   defaults are unadorned.
 *
 * De-styled for #119: the page renders no layout primitives
 * and sets no styling props — the overlay shell (formerly
 * this page's own chrome) is the StepOverlay component, the
 * error state's shell and separation are ScreenContainer and
 * SectionStack, and the page contributes only the bounds
 * logic, the composed step line, and its navigation controls.
 */

export type MealCookingModePageStep = {
  stepNumber: number;
  recipeTitle: string;
  body: string;
};

export type MealCookingModePageReadyProps = {
  /** Discriminator for the union; optional so existing hosts
   * passing the flat ready props keep working unchanged —
   * only the error member must name its state. */
  state?: "ready";
  mealTitle: string;
  steps: MealCookingModePageStep[];
  stepIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onDone: () => void;
};

export type MealCookingModePageErrorProps = {
  state: "error";
  /** The meal's title, when the host has it (its meal query
   * may have succeeded while the cook plan failed); the
   * generic cooking-mode title renders without it. */
  mealTitle?: string;
  /** The failure's wording, when the host has specific copy
   * for it; omitted, the page's own generic copy renders. */
  errorMessage?: string;
  /** The way out of cooking mode — the same Done intent the
   * ready state reports. */
  onDone: () => void;
};

export type MealCookingModePageProps =
  MealCookingModePageReadyProps | MealCookingModePageErrorProps;

// The error state's generic copy (DS-owned, the
// PublicRecipePage precedent): it names the failed load and
// the user's recourse, without claiming a cause — the host's
// failures range from a missing meal to an unavailable
// cook-plan service.
const LOAD_ERROR_MESSAGE = "Couldn't load the cook plan for this meal. Please try again.";
const LOAD_ERROR_TITLE = "Cooking mode";

export function MealCookingModePage(props: MealCookingModePageProps) {
  if (props.state === "error") {
    const { mealTitle, errorMessage, onDone } = props;
    return (
      <ScreenContainer>
        <SectionStack>
          <Text variant="title">{mealTitle ?? LOAD_ERROR_TITLE}</Text>
          <Alert severity="error">{errorMessage ?? LOAD_ERROR_MESSAGE}</Alert>
          <Button variant="secondary" onPress={onDone}>
            Done
          </Button>
        </SectionStack>
      </ScreenContainer>
    );
  }

  const { mealTitle, steps, stepIndex, onPrev, onNext, onDone } = props;
  const current = steps.at(stepIndex);
  if (current === undefined) {
    return null;
  }

  return (
    <StepOverlay
      title={mealTitle}
      stepLabel={`Step ${stepIndex + 1} of ${steps.length} · ${current.recipeTitle}`}
      body={current.body}
      onDone={onDone}
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
  );
}
