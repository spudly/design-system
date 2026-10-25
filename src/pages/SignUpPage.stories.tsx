import type { ReactNode } from "react";
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

export const Filled: Story = {
  render: () => (
    <Viewport>
      <SignUpPage
        displayName="Sam Cook"
        email="cook@example.com"
        password={filledValue}
        onDisplayNameChange={() => undefined}
        onEmailChange={() => undefined}
        onPasswordChange={() => undefined}
        onSubmit={() => undefined}
        onSignInPress={() => undefined}
        legalNotice={<LegalNotice />}
      />
    </Viewport>
  ),
};

export const WithError: Story = {
  render: () => (
    <Viewport>
      <SignUpPage
        displayName="Sam Cook"
        email="cook@example.com"
        password="short"
        onDisplayNameChange={() => undefined}
        onEmailChange={() => undefined}
        onPasswordChange={() => undefined}
        error="Password must be at least 8 characters."
        onSubmit={() => undefined}
        onSignInPress={() => undefined}
        legalNotice={<LegalNotice />}
      />
    </Viewport>
  ),
};
