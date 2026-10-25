import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CommentItem } from "./CommentItem.js";

const meta: Meta<typeof CommentItem> = {
  title: "Components/CommentItem",
  component: CommentItem,
};

export default meta;
type Story = StoryObj<typeof CommentItem>;

export const Default: Story = {
  args: {
    authorName: "Chef Demo",
    body: "Doubled the garlic — excellent.",
  },
};

export const Stale: Story = {
  args: {
    authorName: "Chef Demo",
    body: "Worked well with the old sauce ratio.",
    isStale: true,
    staleHintLabel: "Based on an older version",
  },
};

export const OwnComment: Story = {
  render: () => {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState("Doubled the garlic — excellent.");
    return (
      <CommentItem
        authorName="Chef Demo"
        body="Doubled the garlic — excellent."
        canEdit
        canDelete
        isEditing={editing}
        editDraft={draft}
        onEditDraftChange={setDraft}
        onStartEdit={() => {
          setEditing(true);
        }}
        onCancelEdit={() => {
          setEditing(false);
        }}
        onSaveEdit={() => {
          setEditing(false);
        }}
        onDelete={() => {}}
      />
    );
  },
};
