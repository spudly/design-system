import type { Meta, StoryObj } from "@storybook/react";
import { SearchHelpPopover, type SearchHelpEntry } from "./SearchHelpPopover.js";

const meta: Meta<typeof SearchHelpPopover> = {
  title: "Widgets/Overlays & Disclosure/SearchHelpPopover",
  component: SearchHelpPopover,
};

export default meta;
type Story = StoryObj<typeof SearchHelpPopover>;

// Fixture data only: a host's search syntax described as data
// (the widget bakes in no search language of its own).
const ENTRIES: SearchHelpEntry[] = [
  { syntax: "title:", description: "Match words in the title, e.g. title:soup." },
  { syntax: "desc:", description: "Match words in the description." },
  { syntax: "ingredient:", description: "Match recipes using an ingredient." },
  { syntax: "tag:", description: "Match a tag." },
  { syntax: '"quoted phrase"', description: "Match the exact phrase." },
  { syntax: "-ingredient:", description: "Exclude recipes using an ingredient." },
  { syntax: "status: / is:", description: "Filter by status, e.g. is:favorite." },
  { syntax: "calories:<600", description: "Match under a calorie limit." },
];

export const Closed: Story = {
  render: () => (
    <SearchHelpPopover
      label="Search syntax"
      title="Search syntax"
      intro="Combine these in the search field to narrow results."
      entries={ENTRIES}
    />
  ),
};

export const Open: Story = {
  render: () => (
    <SearchHelpPopover
      label="Search syntax"
      title="Search syntax"
      intro="Combine these in the search field to narrow results."
      entries={ENTRIES}
      defaultOpen
    />
  ),
};

export const NoIntro: Story = {
  render: () => <SearchHelpPopover label="Search syntax" title="Search syntax" entries={ENTRIES} defaultOpen />,
};
