import { eciperayFooterFixture } from "./fixtures.js";
import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { Text } from "../widgets/Text.js";
import { ForgotPasswordPage } from "./ForgotPasswordPage.js";

const meta: Meta<typeof ForgotPasswordPage> = {
  title: "Pages/Eciperay/ForgotPasswordPage",
  component: ForgotPasswordPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof ForgotPasswordPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

/**
 * Interactive wrapper: the field is stateful so the story
 * can be typed in, and submit switches the page to its
 * loading state — so Enter-to-submit (#255) and the
 * held-while-loading guard are observable in Storybook
 * (submit shows "Sending…" and disables the button; the "Submissions: N"
 * readout under the page counts each submit).
 */
function Interactive({
  emailError,
  initialLoading = false,
}: {
  emailError?: string;
  initialLoading?: boolean;
}) {
  const [email, setEmail] = useState("cook@example.com");
  const [loading, setLoading] = useState(initialLoading);
  const [submissions, setSubmissions] = useState(0);
  return (
    <>
      <Viewport>
        <ForgotPasswordPage
          footer={eciperayFooterFixture}
          email={email}
          onEmailChange={setEmail}
          loading={loading}
          emailError={emailError ?? null}
          onSubmit={() => {
            setSubmissions((count) => count + 1);
            setLoading(true);
          }}
          signInHref="/signin"
        />
      </Viewport>
      <Text>Submissions: {submissions}</Text>
    </>
  );
}

export const Filled: Story = {
  render: () => <Interactive />,
};

export const WithEmailError: Story = {
  render: () => <Interactive emailError="Enter a valid email address." />,
};

export const Loading: Story = {
  render: () => <Interactive initialLoading />,
};
