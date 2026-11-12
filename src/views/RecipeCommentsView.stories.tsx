import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View, YStack } from "tamagui";
import { RecipeCommentsView } from "./RecipeCommentsView.js";

const meta: Meta<typeof RecipeCommentsView> = {
  title: "Views/RecipeCommentsView",
  component: RecipeCommentsView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof RecipeCommentsView>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" padding="$4">
      {children}
    </View>
  );
}

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
    <Viewport>
      <RecipeCommentsView
        comments={comments}
        staleHintLabel="Based on an older version"
        draft=""
        onDraftChange={() => undefined}
        onPost={() => undefined}
        onStartEdit={() => undefined}
        onDeleteComment={() => undefined}
      />
    </Viewport>
  ),
};

export const Editing: Story = {
  render: () => (
    <Viewport>
      <RecipeCommentsView
        comments={comments}
        editingCommentId="c1"
        editDraft="Doubled the paprika and added garlic."
        onEditDraftChange={() => undefined}
        onCancelEdit={() => undefined}
        onSaveEdit={() => undefined}
      />
    </Viewport>
  ),
};

export const Empty: Story = {
  render: () => (
    <Viewport>
      <RecipeCommentsView
        comments={[]}
        draft=""
        onDraftChange={() => undefined}
        onPost={() => undefined}
      />
    </Viewport>
  ),
};

export const Loading: Story = {
  render: () => (
    <Viewport>
      <RecipeCommentsView comments={[]} loading />
    </Viewport>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <Viewport>
      <YStack position="relative">
        <RecipeCommentsView
          comments={comments}
          staleHintLabel="Based on an older version"
          draft=""
          onDraftChange={() => undefined}
          onPost={() => undefined}
          onStartEdit={() => undefined}
          onDeleteComment={() => undefined}
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
            onDraftChange={() => undefined}
            onPost={() => undefined}
            onStartEdit={() => undefined}
            onDeleteComment={() => undefined}
          />
        </YStack>
      </YStack>
    </Viewport>
  ),
};

export const SignedOut: Story = {
  render: () => (
    <Viewport>
      <RecipeCommentsView comments={comments} />
    </Viewport>
  ),
};
