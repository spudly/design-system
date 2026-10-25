import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View, YStack } from "tamagui";
import { Text } from "../components/Text.js";
import {
  aiSessionGenerateConfigFixture,
  aiSessionPlanningFixture,
  aiSessionPreviewFixture,
} from "./fixtures.js";
import { AiSessionPage } from "./AiSessionPage.js";

const meta: Meta<typeof AiSessionPage> = {
  title: "Pages/Eciperay/AiSessionPage",
  component: AiSessionPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof AiSessionPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

const noopHandlers = {
  onPromptChange: () => undefined,
  onFollowUpChange: () => undefined,
  onStart: () => undefined,
  onSendMessage: () => undefined,
  onApprovePlan: () => undefined,
  onFinalize: () => undefined,
  onCancel: () => undefined,
  onEmptyCancel: () => undefined,
};

export const Start: Story = {
  render: () => (
    <Viewport>
      <AiSessionPage
        config={aiSessionGenerateConfigFixture}
        session={null}
        prompt="A cozy vegetarian dinner for four, something with mushrooms."
        followUp=""
        busy={false}
        {...noopHandlers}
      />
    </Viewport>
  ),
};

export const Planning: Story = {
  render: () => (
    <Viewport>
      <AiSessionPage
        config={aiSessionGenerateConfigFixture}
        session={aiSessionPlanningFixture}
        prompt=""
        followUp="Make it spicier, and swap the noodles for rice."
        busy={false}
        {...noopHandlers}
      />
    </Viewport>
  ),
};

/**
 * The preview is a slot: hosts render their parsed-recipe
 * preview into the card (the app's RecipeInputPreview). The
 * story's stand-in is plain text lines in the preview's shape.
 */
export const PreviewReady: Story = {
  render: () => (
    <Viewport>
      <AiSessionPage
        config={aiSessionGenerateConfigFixture}
        session={aiSessionPreviewFixture}
        preview={
          <YStack gap="$2">
            <Text fontWeight="bold">Creamy Mushroom Stroganoff</Text>
            <Text>Serves 4 · 35 minutes</Text>
            <Text>12 oz egg noodles · 1 lb mushrooms · 1 cup sour cream</Text>
          </YStack>
        }
        prompt=""
        followUp=""
        busy={false}
        {...noopHandlers}
      />
    </Viewport>
  ),
};
