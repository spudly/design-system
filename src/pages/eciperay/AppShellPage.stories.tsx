import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "../../widgets/layout/Card.js";
import { SectionCard } from "../../widgets/content/SectionCard.js";
import { Text } from "../../widgets/data/Text.js";
import { AppShellPage, type AppShellPageNavItem } from "./AppShellPage.js";
import { eciperayFooterFixture } from "../shared/fixtures.js";

/**
 * Stories for AppShellPage (#437) — the routed app shell
 * Eciperay's hosts hand-rolled before the frame existed. The
 * brand, nav set, and list label are Eciperay's real shell
 * values (packages/web/src/components/AppShell.tsx: the 7-item
 * nav — Home, Recipes, Meals, Shared with me, Add, Tags,
 * Profile — each a semantic kind + label + route); the page
 * surface is a static stand-in composed from DS components, the
 * way the app slots a DS page into the frame. The frame is the
 * full fluid width (#854, Stephen's direction: the page itself
 * is centered — its content column caps at 1200px and centers
 * via PageContentColumn — with the footer full-width), so
 * Chromatic captures show the shell's true desktop layout
 * instead of a pinned 1024px left-aligned frame; theme pinned
 * to Warm Harvest, Eciperay's brand.
 */
const meta: Meta<typeof AppShellPage> = {
  title: "Pages/Eciperay/AppShellPage",
  component: AppShellPage,
  globals: { theme: "light_warmHarvest" },
  parameters: { dsViewport: "full" },
};

export default meta;
type Story = StoryObj<typeof AppShellPage>;

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
  { id: "home", label: "Home", href: "/", kind: "home" },
  { id: "recipes", label: "Recipes", href: "/recipes", kind: "recipes" },
  { id: "meals", label: "Meals", href: "/meals", kind: "meals" },
  { id: "shared", label: "Shared with me", href: "/shared", kind: "shared" },
  { id: "add", label: "Add", href: "/add", kind: "add" },
  { id: "tags", label: "Tags", href: "/tags", kind: "tags" },
  { id: "profile", label: "Profile", href: "/profile", kind: "profile" },
];

const labelOnlyNav: AppShellPageNavItem[] = eciperayNav.map(({ kind: _kind, ...item }) => item);

/** The Eciperay shell as the app renders it: kind nav, Recipes current, account action, footer. */
export const Default: Story = {
  render: () => (
    <>
      <AppShellPage
        brand={{ label: "Eciperay", href: "/", mark: "eciperay" }}
        navItems={eciperayNav}
        navLabel="Eciperay sections"
        activeItemId="recipes"
        actions={[{ id: "sign-out", label: "Sign out", onPress: () => {} }]}
        footer={eciperayFooterFixture}
      >
        <RecipesContent />
      </AppShellPage>
    </>
  ),
};

/** Header search supplied (#542): the shell keeps the host's header search as DS chrome. */
export const WithSearch: Story = {
  render: () => (
    <>
      <AppShellPage
        brand={{ label: "Eciperay", href: "/", mark: "eciperay" }}
        navItems={eciperayNav}
        navLabel="Eciperay sections"
        activeItemId="recipes"
        search={{
          label: "Search recipes",
          placeholder: "Search recipes",
          value: "soup",
          onValueChange: () => {},
          onSubmit: () => {},
        }}
        actions={[{ id: "sign-out", label: "Sign out", onPress: () => {} }]}
        footer={eciperayFooterFixture}
      >
        <RecipesContent />
      </AppShellPage>
    </>
  ),
};

/** Nav items may omit the icon name — the label alone renders. */
export const NoIcons: Story = {
  render: () => (
    <>
      <AppShellPage
        brand={{ label: "Eciperay", href: "/", mark: "eciperay" }}
        navItems={labelOnlyNav}
        navLabel="Eciperay sections"
        activeItemId="home"
        footer={eciperayFooterFixture}
      >
        <RecipesContent />
      </AppShellPage>
    </>
  ),
};

/** The signed-out shell: header actions are links (Sign in / Create account navigate). */
export const LinkActions: Story = {
  render: () => (
    <>
      <AppShellPage
        brand={{ label: "Eciperay", href: "/", mark: "eciperay" }}
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
    </>
  ),
};

/** No footer data supplied: no footer band renders and none is reserved. */
export const NoFooter: Story = {
  render: () => (
    <>
      <AppShellPage
        brand={{ label: "Eciperay", href: "/", mark: "eciperay" }}
        navItems={eciperayNav}
        navLabel="Eciperay sections"
        activeItemId="meals"
        actions={[{ id: "sign-out", label: "Sign out", onPress: () => {} }]}
      >
        <RecipesContent />
      </AppShellPage>
    </>
  ),
};

/** With a non-blocking notice (#765): message only, above the content. */
export const WithNotice: Story = {
  render: () => (
    <>
      <AppShellPage
        brand={{ label: "Eciperay", href: "/", mark: "eciperay" }}
        navItems={eciperayNav}
        navLabel="Eciperay sections"
        activeItemId="recipes"
        actions={[{ id: "sign-out", label: "Sign out", onPress: () => {} }]}
        footer={eciperayFooterFixture}
        notice={{ message: "Your profile could not be loaded." }}
      >
        <RecipesContent />
      </AppShellPage>
    </>
  ),
};

/** With a notice carrying a recovery action (#765): message plus a retry Button. */
export const WithNoticeAction: Story = {
  render: () => (
    <>
      <AppShellPage
        brand={{ label: "Eciperay", href: "/", mark: "eciperay" }}
        navItems={eciperayNav}
        navLabel="Eciperay sections"
        activeItemId="recipes"
        actions={[{ id: "sign-out", label: "Sign out", onPress: () => {} }]}
        footer={eciperayFooterFixture}
        notice={{
          message: "Your profile could not be loaded.",
          action: { label: "Try again", onPress: () => {} },
        }}
      >
        <RecipesContent />
      </AppShellPage>
    </>
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
    <>
      <AppShellPage
        brand={{ label: "Eciperay", href: "/", mark: "eciperay" }}
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
    </>
  ),
};
