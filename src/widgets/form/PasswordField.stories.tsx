import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";

import { PasswordField } from "./PasswordField.js";

const meta: Meta<typeof PasswordField> = {
  title: "Widgets/Form/PasswordField",
  component: PasswordField,
  argTypes: {
    label: { control: "text" },
    error: { control: "text" },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof PasswordField>;

function PasswordDemo({ defaultRevealed = false }: { defaultRevealed?: boolean }) {
  const [value, setValue] = useState("correct horse battery staple");
  return (
    <YStack maxWidth={360}>
      <PasswordField
        label="Password"
        placeholder="Enter your password"
        value={value}
        onChangeText={setValue}
        autoComplete="password"
        showPasswordLabel="Show password"
        hidePasswordLabel="Hide password"
        defaultRevealed={defaultRevealed}
      />
    </YStack>
  );
}

/** Concealed (the default): the value is masked and the eye toggle offers to show it. */
export const Concealed: Story = {
  render: () => <PasswordDemo />,
};

/** Revealed: the value reads in plain text and the eye-off toggle offers to hide it. */
export const Revealed: Story = {
  render: () => <PasswordDemo defaultRevealed={true} />,
};

export const WithError: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Storybook mounts a story's render function as a component, so hooks here run under component rules; the rule cannot recognize anonymous render functions
    const [value, setValue] = useState("");
    return (
      <YStack maxWidth={360}>
        <PasswordField
          label="New password"
          placeholder="Choose a password"
          value={value}
          onChangeText={setValue}
          autoComplete="password-new"
          error="Password is required."
          showPasswordLabel="Show password"
          hidePasswordLabel="Hide password"
        />
      </YStack>
    );
  },
};
