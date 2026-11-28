import type { Meta, StoryObj } from "@storybook/react";

import { PrevNextNav } from "./PrevNextNav.js";

const meta: Meta<typeof PrevNextNav> = {
  title: "Widgets/Actions & Navigation/PrevNextNav",
  component: PrevNextNav,
  argTypes: {
    backLabel: { control: "text" },
    nextLabel: { control: "text" },
    backDisabled: { control: "boolean" },
    nextDisabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof PrevNextNav>;

export const Both: Story = {
  args: { onBack: () => { /* noop */ }, onNext: () => { /* noop */ } },
};

export const CustomLabels: Story = {
  args: {
    onBack: () => { /* noop */ },
    onNext: () => { /* noop */ },
    backLabel: "Previous step",
    nextLabel: "Start cooking",
  },
};

export const NextOnly: Story = {
  args: { onNext: () => { /* noop */ }, nextLabel: "Continue" },
};

export const NextDisabled: Story = {
  args: { onBack: () => { /* noop */ }, onNext: () => { /* noop */ }, nextDisabled: true },
};

export const BackDisabled: Story = {
  args: { onBack: () => { /* noop */ }, onNext: () => { /* noop */ }, backDisabled: true },
};
