import type { Meta, StoryObj } from "@storybook/react";
import { storyImageSquare } from "../storyFixtures.js";
import { Avatar } from "./Avatar.js";

const meta: Meta<typeof Avatar> = {
  title: "Components/Avatar",
  component: Avatar,
  argTypes: {
    src: { control: "text" },
    name: { control: "text" },
    size: { control: { type: "range", min: 24, max: 96, step: 4 } },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Initials: Story = {
  args: { name: "Stephen Sorensen" },
};

export const SingleName: Story = {
  args: { name: "Butterscotch" },
};

export const Large: Story = {
  args: { name: "Stephen Sorensen", size: 72 },
};

export const WithImage: Story = {
  args: {
    name: "Stephen Sorensen",
    // Inline fixture, never a remote URL — story images must
    // render identically on every run (issue #352).
    src: storyImageSquare,
  },
};
