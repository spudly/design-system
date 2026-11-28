import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";

import { AppTopBar } from "./AppTopBar.js";

/**
 * Stories for AppTopBar (#437) — the shared top-bar view both
 * frame pages render (AppShellPage's routed shell and
 * TabbedShellPage's title header). The nav set is Eciperay's
 * real shell nav; theme pinned to Warm Harvest, its brand.
 * The frame pages' own stories carry the full-shell cases;
 * these pin the bar's own compositions.
 */
const meta: Meta<typeof AppTopBar> = {
  title: "Widgets/Layout & Structure/AppTopBar",
  component: AppTopBar,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof AppTopBar>;

const eciperayNav = [
  { id: "home", label: "Home", href: "/", kind: "home" as const },
  { id: "recipes", label: "Recipes", href: "/recipes", kind: "recipes" as const },
  { id: "meals", label: "Meals", href: "/meals", kind: "meals" as const },
  { id: "shared", label: "Shared with me", href: "/shared", kind: "shared" as const },
  { id: "add", label: "Add", href: "/add", kind: "add" as const },
  { id: "tags", label: "Tags", href: "/tags", kind: "tags" as const },
  { id: "profile", label: "Profile", href: "/profile", kind: "profile" as const },
];

/** Brand link, kind nav with Recipes current, and a callback header action. */
export const Default: Story = {
  args: {
    brand: { label: "Eciperay", href: "/", mark: "eciperay" },
    navItems: eciperayNav,
    navLabel: "Eciperay sections",
    activeItemId: "recipes",
    actions: [{ id: "sign-out", label: "Sign out", onPress: () => { /* noop */ } }],
  },
};

/** Header search supplied (#542): the labeled SearchField renders between nav and actions. */
export const WithSearch: Story = {
  args: {
    brand: { label: "Eciperay", href: "/", mark: "eciperay" },
    navItems: eciperayNav,
    navLabel: "Eciperay sections",
    activeItemId: "recipes",
    search: {
      label: "Search recipes",
      placeholder: "Search recipes",
      value: "soup",
      onValueChange: () => { /* noop */ },
      onSubmit: () => { /* noop */ },
    },
    actions: [{ id: "sign-out", label: "Sign out", onPress: () => { /* noop */ } }],
  },
};

/** The TabbedShellPage header case: a brand with no href, no nav, no actions. */
export const BrandOnly: Story = {
  args: {
    brand: { label: "Memorize" },
  },
};

/**
 * A brand with no graphic mark as a link (#726): Memorize names
 * no mark, so its BrandLink renders the wordmark alone — no
 * placeholder, no empty slot. (The Default story above is the
 * marked case: Eciperay's DS-owned mark before its wordmark.)
 */
export const WordmarkOnlyBrand: Story = {
  args: {
    brand: { label: "Memorize", href: "/" },
  },
};

/** Label-only nav (no item kinds) with link-form header actions. */
export const LabelOnlyNav: Story = {
  args: {
    brand: { label: "Eciperay", href: "/", mark: "eciperay" },
    navItems: eciperayNav.map(({ kind: _kind, ...item }) => item),
    navLabel: "Eciperay sections",
    activeItemId: "home",
    actions: [
      { id: "sign-in", label: "Sign in", href: "/sign-in" },
      { id: "create-account", label: "Create account", href: "/sign-up" },
    ],
  },
};

const phoneNav = [
  { id: "home", label: "Home", href: "/", kind: "home" as const },
  { id: "recipes", label: "Recipes", href: "/recipes", kind: "recipes" as const },
  { id: "meals", label: "Meals", href: "/meals", kind: "meals" as const },
  { id: "add", label: "Add", href: "/add", kind: "add" as const },
  { id: "tags", label: "Tags", href: "/tags", kind: "tags" as const },
  { id: "profile", label: "Profile", href: "/profile", kind: "profile" as const },
];

const phoneWidthArgs = {
  brand: { label: "Eciperay", href: "/", mark: "eciperay" as const },
  navItems: phoneNav,
  navLabel: "Eciperay sections",
  activeItemId: "recipes",
  actions: [{ id: "sign-out", label: "Sign out", onPress: () => { /* noop */ } }],
};

/**
 * Phone width (#564): the 6-item signed-in nav inside a 390px
 * frame — the nav list shrinks and wraps within the bar, so
 * every link (Profile included) stays fully visible and the
 * page gains no horizontal scroll. The story renders
 * full-bleed (phoneWidthFrame) so the preview's own padding
 * cannot push the fixed frame past the viewport.
 */
export const PhoneWidthNav: Story = {
  parameters: { layout: "fullscreen", phoneWidthFrame: true },
  decorators: [
    (Story) => (
      <View width={390}>
        <Story />
      </View>
    ),
  ],
  args: phoneWidthArgs,
};

/** Phone width, larger handset (#564): the same 6-item nav inside a 430px frame. */
export const PhoneWidthNav430: Story = {
  parameters: { layout: "fullscreen", phoneWidthFrame: true },
  decorators: [
    (Story) => (
      <View width={430}>
        <Story />
      </View>
    ),
  ],
  args: phoneWidthArgs,
};
