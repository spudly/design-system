import type { Meta, StoryObj } from "@storybook/react";
import { BrandLink } from "./BrandLink.js";

const meta: Meta<typeof BrandLink> = {
  title: "Widgets/Actions & Navigation/BrandLink",
  component: BrandLink,
};

export default meta;
type Story = StoryObj<typeof BrandLink>;

/** The wordmark is a real link: it renders as an anchor carrying
 * the home href — "/" here, the stand-in for the host's home
 * route — which is what the manual check verifies in the DOM. */
export const Default: Story = {
  args: {
    label: "Eciperay",
    href: "/",
  },
};

/**
 * With the brand's graphic mark (#726): the DS-owned Eciperay
 * mark renders before the wordmark, inside the same real link —
 * the anchor's accessible name stays the brand label.
 */
export const WithMark: Story = {
  args: {
    label: "Eciperay",
    href: "/",
    mark: "eciperay",
  },
};

/**
 * With the Memorize graphic mark (#861): the DS-owned Memorize
 * mark — the open book with golden rays, a central flame, and
 * a bookmark, in the Quiet Dawn palette — renders before the
 * wordmark, inside the same real link.
 */
export const WithMemorizeMark: Story = {
  args: {
    label: "Memorize",
    href: "/",
    mark: "memorize",
  },
};

/**
 * A brand that names no graphic mark (#726): no mark is
 * named, so the wordmark renders alone — no placeholder, no
 * empty slot.
 */
export const WordmarkOnly: Story = {
  args: {
    label: "Memorize",
    href: "/",
  },
};
