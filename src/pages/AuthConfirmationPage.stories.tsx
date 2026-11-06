import { eciperayFooterFixture } from "./fixtures.js";
import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { AuthConfirmationPage } from "./AuthConfirmationPage.js";

const meta: Meta<typeof AuthConfirmationPage> = {
  title: "Pages/Eciperay/AuthConfirmationPage",
  component: AuthConfirmationPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof AuthConfirmationPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

export const CheckYourEmail: Story = {
  render: () => (
    <Viewport>
      <AuthConfirmationPage
        footer={eciperayFooterFixture}
        title="Check your email"
        body="We sent a password reset link to your email address. It expires in one hour."
        backLabel="Back to sign in"
        backHref="/login"
      />
    </Viewport>
  ),
};

export const WithoutBackLink: Story = {
  render: () => (
    <Viewport>
      <AuthConfirmationPage
        footer={eciperayFooterFixture}
        title="You're on the list"
        body="Thanks for confirming your account. You can close this page."
      />
    </Viewport>
  ),
};
