import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";

import { homeFixture, eciperayFooterFixture } from "../shared/fixtures.js";
import { storyImageWide } from "../../storyFixtures.js";

import { HomePage } from "./HomePage.js";

const meta: Meta<typeof HomePage> = {
  title: "Pages/Eciperay/HomePage",
  component: HomePage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof HomePage>;

const noop = () => {};

/**
 * Rows are the shared recipe rows (#657): the page renders them
 * itself from the item data — a rated recipe (pressable stars),
 * an unrated one (icon-only star), one with a thumbnail, and one
 * long title + long meta line (the cramped-layout regression
 * case from the old app-side card).
 */
export const WithRecipes: Story = {
  render: () => (
    <>
      <HomePage
        footer={eciperayFooterFixture}
        {...homeFixture}
        recipes={[
          {
            id: "tuscan-chicken",
            href: "/recipes/tuscan-chicken",
            title: "Tuscan Chicken",
            subtitle: "4 servings · 45 min",
            rating: 4,
          },
          {
            id: "fudgy-brownies",
            href: "/recipes/fudgy-brownies",
            title: "Fudgy Brownies",
            subtitle: "12 servings · 35 min",
          },
          {
            id: "long-title",
            href: "/recipes/long-title",
            title: "Slow-Braised Tuscan White Bean and Tuscan Chicken Skillet with Crispy Sage",
            subtitle:
              "6 servings · 1 hr 20 min · braised · weeknight favorite with a very long meta line",
            rating: 5,
          },
        ]}
        onLogCookPress={noop}
        browseHref="/recipes"
        addHref="/recipes/new"
        sharedWithMeHref="/shared-with-me"
      />
    </>
  ),
};

export const WithLeadImage: Story = {
  // Photography-led lead (#852): the host-supplied lead image
  // renders as the hero above the title; the secondary actions
  // render in the sage accent and one row carries the shared
  // badge in the accent tone.
  render: () => (
    <>
      <HomePage
        footer={eciperayFooterFixture}
        {...homeFixture}
        leadImageUrl={storyImageWide}
        recipes={[
          {
            id: "tuscan-chicken",
            href: "/recipes/tuscan-chicken",
            title: "Tuscan Chicken",
            subtitle: "4 servings · 45 min",
            rating: 4,
            badgeLabel: "Shared with you",
            canLogCook: false,
          },
        ]}
        onLogCookPress={noop}
        browseHref="/recipes"
        addHref="/recipes/new"
        sharedWithMeHref="/shared-with-me"
      />
    </>
  ),
};

export const Empty: Story = {
  render: () => (
    <>
      <HomePage
        footer={eciperayFooterFixture}
        {...homeFixture}
        recipes={[]}
        browseHref="/recipes"
        addHref="/recipes/new"
        sharedWithMeHref="/shared-with-me"
      />
    </>
  ),
};

export const Loading: Story = {
  render: () => (
    <>
      <HomePage
        footer={eciperayFooterFixture}
        {...homeFixture}
        recipes={[]}
        loading
        browseHref="/recipes"
        addHref="/recipes/new"
        sharedWithMeHref="/shared-with-me"
      />
    </>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <View width="100%" height="100%" position="relative">
      <HomePage
        footer={eciperayFooterFixture}
        {...homeFixture}
        onLogCookPress={noop}
        browseHref="/recipes"
        addHref="/recipes/new"
        sharedWithMeHref="/shared-with-me"
      />
      <View
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.45}
        pointerEvents="none"
      >
        <HomePage
          footer={eciperayFooterFixture}
          {...homeFixture}
          recipes={[]}
          loading
          browseHref="/recipes"
          addHref="/recipes/new"
          sharedWithMeHref="/shared-with-me"
        />
      </View>
    </View>
  ),
};
