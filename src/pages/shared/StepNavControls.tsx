import { PrevNextNav } from "../../widgets/PrevNextNav.js";
import { StepDots } from "../../widgets/StepDots.js";

/**
 * StepNavControls (#587 phase 3 tranche 5): the step-navigation
 * children both cooking-mode pages render inside their StepOverlay —
 * the progress dots over the prev/next bar. CookingModePage and
 * MealCookingModePage carried identical copies; they now share this
 * one internal composition so the dots, the labels, and the
 * first-step / last-step disabling cannot drift apart. Internal to
 * the pages layer — not exported from the pages barrel.
 */
export function StepNavControls(props: {
  count: number;
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <>
      <StepDots count={props.count} activeIndex={props.activeIndex} />
      <PrevNextNav
        {...(props.activeIndex === 0 ? {} : { onBack: props.onPrev })}
        onNext={props.onNext}
        backLabel="← Back"
        nextLabel="Next →"
        nextDisabled={props.activeIndex >= props.count - 1}
      />
    </>
  );
}
