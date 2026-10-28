import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { SignInPage } from "./SignInPage.js";

const meta: Meta<typeof SignInPage> = {
  title: "Pages/Eciperay/SignInPage",
  component: SignInPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof SignInPage>;

const filledValue = "correct horse battery";

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

/**
 * Interactive wrapper: the fields are stateful so the story
 * can be typed in, and submit switches the page to its
 * loading state — so Enter-to-submit (#255) and the
 * held-while-loading guard are observable in Storybook
 * (submit shows "Signing in…" and disables the button).
 */
function Interactive({
  error,
  initialLoading = false,
}: {
  error?: string;
  initialLoading?: boolean;
}) {
  const [email, setEmail] = useState("cook@example.com");
  const [password, setPassword] = useState(filledValue);
  const [loading, setLoading] = useState(initialLoading);
  return (
    <Viewport>
      <SignInPage
        email={email}
        password={password}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        loading={loading}
        error={error ?? null}
        onSubmit={() => setLoading(true)}
        onSignUpPress={() => undefined}
        onForgotPasswordPress={() => undefined}
      />
    </Viewport>
  );
}

export const Filled: Story = {
  render: () => <Interactive />,
};

export const WithError: Story = {
  render: () => <Interactive error="Invalid email or password." />,
};

export const Loading: Story = {
  render: () => <Interactive initialLoading />,
};
