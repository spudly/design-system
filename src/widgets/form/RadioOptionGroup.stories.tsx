import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { RadioOptionGroup } from "./RadioOptionGroup.js";

const meta: Meta<typeof RadioOptionGroup> = {
  title: "Widgets/Form/RadioOptionGroup",
  component: RadioOptionGroup,
  argTypes: {
    label: { control: "text" },
    error: { control: "text" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof RadioOptionGroup>;

const importOptions = [
  {
    value: "url",
    label: "From URL",
    description: "Import a recipe from a web link.",
  },
  {
    value: "text",
    label: "From text",
    description: "Paste recipe text to parse.",
  },
  {
    value: "manual",
    label: "Manual entry",
    description: "Type the recipe yourself.",
  },
];

export const Default: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Storybook mounts a story's render function as a component, so hooks here run under component rules; the rule cannot recognize anonymous render functions
    const [value, setValue] = useState("url");
    return (
      <RadioOptionGroup
        label="Add recipe"
        options={importOptions}
        value={value}
        onValueChange={setValue}
      />
    );
  },
};

export const WithoutDescriptions: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Storybook mounts a story's render function as a component, so hooks here run under component rules; the rule cannot recognize anonymous render functions
    const [value, setValue] = useState("medium");
    return (
      <RadioOptionGroup
        label="Difficulty"
        options={[
          { value: "easy", label: "Easy" },
          { value: "medium", label: "Medium" },
          { value: "hard", label: "Hard" },
        ]}
        value={value}
        onValueChange={setValue}
      />
    );
  },
};

export const WithError: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Storybook mounts a story's render function as a component, so hooks here run under component rules; the rule cannot recognize anonymous render functions
    const [value, setValue] = useState("");
    return (
      <RadioOptionGroup
        label="Add recipe"
        options={importOptions}
        value={value}
        onValueChange={setValue}
        error="Please choose an import method."
      />
    );
  },
};

export const Disabled: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Storybook mounts a story's render function as a component, so hooks here run under component rules; the rule cannot recognize anonymous render functions
    const [value, setValue] = useState("url");
    return (
      <RadioOptionGroup
        label="Add recipe"
        options={importOptions}
        value={value}
        onValueChange={setValue}
        disabled
      />
    );
  },
};
