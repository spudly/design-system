import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { NutritionGoalsForm } from "./NutritionGoalsForm.js";
import { nutritionGoalsFixture } from "../pages/fixtures.js";
import { StoryFrame } from "./storyFrame.js";

const meta: Meta<typeof NutritionGoalsForm> = {
  title: "Views/NutritionGoalsForm",
  component: NutritionGoalsForm,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof NutritionGoalsForm>;

export const Filled: Story = {
  render: () => (
    <StoryFrame height={844}>
      <NutritionGoalsForm
        goals={nutritionGoalsFixture}
        onChange={() => undefined}
        onSave={() => undefined}
      />
    </StoryFrame>
  ),
};

export const WithError: Story = {
  render: () => (
    <StoryFrame height={844}>
      <NutritionGoalsForm
        goals={nutritionGoalsFixture}
        onChange={() => undefined}
        error="Could not save your goals. Try again."
        onSave={() => undefined}
      />
    </StoryFrame>
  ),
};

export const Loading: Story = {
  render: () => (
    <StoryFrame height={844}>
      <NutritionGoalsForm
        goals={nutritionGoalsFixture}
        onChange={() => undefined}
        onSave={() => undefined}
        loading
      />
    </StoryFrame>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <StoryFrame height={844}>
      <YStack position="relative">
        <NutritionGoalsForm
          goals={nutritionGoalsFixture}
          onChange={() => undefined}
          onSave={() => undefined}
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
            onChange={() => undefined}
            onSave={() => undefined}
            loading
          />
        </YStack>
      </YStack>
    </StoryFrame>
  ),
};
