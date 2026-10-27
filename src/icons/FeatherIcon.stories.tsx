import type { Meta, StoryObj } from "@storybook/react";
import { XStack, YStack } from "tamagui";
import { Text } from "../components/Text.js";
import { FeatherIcon, featherIconNames } from "./FeatherIcon.js";

const meta: Meta<typeof FeatherIcon> = {
  title: "Components/FeatherIcon",
  component: FeatherIcon,
  argTypes: {
    name: { control: "select", options: [...featherIconNames] },
    size: { control: "number" },
    color: { control: "color" },
    strokeWidth: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof FeatherIcon>;

export const Default: Story = {
  args: { name: "printer", size: 24, color: "#333333" },
};

export const Share: Story = {
  args: { name: "share-2", size: 24, color: "#333333" },
};

export const Large: Story = {
  args: { name: "home", size: 48, color: "#333333" },
};

/** Every icon in the set, at Feather's native 24px. */
export const AllIcons: Story = {
  render: () => (
    <XStack flexWrap="wrap" gap={16} maxWidth={520}>
      {featherIconNames.map((name) => (
        <YStack key={name} alignItems="center" gap={4} width={96}>
          <FeatherIcon name={name} size={24} color="#333333" />
          <Text variant="hint">{name}</Text>
        </YStack>
      ))}
    </XStack>
  ),
};
