import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { StepList } from "./StepList.js";

const meta: Meta<typeof StepList> = {
  title: "Components/StepList",
  component: StepList,
};

export default meta;
type Story = StoryObj<typeof StepList>;

export const Default: Story = {
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
      />
    </YStack>
  ),
};
