import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { Center } from "./Center.js";
import { Spinner } from "./Spinner.js";
import { Text } from "./Text.js";

const meta: Meta<typeof Center> = {
  title: "Components/Center",
  component: Center,
  argTypes: {
    horizontal: { control: "boolean" },
    vertical: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Center>;

export const Centered: Story = {
  render: (args) => (
    <YStack maxWidth={430} height={200} borderWidth={1} borderColor="$borderColor">
      <Center {...args} flex={1}>
        <Spinner label="Loading" />
      </Center>
    </YStack>
  ),
};

export const HorizontalOnly: Story = {
  render: (args) => (
    <YStack maxWidth={430} borderWidth={1} borderColor="$borderColor">
      <Center {...args} vertical={false}>
        <Text variant="hint">A lone notice, centered horizontally at the top of its block.</Text>
      </Center>
    </YStack>
  ),
};
