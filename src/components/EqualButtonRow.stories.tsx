import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { Button } from "./Button.js";
import { Card } from "./Card.js";
import { EqualButtonRow } from "./EqualButtonRow.js";

const meta: Meta<typeof EqualButtonRow> = {
  title: "Components/EqualButtonRow",
  component: EqualButtonRow,
};

export default meta;
type Story = StoryObj<typeof EqualButtonRow>;

export const Default: Story = {
  render: () => (
    <YStack width={400} maxWidth="100%">
      <EqualButtonRow>
        <Button variant="primary">Get started</Button>
        <Button variant="secondary">Learn more</Button>
      </EqualButtonRow>
    </YStack>
  ),
};

export const ThreeButtons: Story = {
  render: () => (
    <YStack width={400} maxWidth="100%">
      <EqualButtonRow>
        <Button variant="primary">Get started</Button>
        <Button variant="secondary">Save a copy</Button>
        <Button variant="secondary">Get the mobile app</Button>
      </EqualButtonRow>
    </YStack>
  ),
};

export const InCard: Story = {
  render: () => (
    <YStack width={400} maxWidth="100%">
      <Card>
        <EqualButtonRow>
          <Button variant="primary">Get started</Button>
          <Button variant="secondary">Save a copy</Button>
          <Button variant="secondary">Get the mobile app</Button>
        </EqualButtonRow>
      </Card>
    </YStack>
  ),
};
