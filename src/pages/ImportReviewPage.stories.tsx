import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View, YStack } from "tamagui";
import { Text } from "../components/Text.js";
import { ImportReviewPage } from "./ImportReviewPage.js";

const meta: Meta<typeof ImportReviewPage> = {
  title: "Pages/Eciperay/ImportReviewPage",
  component: ImportReviewPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof ImportReviewPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

/**
 * The preview is a slot: hosts render their parsed-recipe
 * preview into it (the app's RecipeInputPreview). The story's
 * stand-in is plain text lines in the preview's shape.
 */
function PreviewStandIn() {
  return (
    <YStack gap="$2">
      <Text fontWeight="bold">Creamy Mushroom Stroganoff</Text>
      <Text>Serves 4 · 35 minutes</Text>
      <Text>12 oz egg noodles · 1 lb mushrooms · 1 cup sour cream</Text>
    </YStack>
  );
}

export const Ready: Story = {
  render: () => (
    <Viewport>
      <ImportReviewPage
        versionLabel="v1"
        preview={<PreviewStandIn />}
        busy={false}
        acceptPending={false}
        editsPending={false}
        onAccept={() => undefined}
        onStartEdits={() => undefined}
      />
    </Viewport>
  ),
};

/**
 * The image-bearing render: hosts that parsed a photo of the dish
 * pass its URL (and the recipe title as the image's accessible
 * name), and the banner renders above the preview frame. This
 * story exists so the hero-banner re-check in the changeset and
 * docs/manual-tests.md is performable — Ready passes no image.
 */
export const WithImage: Story = {
  render: () => (
    <Viewport>
      <ImportReviewPage
        versionLabel="v1"
        imageUrl="https://picsum.photos/seed/import-review/800/400"
        imageAlt="Creamy Mushroom Stroganoff"
        preview={<PreviewStandIn />}
        busy={false}
        acceptPending={false}
        editsPending={false}
        onAccept={() => undefined}
        onStartEdits={() => undefined}
      />
    </Viewport>
  ),
};
