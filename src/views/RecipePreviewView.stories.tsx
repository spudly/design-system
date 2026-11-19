import type { Meta, StoryObj } from "@storybook/react";
import { RecipePreviewView } from "./RecipePreviewView.js";
import { StoryFrame } from "./storyFrame.js";

const meta: Meta<typeof RecipePreviewView> = {
  title: "Views/RecipePreviewView",
  component: RecipePreviewView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof RecipePreviewView>;

/**
 * The full parsed-recipe preview (#684): title, the
 * app-formatted meta line, ingredient lines, and numbered
 * instruction lines — the same parsed-stroganoff fixture the
 * AiSessionPage and ImportReviewPage stories pass as data.
 */
export const Default: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <RecipePreviewView
        title="Creamy Mushroom Stroganoff"
        metaLabel="Serves 4 · 35 minutes"
        ingredients={["12 oz egg noodles", "1 lb mushrooms", "1 cup sour cream"]}
        instructions={[
          "Boil the noodles until tender.",
          "Sear the mushrooms until golden.",
          "Stir in the sour cream and serve over the noodles.",
        ]}
      />
    </StoryFrame>
  ),
};

/** A parse that produced only a title renders just the title. */
export const TitleOnly: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <RecipePreviewView title="Creamy Mushroom Stroganoff" />
    </StoryFrame>
  ),
};
