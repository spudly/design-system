import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "./Text.js";
import { Row } from "./Row.js";

const meta: Meta<typeof Row> = {
  title: "Widgets/Row",
  component: Row,
};

export default meta;
type Story = StoryObj<typeof Row>;

export const Default: Story = {
  render: () => (
    <Row gap="m">
      <Text>First</Text>
      <Text>Second</Text>
      <Text>Third</Text>
    </Row>
  ),
};

export const MiddleBetween: Story = {
  render: () => (
    <Row middle between>
      <Text>Leading</Text>
      <Text>Trailing</Text>
    </Row>
  ),
};

export const Padded: Story = {
  render: () => (
    <Row p="l" gap="m">
      <Text>Padded first</Text>
      <Text>Padded second</Text>
    </Row>
  ),
};

export const Wrapping: Story = {
  render: () => (
    <Row middle wrap gap="s">
      <Text>One</Text>
      <Text>Two</Text>
      <Text>Three</Text>
      <Text>Four</Text>
    </Row>
  ),
};
