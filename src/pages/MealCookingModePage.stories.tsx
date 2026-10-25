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

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844} position="relative">
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
