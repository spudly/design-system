import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View, YStack } from "tamagui";
import { storyImageWide } from "../storyFixtures.js";
import { RecipeImageView } from "./RecipeImageView.js";

const meta: Meta<typeof RecipeImageView> = {
  title: "Views/RecipeImageView",
  component: RecipeImageView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof RecipeImageView>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" padding="$4">
      {children}
    </View>
  );
}

const noop = () => undefined;

/** No image yet: the dashed empty frame, pick / take-photo /
 * generate actions, and no remove action. */
export const Empty: Story = {
  render: () => (
    <Viewport>
      <RecipeImageView
        onPickImageRequest={noop}
        onTakePhotoRequest={noop}
        onGenerateImageRequest={noop}
        onRemoveImage={noop}
      />
    </Viewport>
  ),
};

/** A current image: the hero preview and the remove action
 * join the row. */
export const WithImage: Story = {
  render: () => (
    <Viewport>
      <RecipeImageView
        imagePreviewUri={storyImageWide}
        onPickImageRequest={noop}
        onTakePhotoRequest={noop}
        onGenerateImageRequest={noop}
        onRemoveImage={noop}
      />
    </Viewport>
  ),
};

/** Upload in flight: the pick action reads "Uploading…" and
 * every action disables. */
export const Uploading: Story = {
  render: () => (
    <Viewport>
      <RecipeImageView
        isUploading
        onPickImageRequest={noop}
        onTakePhotoRequest={noop}
        onGenerateImageRequest={noop}
        onRemoveImage={noop}
      />
    </Viewport>
  ),
};

/** Generation in flight: the generate action reads
 * "Generating…" and every action disables. */
export const Generating: Story = {
  render: () => (
    <Viewport>
      <RecipeImageView
        imagePreviewUri={storyImageWide}
        isGenerating
        onPickImageRequest={noop}
        onTakePhotoRequest={noop}
        onGenerateImageRequest={noop}
        onRemoveImage={noop}
      />
    </Viewport>
  ),
};

/** A host-reported failure renders as the error alert below
 * the actions; the current image and its actions stay. */
export const ErrorState: Story = {
  render: () => (
    <Viewport>
      <RecipeImageView
        imagePreviewUri={storyImageWide}
        error="That image could not be uploaded. Try a different file."
        onPickImageRequest={noop}
        onTakePhotoRequest={noop}
        onGenerateImageRequest={noop}
        onRemoveImage={noop}
      />
    </Viewport>
  ),
};

/** Loading: the hero preview is a box skeleton at the hero
 * frame's height and the actions skeletonize in place. */
export const Loading: Story = {
  render: () => (
    <Viewport>
      <RecipeImageView
        imagePreviewUri={storyImageWide}
        onPickImageRequest={noop}
        onTakePhotoRequest={noop}
        onGenerateImageRequest={noop}
        onRemoveImage={noop}
        loading
      />
    </Viewport>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <Viewport>
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
    </Viewport>
  ),
};
