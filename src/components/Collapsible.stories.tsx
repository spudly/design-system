import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "./Button.js";
import { Collapsible } from "./Collapsible.js";
import { Text } from "./Text.js";

const meta: Meta<typeof Collapsible> = {
  title: "Components/Collapsible",
  component: Collapsible,
};

export default meta;
type Story = StoryObj<typeof Collapsible>;

const CONTENT =
  "Collapsible content: this region expands and collapses with an animated height. ".repeat(4);

export const Closed: Story = {
  render: () => (
    <Collapsible isOpen={false}>
      <Text>{CONTENT}</Text>
    </Collapsible>
  ),
};

export const Open: Story = {
  render: () => (
    <Collapsible isOpen>
      <Text>{CONTENT}</Text>
    </Collapsible>
  ),
};

function InteractiveDemo() {
  const [isOpen, setOpen] = useState(false);
  return (
    <YStack gap={tokens.spacing[2]}>
      <Button
        variant="secondary"
        alignSelf="flex-start"
        onPress={() => {
          setOpen(!isOpen);
        }}
      >
        Toggle
      </Button>
      <Collapsible isOpen={isOpen}>
        <Text>{CONTENT}</Text>
      </Collapsible>
    </YStack>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveDemo />,
};
