import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { ResetPasswordForm } from "./ResetPasswordForm.js";

const meta: Meta<typeof ResetPasswordForm> = {
  title: "Components/ResetPasswordForm",
  component: ResetPasswordForm,
};

export default meta;
type Story = StoryObj<typeof ResetPasswordForm>;

function Controlled({ loading = false, error }: { loading?: boolean; error?: string | null }) {
  const [password, setPassword] = useState("");
  return (
    <YStack maxWidth={430}>
      <ResetPasswordForm
        password={password}
        onPasswordChange={setPassword}
        loading={loading}
        error={error}
        onSubmit={() => undefined}
      />
    </YStack>
  );
}

export const Default: Story = {
  render: () => <Controlled />,
};

export const WithError: Story = {
  render: () => <Controlled error="That reset link has expired." />,
};

export const Loading: Story = {
  render: () => <Controlled loading />,
};
