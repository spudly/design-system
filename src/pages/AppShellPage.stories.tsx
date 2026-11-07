import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { Card } from "../widgets/Card.js";
import { SectionCard } from "../widgets/SectionCard.js";
import { Text } from "../widgets/Text.js";
import { AppShellPage, type AppShellPageNavItem } from "./AppShellPage.js";
import { eciperayFooterFixture } from "./fixtures.js";

/**
 * Stories for AppShellPage (#437) — the routed app shell
 * Eciperay's hosts hand-rolled before the frame existed. The
 * brand, nav set, and list label are Eciperay's real shell
 * values (packages/web/src/components/AppShell.tsx: the 7-item
 * nav — Home, Recipes, Meals, Shared with me, Add, Tags,
 * Profile — each an icon name + label + route); the page
 * surface is a static stand-in composed from DS components, the
 * way the app slots a DS page into the frame. The frame is a
 * wide viewport (1024×844 — the shell's centered content
 * column) pinned so Chromatic screenshots are deterministic,
 * theme pinned to Warm Harvest, Eciperay's brand.
 */
const meta: Meta<typeof AppShellPage> = {
  title: "Pages/Eciperay/AppShellPage",
  component: AppShellPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof AppShellPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={1024} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

function RecipesContent() {
  return (
    <>
      <SectionCard title="My recipes">
        <Text variant="subheading">Weeknight chicken</Text>
        <Text variant="hint">Dinner · 35 minutes</Text>
      </SectionCard>
      <Card>
        <Text variant="subheading">Vegetable beef soup</Text>
        <Text variant="hint">Dinner · 1 hour</Text>
      </Card>
    </>
  );
}

const eciperayNav: AppShellPageNavItem[] = [
  { id: "home", label: "Home", href: "/", icon: "home" },
  { id: "recipes", label: "Recipes", href: "/recipes", icon: "recipes" },
  { id: "meals", label: "Meals", href: "/meals", icon: "meals" },
  { id: "shared", label: "Shared with me", href: "/shared", icon: "shared" },
  { id: "add", label: "Add", href: "/add", icon: "add" },
  { id: "tags", label: "Tags", href: "/tags", icon: "tags" },
  { id: "profile", label: "Profile", href: "/profile", icon: "profile" },
];

const labelOnlyNav: AppShellPageNavItem[] = eciperayNav.map(({ icon: _icon, ...item }) => item);

/** The Eciperay shell as the app renders it: icon nav, Recipes current, account action, footer. */
export const Default: Story = {
  render: () => (
    <Viewport>
      <AppShellPage
        brand={{ label: "Eciperay", href: "/" }}
        navItems={eciperayNav}
        navLabel="Eciperay sections"
        activeItemId="recipes"
        actions={[{ id: "sign-out", label: "Sign out", onPress: () => {} }]}
        footer={eciperayFooterFixture}
      >
        <RecipesContent />
      </AppShellPage>
    </Viewport>
  ),
};

/** Nav items may omit the icon name — the label alone renders. */
export const NoIcons: Story = {
  render: () => (
    <Viewport>
      <AppShellPage
        brand={{ label: "Eciperay", href: "/" }}
        navItems={labelOnlyNav}
        navLabel="Eciperay sections"
        activeItemId="home"
        footer={eciperayFooterFixture}
      >
        <RecipesContent />
      </AppShellPage>
    </Viewport>
  ),
};

/** The signed-out shell: header actions are links (Sign in / Create account navigate). */
export const LinkActions: Story = {
  render: () => (
    <Viewport>
      <AppShellPage
        brand={{ label: "Eciperay", href: "/" }}
        navItems={eciperayNav}
        navLabel="Eciperay sections"
        activeItemId="home"
        actions={[
          { id: "sign-in", label: "Sign in", href: "/sign-in" },
          { id: "create-account", label: "Create account", href: "/sign-up" },
        ]}
        footer={eciperayFooterFixture}
      >
        <RecipesContent />
      </AppShellPage>
    </Viewport>
  ),
};

/** No footer data supplied: no footer band renders and none is reserved. */
export const NoFooter: Story = {
  render: () => (
    <Viewport>
      <AppShellPage
        brand={{ label: "Eciperay", href: "/" }}
        navItems={eciperayNav}
        navLabel="Eciperay sections"
        activeItemId="meals"
        actions={[{ id: "sign-out", label: "Sign out", onPress: () => {} }]}
      >
        <RecipesContent />
      </AppShellPage>
    </Viewport>
  ),
};

/** A child that fails the way a rejected lazy chunk import does. */
function FailingContent(): never {
  throw new Error("Failed to fetch dynamically imported module");
}

/**
 * The current page's chunk failed to load: the internal
 * boundary's fallback (error alert + Reload the app) replaces
 * the surface; the shell stays usable around it.
 */
export const ChunkFailedContent: Story = {
  render: () => (
    <Viewport>
      <AppShellPage
        brand={{ label: "Eciperay", href: "/" }}
        navItems={eciperayNav}
        navLabel="Eciperay sections"
        activeItemId="recipes"
        footer={eciperayFooterFixture}
        // A no-op reload in Storybook so the fallback stays on
        // screen for inspection instead of reloading the page.
        onReload={() => {}}
      >
        <FailingContent />
      </AppShellPage>
    </Viewport>
  ),
};
