import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { Button } from "./Button.js";
import { ButtonRow } from "./ButtonRow.js";
import { LabeledGroup } from "./LabeledGroup.js";
import { RevertAction } from "./RevertAction.js";

const meta: Meta<typeof LabeledGroup> = {
  title: "Components/LabeledGroup",
  component: LabeledGroup,
};

export default meta;
type Story = StoryObj<typeof LabeledGroup>;

const tagOptions = [
  { value: "weeknight", label: "Weeknight" },
  { value: "freezer", label: "Freezer-friendly" },
  { value: "kid", label: "Kid-approved" },
];

function TagsDemo({ withAction = false }: { withAction?: boolean }) {
  const [values, setValues] = useState<string[]>(["weeknight"]);
  const toggle = (value: string) => {
    setValues((current) =>
      current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    );
  };
  return (
    <YStack maxWidth={430}>
      <LabeledGroup
        label="Tags"
        action={
          withAction ? (
            <RevertAction label="Weeknight, Kid-approved" onPress={() => {}} />
          ) : undefined
        }
      >
        <ButtonRow>
          {tagOptions.map((option) => (
            <Button
              key={option.value}
              variant="secondary"
              size="sm"
              selected={values.includes(option.value)}
              onPress={() => {
                toggle(option.value);
              }}
            >
              {option.label}
            </Button>
          ))}
        </ButtonRow>
      </LabeledGroup>
    </YStack>
  );
}

export const Default: Story = {
  render: () => <TagsDemo />,
};

export const WithAction: Story = {
  render: () => <TagsDemo withAction />,
};
