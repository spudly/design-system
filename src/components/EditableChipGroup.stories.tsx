import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { EditableChipGroup } from "./EditableChipGroup.js";

const meta: Meta<typeof EditableChipGroup> = {
  title: "Components/EditableChipGroup",
  component: EditableChipGroup,
};

export default meta;
type Story = StoryObj<typeof EditableChipGroup>;

const SCALE_OPTIONS = [
  { value: "0.5", label: "½×" },
  { value: "1", label: "1×" },
  { value: "2", label: "2×" },
  { value: "3", label: "3×" },
];

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("1");
    return (
      <YStack maxWidth={430} padding="$4">
        <EditableChipGroup
          label="Scale"
          options={SCALE_OPTIONS}
          value={value}
          onChange={setValue}
          customLabel="Custom"
          customAccessibilityLabel="Custom scale"
          formatCustomValue={(custom) => `${custom}×`}
        />
      </YStack>
    );
  },
};

export const CustomSelected: Story = {
  render: () => {
    const [value, setValue] = useState("2.5");
    return (
      <YStack maxWidth={430} padding="$4">
        <EditableChipGroup
          label="Scale"
          options={SCALE_OPTIONS}
          value={value}
          onChange={setValue}
          customLabel="Custom"
          customAccessibilityLabel="Custom scale"
          formatCustomValue={(custom) => `${custom}×`}
        />
      </YStack>
    );
  },
};
