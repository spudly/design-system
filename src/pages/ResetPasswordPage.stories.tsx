import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { ResetPasswordPage } from "./ResetPasswordPage.js";

const meta: Meta<typeof ResetPasswordPage> = {
  title: "Pages/Eciperay/ResetPasswordPage",
  component: ResetPasswordPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof ResetPasswordPage>;

const filledValue = "a brand new password";

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
 * (submit shows "Updating…" and disables the button).
 */
function Interactive({ initialLoading = false }: { initialLoading?: boolean }) {
  const [password, setPassword] = useState(filledValue);
  const [loading, setLoading] = useState(initialLoading);
  return (
    <Viewport>
      <ResetPasswordPage
        password={password}
        onPasswordChange={setPassword}
        loading={loading}
        onSubmit={() => setLoading(true)}
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
