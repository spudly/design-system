import { eciperayFooterFixture } from "../shared/fixtures.js";
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "../../widgets/data/Text.js";
import { SignUpPage } from "./SignUpPage.js";

const meta: Meta<typeof SignUpPage> = {
  title: "Pages/Eciperay/SignUpPage",
  component: SignUpPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof SignUpPage>;

const filledValue = "correct horse battery";

/**
 * The legal notice is copy data (#686): hosts pass their
 * legal text as text/link spans. The story's fixture mirrors
 * the app's inline variant ("By creating an account you agree
 * to our Terms of Service and Privacy Policy.").
 */
const legalNoticeFixture = [
  { type: "text", text: "By creating an account you agree to our " },
  { type: "link", label: "Terms of Service", href: "/terms" },
  { type: "text", text: " and " },
  { type: "link", label: "Privacy Policy", href: "/privacy" },
  { type: "text", text: "." },
] as const;

/**
 * Interactive wrapper: the fields are stateful so the story
 * can be typed in, and submit switches the page to its
 * loading state — so Enter-to-submit (#255) and the
 * held-while-loading guard are observable in Storybook
 * (submit shows "Creating account…" and disables the button; the "Submissions: N"
 * readout under the page counts each submit).
 */
function Interactive({
  error,
  emailError,
  initialLoading = false,
  initialPassword = filledValue,
}: {
  error?: string;
  emailError?: string;
  initialLoading?: boolean;
  initialPassword?: string;
}) {
  const [displayName, setDisplayName] = useState("Sam Cook");
  const [email, setEmail] = useState("cook@example.com");
  const [password, setPassword] = useState(initialPassword);
  const [loading, setLoading] = useState(initialLoading);
  const [submissions, setSubmissions] = useState(0);
  return (
    <>
      <>
        <SignUpPage
          footer={eciperayFooterFixture}
          displayName={displayName}
          email={email}
          password={password}
          onDisplayNameChange={setDisplayName}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          loading={loading}
          error={error ?? null}
          emailError={emailError ?? null}
          onSubmit={() => {
            setSubmissions((count) => count + 1);
            setLoading(true);
          }}
          signInHref="/signin"
          legalNotice={[...legalNoticeFixture]}
        />
      </>
      <Text>Submissions: {submissions}</Text>
    </>
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

export const WithEmailError: Story = {
  render: () => <Interactive emailError="Enter a valid email address." />,
};

export const Loading: Story = {
  render: () => <Interactive initialLoading />,
};
