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
 * three link CTAs, and the three fixed feature cards. Default
 * pins the phone viewport (430×844) like the other page
 * stories; Wide renders the same page unconstrained so the
 * wide-web layout can be checked (the CTA row in one row, the
 * three feature cards sharing a row at their 260px basis) —
 * the manual-tests LandingPage section names which story each
 * layout check uses.
 */
export const Default: Story = {
  render: () => (
    <Viewport>
      <LandingPage {...landingFixture} />
    </Viewport>
  ),
};

export const Wide: Story = {
  render: () => <LandingPage {...landingFixture} />,
};
