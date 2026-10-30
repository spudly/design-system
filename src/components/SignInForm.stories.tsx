import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { SignInForm } from "./SignInForm.js";

const meta: Meta<typeof SignInForm> = {
  title: "Components/SignInForm",
  component: SignInForm,
};

export default meta;
type Story = StoryObj<typeof SignInForm>;

function Controlled({
  loading = false,
  error,
  withLinks = true,
}: {
  loading?: boolean;
  error?: string | null;
  withLinks?: boolean;
}) {
  const [email, setEmail] = useState("cook@example.com");
  const [password, setPassword] = useState("");
  return (
    <YStack maxWidth={430}>
      <SignInForm
        email={email}
        password={password}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        loading={loading}
        error={error}
        onSubmit={() => undefined}
        signUpHref={withLinks ? "#/sign-up" : undefined}
        forgotPasswordHref={withLinks ? "#/forgot-password" : undefined}
      />
    </YStack>
  );
}

export const Default: Story = {
  render: () => <Controlled />,
};

export const WithError: Story = {
  render: () => <Controlled error="Incorrect email or password." />,
};

export const Loading: Story = {
  render: () => <Controlled loading />,
};

export const WithoutLinks: Story = {
  render: () => <Controlled withLinks={false} />,
};
