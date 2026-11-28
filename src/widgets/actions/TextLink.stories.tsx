import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";

import { Text } from "../data/Text.js";

import { TextLink } from "./TextLink.js";

const meta: Meta<typeof TextLink> = {
  title: "Widgets/Actions & Navigation/TextLink",
  component: TextLink,
  argTypes: {
    children: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof TextLink>;

export const Default: Story = {
  args: {
    children: "Forgot your password?",
    onPress: () => { /* noop */ },
  },
};

export const InProse: Story = {
  render: () => (
    <YStack maxWidth={420}>
      <Text variant="body">
        By continuing you agree to the{" "}
        <TextLink onPress={() => { /* noop */ }}>Terms of Service</TextLink> and{" "}
        <TextLink onPress={() => { /* noop */ }}>Privacy Policy</TextLink>. Questions?{" "}
        <TextLink onPress={() => { /* noop */ }}>Contact support</TextLink>.
      </Text>
    </YStack>
  ),
};

export const InHintText: Story = {
  render: () => (
    <YStack maxWidth={420}>
      <Text variant="hint">
        Tokens let scripts act on your behalf.{" "}
        <TextLink onPress={() => { /* noop */ }} fontSize={14}>
          Learn how tokens work
        </TextLink>
      </Text>
    </YStack>
  ),
};

export const Href: Story = {
  args: {
    children: "Forgot your password?",
    href: "/forgot-password",
  },
};

export const Muted: Story = {
  args: {
    children: "Forgot password?",
    href: "/forgot-password",
    tone: "muted",
  },
};

export const HrefInProse: Story = {
  render: () => (
    <YStack maxWidth={420}>
      <Text variant="body">
        By continuing you agree to the <TextLink href="/terms">Terms of Service</TextLink> and{" "}
        <TextLink href="/privacy">Privacy Policy</TextLink>. Questions?{" "}
        <TextLink href="/support">Contact support</TextLink>.
      </Text>
    </YStack>
  ),
};
