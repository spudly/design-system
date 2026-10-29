import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { Button } from "./Button.js";
import { EqualButtonRow } from "./EqualButtonRow.js";

const meta: Meta<typeof EqualButtonRow> = {
  title: "Components/EqualButtonRow",
  component: EqualButtonRow,
};

export default meta;
type Story = StoryObj<typeof EqualButtonRow>;

export const Default: Story = {
  render: () => (
    <YStack width={640} maxWidth="100%">
      <EqualButtonRow>
        <Button variant="primary" onPress={() => undefined}>
          Sign up free
        </Button>
        <Button variant="secondary" onPress={() => undefined}>
          Clone this recipe
        </Button>
        <Button variant="secondary" onPress={() => undefined}>
          Get the mobile app
        </Button>
      </EqualButtonRow>
    </YStack>
  ),
};

export const Wrapping: Story = {
  render: () => (
    <YStack width={320} maxWidth="100%">
      <EqualButtonRow>
        <Button variant="primary" onPress={() => undefined}>
          Save a copy
        </Button>
        <Button variant="secondary" onPress={() => undefined}>
          Get the mobile app
        </Button>
        <Button variant="secondary" onPress={() => undefined}>
          Share
        </Button>
      </EqualButtonRow>
    </YStack>
  ),
};
