import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { ResetPasswordForm } from "./ResetPasswordForm.js";
import { Text } from "../widgets/Text.js";

const meta: Meta<typeof ResetPasswordForm> = {
  title: "Views/ResetPasswordForm",
  component: ResetPasswordForm,
};

export default meta;
type Story = StoryObj<typeof ResetPasswordForm>;

/**
 * Controlled ResetPasswordForm demo for the stories: holds the field
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
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(initialLoading);
  const [submissions, setSubmissions] = useState(0);
  return (
    <YStack maxWidth={430}>
      <ResetPasswordForm
        password={password}
        onPasswordChange={setPassword}
        loading={loading}
        error={error}
        onSubmit={() => {
          setSubmissions((count) => count + 1);
          setLoading(true);
        }}
      />
      <Text>Submissions: {submissions}</Text>
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
