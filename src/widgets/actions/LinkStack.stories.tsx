import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { LinkStack } from "./LinkStack.js";
import { TextLink } from "./TextLink.js";

const meta: Meta<typeof LinkStack> = {
  title: "Widgets/Actions & Navigation/LinkStack",
  component: LinkStack,
};

export default meta;
type Story = StoryObj<typeof LinkStack>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <LinkStack>
        <TextLink href="https://example.com/privacy">Privacy Policy</TextLink>
        <TextLink href="https://example.com/terms">Terms of Service</TextLink>
        <TextLink href="https://example.com/licenses">Open Source Licenses</TextLink>
      </LinkStack>
    </YStack>
  ),
};
