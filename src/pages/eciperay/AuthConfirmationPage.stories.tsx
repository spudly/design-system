import { eciperayFooterFixture } from "../shared/fixtures.js";
import type { Meta, StoryObj } from "@storybook/react";
import { AuthConfirmationPage } from "./AuthConfirmationPage.js";

const meta: Meta<typeof AuthConfirmationPage> = {
  title: "Pages/Eciperay/AuthConfirmationPage",
  component: AuthConfirmationPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof AuthConfirmationPage>;

export const CheckYourEmail: Story = {
  render: () => (
    <>
      <AuthConfirmationPage
        footer={eciperayFooterFixture}
        title="Check your email"
        body="We sent a password reset link to your email address. It expires in one hour."
        backLabel="Back to sign in"
        backHref="/login"
      />
    </>
  ),
};

export const WithoutBackLink: Story = {
  render: () => (
    <>
      <AuthConfirmationPage
        footer={eciperayFooterFixture}
        title="You're on the list"
        body="Thanks for confirming your account. You can close this page."
      />
    </>
  ),
};
