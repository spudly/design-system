import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { Button } from "./Button.js";
import { ButtonStack } from "./ButtonStack.js";

const meta: Meta<typeof ButtonStack> = {
  title: "Components/ButtonStack",
  component: ButtonStack,
};

export default meta;
type Story = StoryObj<typeof ButtonStack>;

const noop = () => {};

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <ButtonStack>
        <Button variant="primary" onPress={noop}>
          Browse recipes
        </Button>
        <Button variant="secondary" onPress={noop}>
          Add a recipe
        </Button>
        <Button variant="secondary" onPress={noop}>
          Shared with me
        </Button>
      </ButtonStack>
    </YStack>
  ),
};
