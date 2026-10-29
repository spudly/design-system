import type { Meta, StoryObj } from "@storybook/react";
import { FormHeading } from "./FormHeading.js";
import { FormScreenLayout } from "./FormScreenLayout.js";
import { TextField } from "./TextField.js";

const meta: Meta<typeof FormHeading> = {
  title: "Components/FormHeading",
  component: FormHeading,
};

export default meta;
type Story = StoryObj<typeof FormHeading>;

export const Default: Story = {
  render: () => (
    <FormScreenLayout>
      <FormHeading>Meal plan</FormHeading>
      <TextField label="Title" value="" onChangeText={() => {}} placeholder="Plan title" />
    </FormScreenLayout>
  ),
};
