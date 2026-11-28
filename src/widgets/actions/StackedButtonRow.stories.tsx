import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";

import { Button } from "./Button.js";
import { StackedButtonRow } from "./StackedButtonRow.js";

const meta: Meta<typeof StackedButtonRow> = {
  title: "Widgets/Actions & Navigation/StackedButtonRow",
  component: StackedButtonRow,
};

export default meta;
type Story = StoryObj<typeof StackedButtonRow>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={640}>
      <StackedButtonRow>
        <Button href="/discover" variant="primary">
          Discover recipes
        </Button>
        <Button href="/sign-up" variant="secondary">
          Sign up
        </Button>
        <Button href="/get-app" variant="secondary">
          Get the app
        </Button>
      </StackedButtonRow>
    </YStack>
  ),
};
