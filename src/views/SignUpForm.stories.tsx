import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { SignUpForm } from "./SignUpForm.js";
import { Text } from "../widgets/Text.js";
import { TextLink } from "../widgets/TextLink.js";

const meta: Meta<typeof SignUpForm> = {
  title: "Views/SignUpForm",
  component: SignUpForm,
};

export default meta;
type Story = StoryObj<typeof SignUpForm>;

/**
 * Controlled SignUpForm demo for the stories: holds the field
 * values and loading state internally (seeded from the
 * `loading` prop) and counts submissions in a readout, so a
 * tester can confirm a repeat submit while loading does not
 * submit again.
 */
function Controlled({
  loading: initialLoading = false,
  error,
}: {
  loading?: boolean;
  error?: string | null;
}) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(initialLoading);
  const [submissions, setSubmissions] = useState(0);
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
        onSubmit={() => {
          setSubmissions((count) => count + 1);
          setLoading(true);
        }}
        signInHref="#/sign-in"
        legalNotice={
          <Text textAlign="center" variant="hint">
            By continuing you accept the <TextLink href="#/terms">Terms</TextLink> and{" "}
            <TextLink href="#/privacy">Privacy Policy</TextLink>.
          </Text>
        }
      />
      <Text>Submissions: {submissions}</Text>
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
