import type { Meta, StoryObj } from "@storybook/react";
import { TextField } from "./TextField.js";

const meta: Meta<typeof TextField> = {
  title: "Components/TextField",
  component: TextField,
  argTypes: {
    label: { control: "text" },
    error: { control: "text" },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    secureTextEntry: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Default: Story = {
  args: { label: "Recipe name", placeholder: "e.g. Weeknight pasta" },
};

export const WithError: Story = {
  args: {
    label: "Token name",
    placeholder: "e.g. CI deploy",
    error: "Name is required.",
  },
};

export const Password: Story = {
  args: {
    label: "API key",
    placeholder: "Paste your key",
    secureTextEntry: true,
  },
};

export const Disabled: Story = {
  args: { label: "Servings", placeholder: "4", disabled: true },
};

export const WithoutLabel: Story = {
  args: { placeholder: "Search recipes…", "aria-label": "Search recipes" },
};
