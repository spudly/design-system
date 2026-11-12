import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View, YStack } from "tamagui";
import { NutritionGoalsForm } from "./NutritionGoalsForm.js";
import { nutritionGoalsFixture } from "../pages/fixtures.js";

const meta: Meta<typeof NutritionGoalsForm> = {
  title: "Views/NutritionGoalsForm",
  component: NutritionGoalsForm,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof NutritionGoalsForm>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

export const Filled: Story = {
  render: () => (
    <Viewport>
      <NutritionGoalsForm
        goals={nutritionGoalsFixture}
        onChange={() => undefined}
        onSave={() => undefined}
      />
    </Viewport>
  ),
};

export const WithError: Story = {
  render: () => (
    <Viewport>
      <NutritionGoalsForm
        goals={nutritionGoalsFixture}
        onChange={() => undefined}
        error="Could not save your goals. Try again."
        onSave={() => undefined}
      />
    </Viewport>
  ),
};

export const Loading: Story = {
  render: () => (
    <Viewport>
      <NutritionGoalsForm
        goals={nutritionGoalsFixture}
        onChange={() => undefined}
        onSave={() => undefined}
        loading
      />
    </Viewport>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <Viewport>
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
    </Viewport>
  ),
};
