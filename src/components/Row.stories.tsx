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
    variant: { control: "select", options: ["actions", "inline"] },
  },
};

export default meta;
type Story = StoryObj<typeof Row>;

export const Actions: Story = {
  render: (args) => (
    <YStack maxWidth={360} gap={16}>
      <Text>
        Tender chicken, garlic cream sauce with spinach and sun-dried tomatoes — the action bar
        below follows the content at the role's standard separation.
      </Text>
      <Row {...args} variant="actions">
        <Button>Shopping list</Button>
        <Button variant="secondary">Edit</Button>
      </Row>
    </YStack>
  ),
};

export const Inline: Story = {
  render: (args) => (
    <YStack maxWidth={430}>
      <Row {...args} variant="inline">
        <SearchField grow value="" onChangeText={() => {}} placeholder="e.g. Ether 12:27" />
        <Button>Search</Button>
      </Row>
    </YStack>
  ),
};
