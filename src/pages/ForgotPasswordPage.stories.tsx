import type { ReactNode } from "react";
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

export const Filled: Story = {
  render: () => (
    <Viewport>
      <ForgotPasswordPage
        email="cook@example.com"
        onEmailChange={() => undefined}
        onSubmit={() => undefined}
        onBackPress={() => undefined}
      />
    </Viewport>
  ),
};
