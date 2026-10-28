import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Accordion, type AccordionItem } from "./Accordion.js";
import { Text } from "./Text.js";

const meta: Meta<typeof Accordion> = {
  title: "Components/Accordion",
  component: Accordion,
};

export default meta;
type Story = StoryObj<typeof Accordion>;

const CONTENT = "This is an accordion section. ".repeat(6);

const faqSections: AccordionItem[] = [
  { value: "what", title: "What is this?", content: <Text>{CONTENT}</Text> },
  { value: "how", title: "How does it work?", content: <Text>{CONTENT}</Text> },
  { value: "when", title: "When should I use it?", content: <Text>{CONTENT}</Text> },
  { value: "cost", title: "What does it cost?", content: <Text>{CONTENT}</Text> },
  { value: "help", title: "Where can I get help?", content: <Text>{CONTENT}</Text> },
];

export const Default: Story = {
  render: () => <Accordion sections={faqSections} />,
};

export const FirstOpen: Story = {
  render: () => <Accordion sections={faqSections} defaultOpenValue="what" />,
};

function ControlledDemo() {
  const [openValue, setOpenValue] = useState<string | null>("how");
  return (
    <YStack gap={tokens.spacing[3]}>
      <Accordion sections={faqSections} openValue={openValue} onOpenValueChange={setOpenValue} />
      <Text variant="hint">Open section: {openValue ?? "none"}</Text>
    </YStack>
  );
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
};

export const SingleSection: Story = {
  render: () => (
    <Accordion
      sections={[{ value: "only", title: "The only section", content: <Text>{CONTENT}</Text> }]}
    />
  ),
};
