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
  title: "Views/AppTopBar",
  component: AppTopBar,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof AppTopBar>;

const eciperayNav = [
  { id: "home", label: "Home", href: "/", icon: "home" as const },
  { id: "recipes", label: "Recipes", href: "/recipes", icon: "recipes" as const },
  { id: "meals", label: "Meals", href: "/meals", icon: "meals" as const },
  { id: "shared", label: "Shared with me", href: "/shared", icon: "shared" as const },
  { id: "add", label: "Add", href: "/add", icon: "add" as const },
  { id: "tags", label: "Tags", href: "/tags", icon: "tags" as const },
  { id: "profile", label: "Profile", href: "/profile", icon: "profile" as const },
];

/** Brand link, icon nav with Recipes current, and a callback header action. */
export const Default: Story = {
  args: {
    brand: { label: "Eciperay", href: "/" },
    navItems: eciperayNav,
    navLabel: "Eciperay sections",
    activeItemId: "recipes",
    actions: [{ id: "sign-out", label: "Sign out", onPress: () => {} }],
  },
};

/** Header search supplied (#542): the labeled SearchField renders between nav and actions. */
export const WithSearch: Story = {
  args: {
    brand: { label: "Eciperay", href: "/" },
    navItems: eciperayNav,
    navLabel: "Eciperay sections",
    activeItemId: "recipes",
    search: {
      label: "Search recipes",
      placeholder: "Search recipes",
      value: "soup",
      onValueChange: () => {},
      onSubmit: () => {},
    },
    actions: [{ id: "sign-out", label: "Sign out", onPress: () => {} }],
  },
};

/** The TabbedShellPage header case: a brand with no href, no nav, no actions. */
export const BrandOnly: Story = {
  args: {
    brand: { label: "Memorize" },
  },
};

/** Label-only nav (no icon names) with link-form header actions. */
export const LabelOnlyNav: Story = {
  args: {
    brand: { label: "Eciperay", href: "/" },
    navItems: eciperayNav.map(({ icon: _icon, ...item }) => item),
    navLabel: "Eciperay sections",
    activeItemId: "home",
    actions: [
      { id: "sign-in", label: "Sign in", href: "/sign-in" },
      { id: "create-account", label: "Create account", href: "/sign-up" },
    ],
  },
};

const phoneNav = [
  { id: "home", label: "Home", href: "/", icon: "home" as const },
  { id: "recipes", label: "Recipes", href: "/recipes", icon: "recipes" as const },
  { id: "meals", label: "Meals", href: "/meals", icon: "meals" as const },
  { id: "add", label: "Add", href: "/add", icon: "add" as const },
  { id: "tags", label: "Tags", href: "/tags", icon: "tags" as const },
  { id: "profile", label: "Profile", href: "/profile", icon: "profile" as const },
];

/**
 * Phone width (#564): the 6-item signed-in nav inside a 390px
 * frame — the nav list shrinks and wraps within the bar, so
 * every link (Profile included) stays fully visible and the
 * page gains no horizontal scroll.
 */
export const PhoneWidthNav: Story = {
  decorators: [
    (Story) => (
      <View width={390}>
        <Story />
      </View>
    ),
  ],
  args: {
    brand: { label: "Eciperay", href: "/" },
    navItems: phoneNav,
    navLabel: "Eciperay sections",
    activeItemId: "recipes",
    actions: [{ id: "sign-out", label: "Sign out", onPress: () => {} }],
  },
};
