import type { Meta, StoryObj } from "@storybook/react";
import { AccordionSection } from "./AccordionSection.js";
import { Text } from "./Text.js";

const meta: Meta<typeof AccordionSection> = {
  title: "Components/AccordionSection",
  component: AccordionSection,
  argTypes: {
    title: { control: "text" },
    defaultOpen: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof AccordionSection>;

const CONTENT =
  "This is an accordion section: its body expands and collapses under its header. ".repeat(3);

export const Closed: Story = {
  args: { title: "Section title", children: <Text>{CONTENT}</Text> },
};

export const Open: Story = {
  args: { title: "Section title", defaultOpen: true, children: <Text>{CONTENT}</Text> },
};

export const LongTitle: Story = {
  args: {
    title: "A much longer section title that wraps beside the chevron",
    children: <Text>{CONTENT}</Text>,
  },
};
