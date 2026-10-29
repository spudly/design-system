import type { Meta, StoryObj } from "@storybook/react";
import { CtaLink } from "./CtaLink.js";
import { CtaRow } from "./CtaRow.js";

const meta: Meta<typeof CtaRow> = {
  title: "Components/CtaRow",
  component: CtaRow,
};

export default meta;
type Story = StoryObj<typeof CtaRow>;

export const Default: Story = {
  render: () => (
    <CtaRow>
      <CtaLink cta={{ label: "Browse public recipes", href: "/discover" }} variant="primary" />
      <CtaLink cta={{ label: "Create account", href: "/signup" }} variant="secondary" />
      <CtaLink cta={{ label: "Get the app", href: "/get-app" }} variant="secondary" />
    </CtaRow>
  ),
};
