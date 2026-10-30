import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { TagList } from "./TagList.js";

const meta: Meta<typeof TagList> = {
  title: "Components/TagList",
  component: TagList,
};

export default meta;
type Story = StoryObj<typeof TagList>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <TagList
        tags={[
          { id: "t1", name: "Weeknight", color: "red" },
          { id: "t2", name: "Gluten-free", color: "green" },
          { id: "t3", name: "Kid favorite", color: "amber" },
          { id: "t4", name: "Freezer friendly", color: "blue" },
        ]}
      />
    </YStack>
  ),
};
