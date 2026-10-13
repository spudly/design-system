import type { Meta, StoryObj } from "@storybook/react";
import { VerseText } from "./VerseText.js";

const meta: Meta<typeof VerseText> = {
  title: "Components/VerseText",
  component: VerseText,
};

export default meta;
type Story = StoryObj<typeof VerseText>;

export const Default: Story = {
  render: (args) => (
    <VerseText {...args} style={{ maxWidth: 560 }}>
      The LORD is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me
      beside still waters. He restores my soul.
    </VerseText>
  ),
};
