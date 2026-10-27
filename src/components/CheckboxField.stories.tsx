import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CheckboxField } from "./CheckboxField.js";
import { Text } from "./Text.js";
import { TextLink } from "./TextLink.js";

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

export const WithRichDescription: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <CheckboxField
        label="Publishing consent"
        description={
          <>
            I understand this recipe may be viewed without signing in and I agree to the{" "}
            <TextLink onPress={() => {}}>Privacy Policy</TextLink>.
          </>
        }
        checked={checked}
        onCheckedChange={setChecked}
      />
    );
  },
};

export const WithChildren: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <CheckboxField
        label="Show feedback shortcut"
        description="Adds a Feedback tab so you can send product feedback."
        checked={checked}
        onCheckedChange={setChecked}
      >
        <Text variant="hint">
          Feedback is unavailable because analytics is not configured in this environment.
        </Text>
      </CheckboxField>
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
