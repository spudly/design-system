import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { HeroStack } from "./HeroStack.js";
import { Text } from "./Text.js";

const meta: Meta<typeof HeroStack> = {
  title: "Widgets/HeroStack",
  component: HeroStack,
};

export default meta;
type Story = StoryObj<typeof HeroStack>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={640}>
      <HeroStack>
        <Text variant="heading" textAlign="center">
          Every recipe, one place
        </Text>
        <Text color="$textMuted" textAlign="center">
          Save, tweak, and cook your recipes without searching for them again.
        </Text>
      </HeroStack>
    </YStack>
  ),
};
