import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CheckboxField } from "./CheckboxField.js";

const meta: Meta<typeof CheckboxField> = {
  title: "Components/CheckboxField",
  component: CheckboxField,
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    error: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof CheckboxField>;

export const Default: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <CheckboxField label="Email me new recipes" checked={checked} onCheckedChange={setChecked} />
    );
  },
};

export const WithDescription: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <CheckboxField
        label="Sync with Google Drive"
        description="Keep verses backed up and in sync across devices."
        checked={checked}
        onCheckedChange={setChecked}
      />
    );
  },
};

export const Checked: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);
    return (
      <CheckboxField label="2 tbsp olive oil" checked={checked} onCheckedChange={setChecked} />
    );
  },
};

export const WithError: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <CheckboxField
        label="I agree to the terms"
        error="You must accept the terms to continue."
        checked={checked}
        onCheckedChange={setChecked}
      />
    );
  },
};
