import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SearchField } from "./SearchField.js";

const meta: Meta<typeof SearchField> = {
  title: "Components/SearchField",
  component: SearchField,
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof SearchField>;

function SearchDemo(args: Partial<ComponentProps<typeof SearchField>>) {
  const [value, setValue] = useState("pasta");
  return (
    <div style={{ maxWidth: 360 }}>
      <SearchField value={value} onChangeText={setValue} {...args} />
    </div>
  );
}

export const WithValue: Story = {
  render: (args) => <SearchDemo label="Search recipes" placeholder="Search recipes…" {...args} />,
};

export const Empty: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div style={{ maxWidth: 360 }}>
        <SearchField
          label="Search verses"
          placeholder="Search by reference or text…"
          value={value}
          onChangeText={setValue}
        />
      </div>
    );
  },
};

export const WithoutLabel: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div style={{ maxWidth: 360 }}>
        <SearchField
          aria-label="Search recipes"
          placeholder="Search recipes…"
          value={value}
          onChangeText={setValue}
        />
      </div>
    );
  },
};
