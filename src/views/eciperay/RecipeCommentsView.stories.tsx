import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";

import { StoryFrame } from "../shared/storyFrame.js";

import { RecipeCommentsView } from "./RecipeCommentsView.js";

const meta: Meta<typeof RecipeCommentsView> = {
  title: "Views/Eciperay/RecipeCommentsView",
  component: RecipeCommentsView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof RecipeCommentsView>;

const comments = [
  {
    id: "c1",
    authorName: "Alex",
    body: "Doubled the paprika and it was perfect.",
    canEdit: true,
    canDelete: true,
  },
  { id: "c2", authorName: "Sam", body: "Worked great with chicken thighs instead.", isStale: true },
];

export const WithComposer: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <RecipeCommentsView
        comments={comments}
        staleHintLabel="Based on an older version"
        draft=""
        onDraftChange={() => {}}
        onPost={() => {}}
        onStartEdit={() => {}}
        onDeleteComment={() => {}}
      />
    </StoryFrame>
  ),
};

export const Editing: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <RecipeCommentsView
        comments={comments}
        editingCommentId="c1"
        editDraft="Doubled the paprika and added garlic."
        onEditDraftChange={() => {}}
        onCancelEdit={() => {}}
        onSaveEdit={() => {}}
      />
    </StoryFrame>
  ),
};

export const Empty: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <RecipeCommentsView
        comments={[]}
        draft=""
        onDraftChange={() => {}}
        onPost={() => {}}
      />
    </StoryFrame>
  ),
};

export const Loading: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <RecipeCommentsView comments={[]} loading />
    </StoryFrame>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <YStack position="relative">
        <RecipeCommentsView
          comments={comments}
          staleHintLabel="Based on an older version"
          draft=""
          onDraftChange={() => {}}
          onPost={() => {}}
          onStartEdit={() => {}}
          onDeleteComment={() => {}}
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
          <RecipeCommentsView
            comments={comments}
            loading
            staleHintLabel="Based on an older version"
            draft=""
            onDraftChange={() => {}}
            onPost={() => {}}
            onStartEdit={() => {}}
            onDeleteComment={() => {}}
          />
        </YStack>
      </YStack>
    </StoryFrame>
  ),
};

export const SignedOut: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <RecipeCommentsView comments={comments} />
    </StoryFrame>
  ),
};
