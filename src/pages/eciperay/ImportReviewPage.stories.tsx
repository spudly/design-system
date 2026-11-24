import { eciperayFooterFixture } from "../shared/fixtures.js";
import type { Meta, StoryObj } from "@storybook/react";
import { storyImageWide } from "../../storyFixtures.js";
import { ImportReviewPage } from "./ImportReviewPage.js";

const meta: Meta<typeof ImportReviewPage> = {
  title: "Pages/Eciperay/ImportReviewPage",
  component: ImportReviewPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof ImportReviewPage>;

/**
 * The preview is data (#684): hosts pass their parsed recipe's
 * preview content and the page renders RecipePreviewView in
 * the card. The fixture is the parsed stroganoff.
 */
const previewFixture = {
  title: "Creamy Mushroom Stroganoff",
  metaLabel: "Serves 4 · 35 minutes",
  ingredients: ["12 oz egg noodles", "1 lb mushrooms", "1 cup sour cream"],
};

export const Ready: Story = {
  render: () => (
    <>
      <ImportReviewPage
        footer={eciperayFooterFixture}
        versionLabel="v1"
        preview={previewFixture}
        busy={false}
        acceptPending={false}
        editsPending={false}
        onAccept={() => undefined}
        onStartEdits={() => undefined}
      />
    </>
  ),
};

/**
 * The image-bearing render: hosts that parsed a photo of the dish
 * pass its URL (and the recipe title as the image's accessible
 * name), and the banner renders above the preview frame. This
 * story exists so the hero-banner re-check in the changeset and
 * the colocated ImportReviewPage.test.steps.md is performable — Ready passes no image.
 * The image itself is the inline fixture from storyFixtures.ts:
 * a remote URL raced the VR verify pass (issue #352), so story
 * images are never fetched over the network.
 */
export const WithImage: Story = {
  render: () => (
    <>
      <ImportReviewPage
        footer={eciperayFooterFixture}
        versionLabel="v1"
        imageUrl={storyImageWide}
        imageAlt="Creamy Mushroom Stroganoff"
        preview={previewFixture}
        busy={false}
        acceptPending={false}
        editsPending={false}
        onAccept={() => undefined}
        onStartEdits={() => undefined}
      />
    </>
  ),
};
