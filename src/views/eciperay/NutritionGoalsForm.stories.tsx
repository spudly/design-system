import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";

import { nutritionGoalsFixture } from "../../pages/shared/fixtures.js";
import { StoryFrame } from "../shared/storyFrame.js";

import { NutritionGoalsForm } from "./NutritionGoalsForm.js";

const meta: Meta<typeof NutritionGoalsForm> = {
  title: "Views/Eciperay/NutritionGoalsForm",
  component: NutritionGoalsForm,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof NutritionGoalsForm>;

export const Filled: Story = {
  render: () => (
    <StoryFrame variant="phone">
      <NutritionGoalsForm
        goals={nutritionGoalsFixture}
        onChange={() => { /* noop */ }}
        onSave={() => { /* noop */ }}
      />
    </StoryFrame>
  ),
};

export const WithError: Story = {
  render: () => (
    <StoryFrame variant="phone">
      <NutritionGoalsForm
        goals={nutritionGoalsFixture}
        onChange={() => { /* noop */ }}
        error="Could not save your goals. Try again."
        onSave={() => { /* noop */ }}
      />
    </StoryFrame>
  ),
};

export const Loading: Story = {
  render: () => (
    <StoryFrame variant="phone">
      <NutritionGoalsForm
        goals={nutritionGoalsFixture}
        onChange={() => { /* noop */ }}
        onSave={() => { /* noop */ }}
        loading
      />
    </StoryFrame>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <StoryFrame variant="phone">
      <YStack position="relative">
        <NutritionGoalsForm
          goals={nutritionGoalsFixture}
          onChange={() => { /* noop */ }}
          onSave={() => { /* noop */ }}
        />
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.45}
          pointerEvents="none"
        >
          <NutritionGoalsForm
            goals={nutritionGoalsFixture}
            onChange={() => { /* noop */ }}
            onSave={() => { /* noop */ }}
            loading
          />
        </YStack>
      </YStack>
    </StoryFrame>
  ),
};
