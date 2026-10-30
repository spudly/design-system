import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { CheckRow } from "./CheckRow.js";

const meta: Meta<typeof CheckRow> = {
  title: "Components/CheckRow",
  component: CheckRow,
};

export default meta;
type Story = StoryObj<typeof CheckRow>;

export const Default: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <YStack maxWidth={430}>
        <CheckRow
          label="Olive oil"
          detail="2 tbsp · optional"
          checked={checked}
          onToggle={() => setChecked((value) => !value)}
        />
      </YStack>
    );
  },
};

export const Checked: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <CheckRow label="Eggs" detail="1 dozen" checked onToggle={() => {}} />
    </YStack>
  ),
};

export const LabelOnly: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <CheckRow label="Parchment paper" checked={false} onToggle={() => {}} />
    </YStack>
  ),
};
