import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button.js";
import { FormScreenLayout } from "./FormScreenLayout.js";
import { FormSubmit } from "./FormSubmit.js";
import { TextField } from "./TextField.js";

const meta: Meta<typeof FormSubmit> = {
  title: "Components/FormSubmit",
  component: FormSubmit,
};

export default meta;
type Story = StoryObj<typeof FormSubmit>;

export const Default: Story = {
  render: () => (
    <FormScreenLayout>
      <TextField label="Title" value="Weeknight dinners" onChangeText={() => {}} />
      <FormSubmit>
        <Button variant="primary" accessibilityLabel="Save meal" onPress={() => {}}>
          Save meal
        </Button>
      </FormSubmit>
    </FormScreenLayout>
  ),
};
