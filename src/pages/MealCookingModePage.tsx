import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "../components/accessibility.js";
import { PrevNextNav } from "../components/PrevNextNav.js";
import { StepDots } from "../components/StepDots.js";
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
 * - The overlay chrome is page chrome, baked in (the
 *   MealPlanDetailPage no-slot precedent): the dark full-
 *   screen shell, the absolute Done button, the uppercase
 *   step headers. No shared DS overlay shell is extracted in
 *   this batch; the recipe cooking view's parts family stays
 *   app-side (G9).
 * - Bounds are the page's presentation of its props: on the
 *   first step the back button is omitted (the DS
 *   PrevNextNav convention the app adapter encodes — the DS
 *   component has no disabled-back state), and Next disables
 *   on the last step. An out-of-range index renders nothing,
 *   as the app view does.
 * - There is no swipe navigation here: the app view has none
 *   (swipe is the recipe mode's app-side shell), and adding
 *   it would be a behavior change, not a port.
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
 */

export type MealCookingModePageStep = {
  stepNumber: number;
  recipeTitle: string;
  body: string;
};

export type MealCookingModePageProps = {
  mealTitle: string;
  steps: MealCookingModePageStep[];
  stepIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onDone: () => void;
};

export function MealCookingModePage({
  mealTitle,
  steps,
  stepIndex,
  onPrev,
  onNext,
  onDone,
}: MealCookingModePageProps) {
  const current = steps.at(stepIndex);
  if (current === undefined) {
    return null;
  }

  // Web keyboard support for the Done affordance (the
  // MealPlansPage row pattern): Enter and Space invoke the
  // same callback as a press. Web-only props, ignored on
  // native.
  const handleDoneKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onDone();
    }
  };

  return (
    <YStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      justifyContent="center"
      backgroundColor={tokens.colors.gray.gray10}
      paddingHorizontal="$6"
    >
      <YStack
        position="absolute"
        right={tokens.spacing[6]}
        top={tokens.spacing[12]}
        borderRadius={tokens.radii.full}
        overflow="hidden"
        {...platformAccessibilityProps({
          accessibilityRole: "button",
          accessibilityLabel: "Done",
        })}
        onPress={onDone}
        tabIndex={0}
        onKeyDown={handleDoneKeyDown}
        cursor="web:pointer"
      >
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          backgroundColor="$surface"
          opacity={0.1}
        />
        <Text
          fontSize={tokens.typography.fontSize.sm}
          color="$surface"
          paddingHorizontal="$4"
          paddingVertical="$2"
        >
          Done
        </Text>
      </YStack>
      <YStack paddingBlockEnd="$2">
        <Text
          fontSize={tokens.typography.fontSize.sm}
          letterSpacing={1.4}
          color="$surface"
          opacity={0.6}
          textTransform="uppercase"
        >
          {mealTitle}
        </Text>
      </YStack>
      <YStack paddingBlockEnd="$4">
        <Text
          fontSize={tokens.typography.fontSize.sm}
          letterSpacing={1.4}
          color="$surface"
          opacity={0.6}
          textTransform="uppercase"
        >
          Step {current.stepNumber} of {steps.length} · {current.recipeTitle}
        </Text>
      </YStack>
      <YStack paddingBlockEnd="$8">
        <Text fontSize={tokens.typography.fontSize["2xl"]} color="$surface">
          {current.body}
        </Text>
      </YStack>
      <StepDots count={steps.length} activeIndex={stepIndex} />
      <PrevNextNav
        {...(stepIndex === 0 ? {} : { onBack: onPrev })}
        onNext={onNext}
        backLabel="← Back"
        nextLabel="Next →"
        nextDisabled={stepIndex >= steps.length - 1}
      />
    </YStack>
  );
}
