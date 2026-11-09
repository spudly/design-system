import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { ForgotPasswordForm } from "./ForgotPasswordForm.js";
import { Text } from "../widgets/Text.js";

const meta: Meta<typeof ForgotPasswordForm> = {
  title: "Views/ForgotPasswordForm",
  component: ForgotPasswordForm,
};

export default meta;
type Story = StoryObj<typeof ForgotPasswordForm>;

function Controlled({
  loading: initialLoading = false,
  error,
}: {
  loading?: boolean;
  error?: string | null;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(initialLoading);
  const [submissions, setSubmissions] = useState(0);
  return (
    <YStack maxWidth={430}>
      <ForgotPasswordForm
        email={email}
        onEmailChange={setEmail}
        loading={loading}
        error={error}
        onSubmit={() => {
          setSubmissions((count) => count + 1);
          setLoading(true);
        }}
        signInHref="#/sign-in"
      />
      <Text>Submissions: {submissions}</Text>
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
