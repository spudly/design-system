import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { TagList } from "./TagList.js";

const meta: Meta<typeof TagList> = {
  title: "Widgets/TagList",
  component: TagList,
};

export default meta;
type Story = StoryObj<typeof TagList>;

const TAGS = [
  { id: "t1", name: "Weeknight", color: "red" },
  { id: "t2", name: "Gluten-free", color: "green" },
  { id: "t3", name: "Kid favorite", color: "amber" },
  { id: "t4", name: "Freezer friendly", color: "blue" },
] as const;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <TagList tags={[...TAGS]} />
    </YStack>
  ),
};

export const Loading: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <TagList tags={[...TAGS]} loading />
    </YStack>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <YStack position="relative" maxWidth={430}>
      <TagList tags={[...TAGS]} />
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.45}
        pointerEvents="none"
      >
        <TagList tags={[...TAGS]} loading />
      </YStack>
    </YStack>
  ),
};
