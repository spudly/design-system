import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { XStack } from "tamagui";
import { tagColorNames } from "../themes/tagColors.js";
import { Badge } from "./Badge.js";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  argTypes: {
    tone: {
      control: "select",
      options: ["neutral", "info", "success", "warning", "danger"],
    },
    color: { control: "select", options: [...tagColorNames] },
    selected: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Neutral: Story = {
  args: { tone: "neutral", children: "Learning" },
};

export const Info: Story = {
  args: { tone: "info", children: "Syncing" },
};

export const Success: Story = {
  args: { tone: "success", children: "Memorized" },
};

export const Warning: Story = {
  args: { tone: "warning", children: "Due soon" },
};

export const Danger: Story = {
  args: { tone: "danger", children: "Overdue" },
};

export const ColoredTag: Story = {
  args: { color: "indigo", children: "Weeknight" },
};

export const ColoredTags: Story = {
  render: () => (
    <XStack gap={8}>
      <Badge color="indigo">Weeknight</Badge>
      <Badge color="amber">Comfort food</Badge>
    </XStack>
  ),
};

export const AllTones: Story = {
  render: () => (
    <XStack gap={8}>
      <Badge tone="neutral">Neutral</Badge>
      <Badge tone="info">Info</Badge>
      <Badge tone="success">Success</Badge>
      <Badge tone="warning">Warning</Badge>
      <Badge tone="danger">Danger</Badge>
    </XStack>
  ),
};

export const Selected: Story = {
  args: { selected: true, onPress: () => undefined, children: "Weeknight" },
};

export const SelectableDisabled: Story = {
  args: { selected: true, disabled: true, onPress: () => undefined, children: "Weeknight" },
};

export const Selectable: Story = {
  render: function SelectableStory() {
    const [values, setValues] = useState<string[]>(["weeknight"]);
    const options = [
      { value: "weeknight", label: "Weeknight" },
      { value: "comfort", label: "Comfort food" },
      { value: "freezer", label: "Freezer friendly" },
    ];
    return (
      <XStack gap={8}>
        {options.map((option) => (
          <Badge
            key={option.value}
            selected={values.includes(option.value)}
            onPress={() => {
              setValues((current) =>
                current.includes(option.value)
                  ? current.filter((value) => value !== option.value)
                  : [...current, option.value],
              );
            }}
          >
            {option.label}
          </Badge>
        ))}
      </XStack>
    );
  },
};
