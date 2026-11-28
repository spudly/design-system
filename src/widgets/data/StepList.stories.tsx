import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";

import { StepList } from "./StepList.js";

const meta: Meta<typeof StepList> = {
  title: "Widgets/Data Display/StepList",
  component: StepList,
};

export default meta;
type Story = StoryObj<typeof StepList>;

const steps = [
  {
    id: "s1",
    label: "Step 1",
    body: "Season the chicken and sear until golden, 6 minutes per side.",
  },
  {
    id: "s2",
    label: "Step 2",
    body: "Add the rice and broth, cover, and simmer 18 minutes.",
  },
  {
    id: "s3",
    label: "Step 3",
    body: "Rest 5 minutes, then fluff and fold in the spinach.",
  },
];

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430} padding="$4">
      <StepList steps={steps} />
    </YStack>
  ),
};

export const Numerals: Story = {
  // #721: the numeral presentation — a large accent numeral
  // beside each step's body instead of the eyebrow label
  // (RecipeDetailPage's instructions).
  render: () => (
    <YStack maxWidth={430} padding="$4">
      <StepList presentation="numeral" steps={steps} />
    </YStack>
  ),
};

export const Loading: Story = {
  render: () => (
    <YStack maxWidth={430} padding="$4">
      <StepList
        steps={[
          {
            id: "s1",
            label: "Step 1",
            body: "Season the chicken and sear until golden, 6 minutes per side.",
          },
          {
            id: "s2",
            label: "Step 2",
            body: "Add the rice and broth, cover, and simmer 18 minutes.",
          },
          {
            id: "s3",
            label: "Step 3",
            body: "Rest 5 minutes, then fluff and fold in the spinach.",
          },
        ]}
        loading
      />
    </YStack>
  ),
};

// The overlay verifies the skeleton reproduces the loaded cards' shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <YStack position="relative" maxWidth={430} padding="$4">
      <StepList
        steps={[
          {
            id: "s1",
            label: "Step 1",
            body: "Season the chicken and sear until golden, 6 minutes per side.",
          },
          {
            id: "s2",
            label: "Step 2",
            body: "Add the rice and broth, cover, and simmer 18 minutes.",
          },
          {
            id: "s3",
            label: "Step 3",
            body: "Rest 5 minutes, then fluff and fold in the spinach.",
          },
        ]}
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
        <StepList
        steps={[
          {
            id: "s1",
            label: "Step 1",
            body: "Season the chicken and sear until golden, 6 minutes per side.",
          },
          {
            id: "s2",
            label: "Step 2",
            body: "Add the rice and broth, cover, and simmer 18 minutes.",
          },
          {
            id: "s3",
            label: "Step 3",
            body: "Rest 5 minutes, then fluff and fold in the spinach.",
          },
        ]}
          loading
        />
      </YStack>
    </YStack>
  ),
};
