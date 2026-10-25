import type { ReactNode } from "react";
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

export const Filled: Story = {
  render: () => (
    <Viewport>
      <SignInPage
        email="cook@example.com"
        password={filledValue}
        onEmailChange={() => undefined}
        onPasswordChange={() => undefined}
        onSubmit={() => undefined}
        onSignUpPress={() => undefined}
        onForgotPasswordPress={() => undefined}
      />
    </Viewport>
  ),
};

export const WithError: Story = {
  render: () => (
    <Viewport>
      <SignInPage
        email="cook@example.com"
        password="wrong password"
        onEmailChange={() => undefined}
        onPasswordChange={() => undefined}
        error="Invalid email or password."
        onSubmit={() => undefined}
        onSignUpPress={() => undefined}
        onForgotPasswordPress={() => undefined}
      />
    </Viewport>
  ),
};
