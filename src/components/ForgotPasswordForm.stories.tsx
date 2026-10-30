import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { ForgotPasswordForm } from "./ForgotPasswordForm.js";

const meta: Meta<typeof ForgotPasswordForm> = {
  title: "Components/ForgotPasswordForm",
  component: ForgotPasswordForm,
};

export default meta;
type Story = StoryObj<typeof ForgotPasswordForm>;

function Controlled({ loading = false, error }: { loading?: boolean; error?: string | null }) {
  const [email, setEmail] = useState("");
  return (
    <YStack maxWidth={430}>
      <ForgotPasswordForm
        email={email}
        onEmailChange={setEmail}
        loading={loading}
        error={error}
        onSubmit={() => undefined}
        signInHref="#/sign-in"
      />
    </YStack>
  );
}

export const Default: Story = {
  render: () => <Controlled />,
};

export const WithError: Story = {
  render: () => <Controlled error="No account uses that email." />,
};

export const Loading: Story = {
  render: () => <Controlled loading />,
};
