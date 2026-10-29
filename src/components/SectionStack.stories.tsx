import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { SectionStack } from "./SectionStack.js";
import { Text } from "./Text.js";

const meta: Meta<typeof SectionStack> = {
  title: "Components/SectionStack",
  component: SectionStack,
};

export default meta;
type Story = StoryObj<typeof SectionStack>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <SectionStack>
        <Text variant="title">Weeknight favorites</Text>
        <Text variant="hint">Oct 19 – Oct 25</Text>
        <Text>
          Every block in the stack is separated by the one 32px page rhythm — the separation between
          sections is identical by construction.
        </Text>
      </SectionStack>
    </YStack>
  ),
};
