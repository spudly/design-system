import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { ScrollShell } from "./ScrollShell.js";
import { Text } from "./Text.js";

const meta: Meta<typeof ScrollShell> = {
  title: "Components/ScrollShell",
  component: ScrollShell,
};

export default meta;
type Story = StoryObj<typeof ScrollShell>;

export const Default: Story = {
  render: () => (
    <YStack width={430} height={480}>
      <ScrollShell>
        <Text variant="subheading">First block</Text>
        <Text>
          The shell paints the surface, scrolls as one region, and insets its blocks with the
          standard rhythm — this text and the headings sit 16px from the shell's edges and from each
          other without any of them carrying spacing.
        </Text>
        <Text variant="subheading">Second block</Text>
        <Text>Blocks stack in the shell's column in order.</Text>
      </ScrollShell>
    </YStack>
  ),
};
