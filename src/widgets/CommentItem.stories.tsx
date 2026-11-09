import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { CommentItem } from "./CommentItem.js";

const meta: Meta<typeof CommentItem> = {
  title: "Widgets/CommentItem",
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

export const Loading: Story = {
  args: {
    authorName: "Chef Demo",
    body: "Doubled the garlic — excellent.",
    loading: true,
  },
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
// The body is long enough to wrap to two lines at this width —
// the skeleton's two body lines stand in for a wrapped comment,
// so the overlay pairs two loaded lines with two bones.
export const LoadingOverlay: Story = {
  render: () => (
    <YStack position="relative" maxWidth={300}>
      <CommentItem
        authorName="Chef Demo"
        body="Doubled the garlic — excellent. The kids asked for seconds."
        canEdit
        canDelete
        onDelete={() => {}}
      />
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.45}
        pointerEvents="none"
      >
        <CommentItem
          authorName="Chef Demo"
          body="Doubled the garlic — excellent. The kids asked for seconds."
          canEdit
          canDelete
          onDelete={() => {}}
          loading
        />
      </YStack>
    </YStack>
  ),
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
