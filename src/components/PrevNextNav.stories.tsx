import type { Meta, StoryObj } from "@storybook/react";
import { PrevNextNav } from "./PrevNextNav.js";

const meta: Meta<typeof PrevNextNav> = {
  title: "Components/PrevNextNav",
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
  args: { onBack: () => {}, onNext: () => {} },
};

export const CustomLabels: Story = {
  args: {
    onBack: () => {},
    onNext: () => {},
    backLabel: "Previous step",
    nextLabel: "Start cooking",
  },
};

export const NextOnly: Story = {
  args: { onNext: () => {}, nextLabel: "Continue" },
};

export const NextDisabled: Story = {
  args: { onBack: () => {}, onNext: () => {}, nextDisabled: true },
};

export const BackDisabled: Story = {
  args: { onBack: () => {}, onNext: () => {}, backDisabled: true },
};
