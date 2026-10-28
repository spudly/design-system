import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
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
 * (submit shows "Sending…" and disables the button).
 */
function Interactive({ initialLoading = false }: { initialLoading?: boolean }) {
  const [email, setEmail] = useState("cook@example.com");
  const [loading, setLoading] = useState(initialLoading);
  return (
    <Viewport>
      <ForgotPasswordPage
        email={email}
        onEmailChange={setEmail}
        loading={loading}
        onSubmit={() => setLoading(true)}
        onBackPress={() => undefined}
      />
    </Viewport>
  );
}

export const Filled: Story = {
  render: () => <Interactive />,
};

export const Loading: Story = {
  render: () => <Interactive initialLoading />,
};
