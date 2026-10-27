import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Switch, type SwitchProps } from "./Switch.js";

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    checked: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

function SwitchDemo(props: Partial<SwitchProps>) {
  const [checked, setChecked] = useState(props.checked ?? false);
  return (
    <Switch label="Email notifications" checked={checked} onCheckedChange={setChecked} {...props} />
  );
}

export const Off: Story = {
  render: () => <SwitchDemo checked={false} description="Get a reminder when verses are due." />,
};

export const On: Story = {
  render: () => <SwitchDemo checked={true} description="Get a reminder when verses are due." />,
};

export const WithoutDescription: Story = {
  render: () => <SwitchDemo checked={false} label="Dark mode" />,
};
