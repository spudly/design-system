import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { landingFixture } from "./fixtures.js";
import { LandingPage } from "./LandingPage.js";

const meta: Meta<typeof LandingPage> = {
  title: "Pages/Eciperay/LandingPage",
  component: LandingPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof LandingPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

/**
 * The landing is a static view — one state, all content from
 * props — so a single story renders the whole page: hero, the
 * three link CTAs, and the three fixed feature cards.
 */
export const Default: Story = {
  render: () => (
    <Viewport>
      <LandingPage {...landingFixture} />
    </Viewport>
  ),
};
