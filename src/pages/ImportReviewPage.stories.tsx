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
