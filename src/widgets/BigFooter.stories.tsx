import type { Meta, StoryObj } from "@storybook/react";
import { XStack, YStack } from "tamagui";
import { RecipesIcon } from "../icons/RecipesIcon.js";
import { eciperayFooterFixture, memorizeFooterFixture } from "../pages/fixtures.js";
import { BIG_FOOTER_BRAND_LOGO_HEIGHT, BigFooter, BigFooterShell } from "./BigFooter.js";
import { Text } from "./Text.js";

const meta: Meta<typeof BigFooter> = {
  title: "Widgets/BigFooter",
  component: BigFooter,
};

export default meta;
type Story = StoryObj<typeof BigFooter>;

/** Every section from data: brand, columns (incl. Legal), store links, Feather social icon links. */
export const Default: Story = {
  args: { footer: eciperayFooterFixture },
};

/** The Memorize host's footer data, through the same component. */
export const Memorize: Story = {
  args: { footer: memorizeFooterFixture },
};

/**
 * Brand logo slot (#468): the host supplies a logo node and the
 * brand anchor renders it instead of the text wordmark, in the
 * DS-owned logo box (height BIG_FOOTER_BRAND_LOGO_HEIGHT); the
 * anchor keeps the brand label as its accessible name. The
 * fixture data file is pure data, so the logo node is composed
 * here at story level the way a host composes its own asset.
 */
export const WithLogo: Story = {
  args: {
    footer: {
      ...eciperayFooterFixture,
      brand: {
        ...eciperayFooterFixture.brand,
        logo: (
          <XStack alignItems="center" gap="$2">
            <RecipesIcon size={BIG_FOOTER_BRAND_LOGO_HEIGHT} color="#ffffff" />
            <Text variant="heading" color="$onPrimary">
              Eciperay
            </Text>
          </XStack>
        ),
      },
    },
  },
};

/** Production shape today: no socials yet — an empty socialLinks array renders no social section. */
export const NoSocialsYet: Story = {
  args: { footer: { ...eciperayFooterFixture, socialLinks: [] } },
};

/**
 * Mobile width (430px): below the 640px stack breakpoint the
 * columns collapse to a stacked single column — brand, store
 * links, and social links included — with no horizontal scroll.
 */
export const MobileStacked: Story = {
  args: { footer: eciperayFooterFixture },
  decorators: [
    (Story) => (
      <YStack width={430} maxWidth="100%">
        <Story />
      </YStack>
    ),
  ],
};

/** Sticky behavior: short content, footer at the viewport bottom, in flow (BigFooterShell). */
export const StickyOnShortPage: Story = {
  render: () => (
    <BigFooterShell footer={eciperayFooterFixture}>
      <YStack padding="$4">
        <Text variant="body">A short page: the footer sits at the viewport bottom.</Text>
      </YStack>
    </BigFooterShell>
  ),
};
