import type { Meta, StoryObj } from "@storybook/react";
import { XStack } from "tamagui";
import { Spinner } from "./Spinner.js";

const meta: Meta<typeof Spinner> = {
  title: "Components/Spinner",
  component: Spinner,
  argTypes: {
    size: {
      control: "select",
      options: ["small", "large"],
    },
    label: { control: "text" },
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  args: {},
};

export const Large: Story = {
  args: { size: "large", label: "Loading recipes" },
};

export const Determinate: Story = {
  args: { value: 65, label: "Uploading photo" },
};

export const DeterminateComplete: Story = {
  args: { value: 100, label: "Upload complete" },
};

export const DeterminateLarge: Story = {
  args: { value: 30, size: "large", label: "Generating recipe" },
};

/** The determinate ring across its range: empty track, partial arcs
 * growing clockwise from the top, and the full ring at 100. */
export const DeterminateStates: Story = {
  render: () => (
    <XStack gap={16} alignItems="center">
      <Spinner value={0} label="Progress 0 percent" />
      <Spinner value={25} label="Progress 25 percent" />
      <Spinner value={50} label="Progress 50 percent" />
      <Spinner value={75} label="Progress 75 percent" />
      <Spinner value={100} label="Progress 100 percent" />
    </XStack>
  ),
};
