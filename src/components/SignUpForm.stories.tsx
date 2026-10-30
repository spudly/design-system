import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { SignUpForm } from "./SignUpForm.js";
import { Text } from "./Text.js";
import { TextLink } from "./TextLink.js";

const meta: Meta<typeof SignUpForm> = {
  title: "Components/SignUpForm",
  component: SignUpForm,
};

export default meta;
type Story = StoryObj<typeof SignUpForm>;

function Controlled({ loading = false, error }: { loading?: boolean; error?: string | null }) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <YStack maxWidth={430}>
      <SignUpForm
        displayName={displayName}
        email={email}
        password={password}
        onDisplayNameChange={setDisplayName}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        loading={loading}
        error={error}
        onSubmit={() => undefined}
        signInHref="#/sign-in"
        legalNotice={
          <Text textAlign="center" variant="hint">
            By continuing you accept the <TextLink href="#/terms">Terms</TextLink> and{" "}
            <TextLink href="#/privacy">Privacy Policy</TextLink>.
          </Text>
        }
      />
    </YStack>
  );
}

export const Default: Story = {
  render: () => <Controlled />,
};

export const WithError: Story = {
  render: () => <Controlled error="That email is already registered." />,
};

export const Loading: Story = {
  render: () => <Controlled loading />,
};
