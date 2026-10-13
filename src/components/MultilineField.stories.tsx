import type { Meta, StoryObj } from "@storybook/react";
import { MultilineField } from "./MultilineField.js";

const meta: Meta<typeof MultilineField> = {
  title: "Components/MultilineField",
  component: MultilineField,
  argTypes: {
    label: { control: "text" },
    error: { control: "text" },
    placeholder: { control: "text" },
    numberOfLines: { control: { type: "number", min: 2, max: 10, step: 1 } },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof MultilineField>;

export const Default: Story = {
  args: {
    label: "Recipe notes",
    placeholder: "Anything worth remembering next time…",
  },
};

export const WithError: Story = {
  args: {
    label: "Feedback",
    placeholder: "Tell us what went wrong…",
    error: "Please describe the issue.",
  },
};

export const Tall: Story = {
  args: {
    label: "Import text",
    placeholder: "Paste the recipe text here…",
    numberOfLines: 8,
  },
};
