import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { Button } from "./Button.js";
import { Row } from "./Row.js";
import { SearchField } from "./SearchField.js";
import { Text } from "./Text.js";

const meta: Meta<typeof Row> = {
  title: "Components/Row",
  component: Row,
  argTypes: {
    spacing: { control: "select", options: ["none", "sm", "md"] },
    align: { control: "select", options: ["start", "center", "end", "stretch"] },
    spaceBefore: { control: "select", options: ["none", "sm", "md"] },
  },
};

export default meta;
type Story = StoryObj<typeof Row>;

export const Actions: Story = {
  render: (args) => (
    <Row {...args}>
      <Button size="sm">Drill</Button>
      <Button size="sm" variant="secondary">
        Remove
      </Button>
    </Row>
  ),
};

export const Centered: Story = {
  render: (args) => (
    <YStack maxWidth={430}>
      <Row {...args} align="center">
        <SearchField value="" onChangeText={() => {}} placeholder="Search verses" grow />
        <Button>Search</Button>
      </Row>
    </YStack>
  ),
};

export const SpaceBefore: Story = {
  render: (args) => (
    <YStack maxWidth={360}>
      <Text variant="verse">For God so loved the world, that he gave his only begotten Son.</Text>
      <Row {...args} spaceBefore="sm">
        <Button size="sm">I remembered it</Button>
        <Button size="sm" variant="secondary">
          I forgot it
        </Button>
      </Row>
    </YStack>
  ),
};
