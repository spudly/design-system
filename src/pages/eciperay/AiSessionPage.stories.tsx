import type { Meta, StoryObj } from "@storybook/react";
import {
  aiSessionGenerateConfigFixture,
  aiSessionPlanningFixture,
  aiSessionPreviewFixture,
  eciperayFooterFixture,
} from "../shared/fixtures.js";
import { AiSessionPage } from "./AiSessionPage.js";

const meta: Meta<typeof AiSessionPage> = {
  title: "Pages/Eciperay/AiSessionPage",
  component: AiSessionPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof AiSessionPage>;

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
    <>
      <AiSessionPage
        footer={eciperayFooterFixture}
        config={aiSessionGenerateConfigFixture}
        session={null}
        prompt="A cozy vegetarian dinner for four, something with mushrooms."
        followUp=""
        busy={false}
        {...noopHandlers}
      />
    </>
  ),
};

export const Planning: Story = {
  render: () => (
    <>
      <AiSessionPage
        footer={eciperayFooterFixture}
        config={aiSessionGenerateConfigFixture}
        session={aiSessionPlanningFixture}
        prompt=""
        followUp="Make it spicier, and swap the noodles for rice."
        busy={false}
        {...noopHandlers}
      />
    </>
  ),
};

/**
 * The preview is data (#684): hosts pass their parsed recipe's
 * preview content and the page renders RecipePreviewView in
 * the card. The story's fixture is the parsed stroganoff.
 */
export const PreviewReady: Story = {
  render: () => (
    <>
      <AiSessionPage
        footer={eciperayFooterFixture}
        config={aiSessionGenerateConfigFixture}
        session={aiSessionPreviewFixture}
        preview={{
          title: "Creamy Mushroom Stroganoff",
          metaLabel: "Serves 4 · 35 minutes",
          ingredients: ["12 oz egg noodles", "1 lb mushrooms", "1 cup sour cream"],
        }}
        prompt=""
        followUp=""
        busy={false}
        {...noopHandlers}
      />
    </>
  ),
};
