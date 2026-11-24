import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "./data/Text.js";
import { ContentStack } from "./ContentStack.js";

const meta: Meta<typeof ContentStack> = {
  title: "Widgets/ContentStack",
  component: ContentStack,
};

export default meta;
type Story = StoryObj<typeof ContentStack>;

export const Default: Story = {
  render: () => (
    <ContentStack>
      <Text>First block</Text>
      <Text>Second block</Text>
    </ContentStack>
  ),
};
