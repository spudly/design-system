import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { eciperayFooterFixture } from "../shared/fixtures.js";
import { Text } from "../../widgets/data/Text.js";

import { ResetPasswordPage } from "./ResetPasswordPage.js";

const meta: Meta<typeof ResetPasswordPage> = {
  title: "Pages/Eciperay/ResetPasswordPage",
  component: ResetPasswordPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof ResetPasswordPage>;

const filledValue = "a brand new password";

/**
 * Interactive wrapper: the field is stateful so the story
 * can be typed in, and submit switches the page to its
 * loading state — so Enter-to-submit (#255) and the
 * held-while-loading guard are observable in Storybook
 * (submit shows "Updating…" and disables the button; the "Submissions: N"
 * readout under the page counts each submit).
 */
function Interactive({ initialLoading = false }: { initialLoading?: boolean }) {
  const [password, setPassword] = useState(filledValue);
  const [loading, setLoading] = useState(initialLoading);
  const [submissions, setSubmissions] = useState(0);
  return (
    <>
      <>
        <ResetPasswordPage
          footer={eciperayFooterFixture}
          password={password}
          onPasswordChange={setPassword}
          loading={loading}
          onSubmit={() => {
            setSubmissions((count) => count + 1);
            setLoading(true);
          }}
        />
      </>
      <Text>Submissions: {submissions}</Text>
    </>
  );
}

export const Filled: Story = {
  render: () => <Interactive />,
};

export const Loading: Story = {
  render: () => <Interactive initialLoading />,
};
