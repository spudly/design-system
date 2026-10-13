import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ToggleChipGroup } from "./ToggleChipGroup.js";

const meta: Meta<typeof ToggleChipGroup> = {
  title: "Components/ToggleChipGroup",
  component: ToggleChipGroup,
  argTypes: {
    mode: {
      control: "select",
      options: ["single", "multiple"],
    },
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof ToggleChipGroup>;

const tagOptions = [
  { value: "chicken", label: "Chicken" },
  { value: "pasta", label: "Pasta" },
  { value: "quick", label: "Quick" },
  { value: "vegetarian", label: "Vegetarian" },
];

export const SingleSelect: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>("pasta");
    return (
      <ToggleChipGroup
        label="Pick one"
        mode="single"
        options={tagOptions}
        value={value}
        onChange={(v) => setValue(v === value ? undefined : v)}
      />
    );
  },
};

export const MultiSelect: Story = {
  render: () => {
    const [values, setValues] = useState<string[]>(["chicken"]);
    return (
      <ToggleChipGroup
        label="Tags"
        mode="multiple"
        options={tagOptions}
        values={values}
        onChange={(v) =>
          setValues(values.includes(v) ? values.filter((x) => x !== v) : [...values, v])
        }
      />
    );
  },
};

export const NoneSelected: Story = {
  render: () => {
    const [values, setValues] = useState<string[]>([]);
    return (
      <ToggleChipGroup
        mode="multiple"
        options={tagOptions}
        values={values}
        onChange={(v) =>
          setValues(values.includes(v) ? values.filter((x) => x !== v) : [...values, v])
        }
      />
    );
  },
};
