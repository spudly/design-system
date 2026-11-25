import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { eciperayFooterFixture, memorizeFooterFixture } from "../../pages/shared/fixtures.js";
import { BigFooter, BigFooterShell } from "./BigFooter.js";
import { Text } from "../data/Text.js";

const meta: Meta<typeof BigFooter> = {
  title: "Widgets/Content/BigFooter",
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

/**
 * Short page, Memorize theme (#857): content well under viewport
 * height — the footer stays pinned to the viewport bottom and the
 * slack lives inside the content area (page background), with the
 * shell's clearance gap above the footer.
 */
export const ShortPageMemorize: Story = {
  globals: { theme: "light_quietDawn" },
  render: () => (
    <BigFooterShell footer={memorizeFooterFixture}>
      <YStack padding="$4">
        <Text variant="body">A short Memorize page: the footer sits at the viewport bottom.</Text>
      </YStack>
    </BigFooterShell>
  ),
};

/**
 * Standalone page with header data (#857, option B): the shell
 * renders the full AppTopBar (brand + nav + actions) above the
 * content when the page supplies header data.
 */
export const ShortPageWithHeader: Story = {
  render: () => (
    <BigFooterShell
      footer={eciperayFooterFixture}
      header={{
        brand: { label: "Eciperay", href: "/", mark: "eciperay" },
        navItems: [
          { id: "recipes", label: "Recipes", href: "/recipes" },
          { id: "meals", label: "Meals", href: "/meals" },
        ],
        activeItemId: "recipes",
        navLabel: "Eciperay sections",
        actions: [{ id: "sign-in", label: "Sign in", href: "/login" }],
      }}
    >
      <YStack padding="$4">
        <Text variant="body">A short standalone page with the full header.</Text>
      </YStack>
    </BigFooterShell>
  ),
};
