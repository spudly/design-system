import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { mealCookingFixture } from "./fixtures.js";
import { MealCookingModePage } from "./MealCookingModePage.js";

/**
 * Stories for the real MealCookingModePage (#125): the step
 * index is held by the story, as the app screen holds it —
 * prev/next move through the fixture's steps, so the states
 * below pin the first-step (no back button) and last-step
 * (next disabled) bounds. The overlay is absolutely
 * positioned, so the frame gives it a bounded parent. Theme
 * pinned to Warm Harvest.
 */
const meta: Meta<typeof MealCookingModePage> = {
  title: "Pages/Eciperay/MealCookingModePage",
  component: MealCookingModePage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof MealCookingModePage>;

function Viewport({ children, height = 844 }: { children: ReactNode; height?: number }) {
  return (
    <View width={430} maxWidth="100%" height={height} position="relative">
      {children}
    </View>
  );
}

function Cooking({ initialStep }: { initialStep: number }) {
  const [stepIndex, setStepIndex] = useState(initialStep);
  const steps = mealCookingFixture.steps;
  return (
    <MealCookingModePage
      mealTitle={mealCookingFixture.mealTitle}
      steps={steps}
      stepIndex={stepIndex}
      onPrev={() => {
        setStepIndex((current) => Math.max(0, current - 1));
      }}
      onNext={() => {
        setStepIndex((current) => Math.min(steps.length - 1, current + 1));
      }}
      onDone={() => undefined}
    />
  );
}

export const Default: Story = {
  render: () => (
    <Viewport>
      <Cooking initialStep={1} />
    </Viewport>
  ),
};

export const FirstStep: Story = {
  render: () => (
    <Viewport>
      <Cooking initialStep={0} />
    </Viewport>
  ),
};

export const LastStep: Story = {
  render: () => (
    <Viewport>
      <Cooking initialStep={mealCookingFixture.steps.length - 1} />
    </Viewport>
  ),
};

/**
 * The tall-body case (#332): a long step body in a short frame
 * (430px stands in for a short viewport). StepOverlay's bounded
 * scroll region holds the body and the navigation — the capture
 * shows the region's top with the Done pill pinned at the top
 * right; the dots and PrevNextNav sit below the body inside the
 * region, reachable by scrolling instead of pushed off-screen.
 */
const LONG_BODY_STEPS = [
  {
    stepNumber: 1,
    recipeTitle: "Creamy Tuscan Garlic Chicken",
    body: "Sear the chicken in a hot pan with a little olive oil until deeply golden, about 5 minutes per side, working in batches if the pan is crowded so the pieces brown instead of steam. Set the chicken aside on a warm plate, then add the garlic and sun-dried tomatoes to the same pan and cook until fragrant, about 1 minute. Pour in the cream and scrape up every browned bit from the bottom of the pan, then let the sauce come to a gentle simmer and reduce until it coats the back of a spoon, 4 to 5 minutes. Stir in the spinach a handful at a time, letting each handful wilt before adding the next. Return the chicken and any accumulated juices to the pan, spoon the sauce over the tops, cover, and simmer on low until the chicken is cooked through, another 5 to 7 minutes.",
  },
  {
    stepNumber: 2,
    recipeTitle: "Creamy Tuscan Garlic Chicken",
    body: "Rest for a few minutes off the heat, then serve over pasta.",
  },
];

export const LongBody: Story = {
  render: () => (
    <Viewport height={430}>
      <MealCookingModePage
        mealTitle={mealCookingFixture.mealTitle}
        steps={LONG_BODY_STEPS}
        stepIndex={0}
        onPrev={() => undefined}
        onNext={() => undefined}
        onDone={() => undefined}
      />
    </Viewport>
  ),
};
