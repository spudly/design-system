import type { Meta, StoryObj } from "@storybook/react";
import { ProseDocument, type ProseSection } from "./ProseDocument.js";

const meta: Meta<typeof ProseDocument> = {
  title: "Components/ProseDocument",
  component: ProseDocument,
};

export default meta;
type Story = StoryObj<typeof ProseDocument>;

const sections: ProseSection[] = [
  {
    title: "What we collect",
    blocks: [
      {
        type: "paragraph",
        spans: [
          { type: "text", text: "We collect the recipes you save and the " },
          { type: "strong", text: "account details" },
          { type: "text", text: " you give us. Questions go to " },
          { type: "link", label: "privacy@example.com", href: "mailto:privacy@example.com" },
          { type: "text", text: "." },
        ],
      },
      {
        type: "list",
        items: [
          [
            { type: "strong", text: "Recipes. " },
            { type: "text", text: "Titles, ingredients, and notes you enter." },
          ],
          [
            { type: "strong", text: "Usage. " },
            { type: "text", text: "Anonymous counts, keyed by " },
            { type: "code", text: "anon_id" },
            { type: "text", text: "." },
          ],
        ],
      },
    ],
  },
  {
    title: "Your choices",
    blocks: [
      {
        type: "paragraph",
        spans: [{ type: "text", text: "You can export or delete your data at any time." }],
      },
    ],
  },
];

export const Default: Story = {
  args: {
    title: "Privacy Policy",
    lastUpdated: "July 22, 2026",
    sections,
  },
};
