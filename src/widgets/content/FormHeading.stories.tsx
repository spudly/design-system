import type { Meta, StoryObj } from "@storybook/react";

import { FormScreenLayout } from "../layout/FormScreenLayout.js";
import { TextField } from "../form/TextField.js";

import { FormHeading } from "./FormHeading.js";

const meta: Meta<typeof FormHeading> = {
  title: "Widgets/Content/FormHeading",
  component: FormHeading,
};

export default meta;
type Story = StoryObj<typeof FormHeading>;

export const Default: Story = {
  render: () => (
    <FormScreenLayout>
      <FormHeading>Meal plan</FormHeading>
      <TextField label="Title" value="" onChangeText={() => { /* noop */ }} placeholder="Plan title" />
    </FormScreenLayout>
  ),
};

export const WithSubtitle: Story = {
  render: () => (
    <FormScreenLayout>
      <FormHeading subtitle="Import a recipe from any web page">Import from URL</FormHeading>
      <TextField label="Recipe URL" value="" onChangeText={() => { /* noop */ }} placeholder="https://" />
    </FormScreenLayout>
  ),
};
