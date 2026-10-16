import type { Meta, StoryObj } from "@storybook/react";
import { TextLink } from "./TextLink.js";
import { Text } from "./Text.js";

const meta: Meta<typeof TextLink> = {
  title: "Components/TextLink",
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
    onPress: () => undefined,
  },
};

export const InProse: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Text variant="body">
        By continuing you agree to the{" "}
        <TextLink onPress={() => undefined}>Terms of Service</TextLink> and{" "}
        <TextLink onPress={() => undefined}>Privacy Policy</TextLink>. Questions?{" "}
        <TextLink onPress={() => undefined}>Contact support</TextLink>.
      </Text>
    </div>
  ),
};

export const InHintText: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Text variant="hint">
        Tokens let scripts act on your behalf.{" "}
        <TextLink onPress={() => undefined} fontSize={14}>
          Learn how tokens work
        </TextLink>
      </Text>
    </div>
  ),
};
