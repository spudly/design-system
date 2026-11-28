import type { Meta, StoryObj } from "@storybook/react";

import { Text } from "../data/Text.js";

import { Col } from "./Col.js";

const meta: Meta<typeof Col> = {
  title: "Widgets/Layout & Structure/Col",
  component: Col,
};

export default meta;
type Story = StoryObj<typeof Col>;

export const Default: Story = {
  render: () => (
    <Col gap="m">
      <Text>First block</Text>
      <Text>Second block</Text>
      <Text>Third block</Text>
    </Col>
  ),
};

export const Centered: Story = {
  render: () => (
    <Col center middle gap="s">
      <Text>Centered one</Text>
      <Text>Centered two</Text>
    </Col>
  ),
};

export const Padded: Story = {
  render: () => (
    <Col px="xl" py="s" gap="s">
      <Text>Padded block one</Text>
      <Text>Padded block two</Text>
    </Col>
  ),
};

export const Growing: Story = {
  render: () => (
    <Col grow shrink gap="s">
      <Text>Grows to fill its parent</Text>
      <Text>Second block</Text>
    </Col>
  ),
};
