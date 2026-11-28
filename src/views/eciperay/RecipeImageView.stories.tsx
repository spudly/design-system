import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";

import { storyImageWide } from "../../storyFixtures.js";
import { StoryFrame } from "../shared/storyFrame.js";

import { RecipeImageView } from "./RecipeImageView.js";

const meta: Meta<typeof RecipeImageView> = {
  title: "Views/Eciperay/RecipeImageView",
  component: RecipeImageView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof RecipeImageView>;

const noop = () => { /* noop */ };

/** No image yet: the dashed empty frame, pick / take-photo /
 * generate actions, and no remove action. */
export const Empty: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <RecipeImageView
        onPickImageRequest={noop}
        onTakePhotoRequest={noop}
        onGenerateImageRequest={noop}
        onRemoveImage={noop}
      />
    </StoryFrame>
  ),
};

/** A current image: the hero preview and the remove action
 * join the row. */
export const WithImage: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <RecipeImageView
        imagePreviewUri={storyImageWide}
        onPickImageRequest={noop}
        onTakePhotoRequest={noop}
        onGenerateImageRequest={noop}
        onRemoveImage={noop}
      />
    </StoryFrame>
  ),
};

/** Upload in flight: the pick action reads "Uploading…" and
 * every action disables. */
export const Uploading: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <RecipeImageView
        isUploading
        onPickImageRequest={noop}
        onTakePhotoRequest={noop}
        onGenerateImageRequest={noop}
        onRemoveImage={noop}
      />
    </StoryFrame>
  ),
};

/** Generation in flight: the generate action reads
 * "Generating…" and every action disables. */
export const Generating: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <RecipeImageView
        imagePreviewUri={storyImageWide}
        isGenerating
        onPickImageRequest={noop}
        onTakePhotoRequest={noop}
        onGenerateImageRequest={noop}
        onRemoveImage={noop}
      />
    </StoryFrame>
  ),
};

/** A host-reported failure renders as the error alert below
 * the actions; the current image and its actions stay. */
export const ErrorState: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <RecipeImageView
        imagePreviewUri={storyImageWide}
        error="That image could not be uploaded. Try a different file."
        onPickImageRequest={noop}
        onTakePhotoRequest={noop}
        onGenerateImageRequest={noop}
        onRemoveImage={noop}
      />
    </StoryFrame>
  ),
};

/** Loading: the hero preview is a box skeleton at the hero
 * frame's height and the actions skeletonize in place. */
export const Loading: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <RecipeImageView
        imagePreviewUri={storyImageWide}
        onPickImageRequest={noop}
        onTakePhotoRequest={noop}
        onGenerateImageRequest={noop}
        onRemoveImage={noop}
        loading
      />
    </StoryFrame>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <YStack position="relative">
        <RecipeImageView
          imagePreviewUri={storyImageWide}
          onPickImageRequest={noop}
          onTakePhotoRequest={noop}
          onGenerateImageRequest={noop}
          onRemoveImage={noop}
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
          <RecipeImageView
            imagePreviewUri={storyImageWide}
            onPickImageRequest={noop}
            onTakePhotoRequest={noop}
            onGenerateImageRequest={noop}
            onRemoveImage={noop}
            loading
          />
        </YStack>
      </YStack>
    </StoryFrame>
  ),
};
