import type { Meta, StoryObj } from "@storybook/react";
import { FormScreenLayout } from "./FormScreenLayout.js";
import { Button } from "./Button.js";
import { Text } from "./Text.js";
import { TextField } from "./TextField.js";

const meta: Meta<typeof FormScreenLayout> = {
  title: "Components/FormScreenLayout",
  component: FormScreenLayout,
};

export default meta;
type Story = StoryObj<typeof FormScreenLayout>;

export const SignIn: Story = {
  render: (args) => (
    <FormScreenLayout {...args}>
      <Text variant="heading">Welcome back</Text>
      <Text variant="hint">Sign in to continue to Eciperay.</Text>
      <TextField label="Email" placeholder="you@example.com" />
      <TextField label="Password" placeholder="••••••••" secureTextEntry />
      <Button>Sign in</Button>
    </FormScreenLayout>
  ),
};

export const TokenForm: Story = {
  render: (args) => (
    <FormScreenLayout {...args}>
      <Text variant="heading">New access token</Text>
      <TextField label="Token name" placeholder="e.g. CI deploy" />
      <Button variant="primary">Create token</Button>
      <Button variant="ghost">Cancel</Button>
    </FormScreenLayout>
  ),
};
