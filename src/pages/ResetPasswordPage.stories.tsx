import type { ReactNode } from "react";
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

export const Filled: Story = {
  render: () => (
    <Viewport>
      <ResetPasswordPage
        password={filledValue}
        onPasswordChange={() => undefined}
        onSubmit={() => undefined}
      />
    </Viewport>
  ),
};
