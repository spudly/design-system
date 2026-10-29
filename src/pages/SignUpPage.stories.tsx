import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { Text } from "../components/Text.js";
import { TextLink } from "../components/TextLink.js";
import { SignUpPage } from "./SignUpPage.js";

const meta: Meta<typeof SignUpPage> = {
  title: "Pages/Eciperay/SignUpPage",
  component: SignUpPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof SignUpPage>;

const filledValue = "correct horse battery";

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

/**
 * The legal notice is a slot: hosts render their LegalLinks
 * into it. The story's stand-in mirrors the app's inline
 * variant ("By creating an account you agree to our Terms of
 * Service and Privacy Policy.").
 */
function LegalNotice() {
  return (
    <Text variant="hint">
      By creating an account you agree to our{" "}
      <TextLink onPress={() => undefined}>Terms of Service</TextLink> and{" "}
      <TextLink onPress={() => undefined}>Privacy Policy</TextLink>.
    </Text>
  );
}

/**
 * Interactive wrapper: the fields are stateful so the story
 * can be typed in, and submit switches the page to its
 * loading state — so Enter-to-submit (#255) and the
 * held-while-loading guard are observable in Storybook
 * (submit shows "Creating account…" and disables the button).
 */
function Interactive({
  error,
  initialLoading = false,
  initialPassword = filledValue,
}: {
  error?: string;
  initialLoading?: boolean;
  initialPassword?: string;
}) {
  const [displayName, setDisplayName] = useState("Sam Cook");
  const [email, setEmail] = useState("cook@example.com");
  const [password, setPassword] = useState(initialPassword);
  const [loading, setLoading] = useState(initialLoading);
  return (
    <Viewport>
      <SignUpPage
        displayName={displayName}
        email={email}
        password={password}
        onDisplayNameChange={setDisplayName}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        loading={loading}
        error={error ?? null}
        onSubmit={() => setLoading(true)}
        signInHref="/signin"
        legalNotice={<LegalNotice />}
      />
    </Viewport>
  );
}

export const Filled: Story = {
  render: () => <Interactive />,
};

export const WithError: Story = {
  // The error is a password-length error, so the story's
  // initial password is genuinely too short.
  render: () => (
    <Interactive error="Password must be at least 8 characters." initialPassword="short" />
  ),
};

export const Loading: Story = {
  render: () => <Interactive initialLoading />,
};
