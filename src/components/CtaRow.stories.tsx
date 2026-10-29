import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button.js";
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
      <Button href="/discover" variant="primary">
        Browse public recipes
      </Button>
      <Button href="/signup" variant="secondary">
        Create account
      </Button>
      <Button href="/get-app" variant="secondary">
        Get the app
      </Button>
    </CtaRow>
  ),
};
