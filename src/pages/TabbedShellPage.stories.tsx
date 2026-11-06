import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { Card } from "../widgets/Card.js";
import { SectionCard } from "../widgets/SectionCard.js";
import { Text } from "../widgets/Text.js";
import { TabbedShellPage, type TabbedShellPageTab } from "./TabbedShellPage.js";

/**
 * Stories for TabbedShellPage (#438 Part 5) — the tabbed app
 * shell Memorize's hosts hand-rolled before the frame existed.
 * The tab set, labels, and list label are Memorize's real shell
 * values (packages/web/src/App.tsx); the tab surfaces are static
 * stand-ins composed from DS components, the way the app's tab
 * hosts slot DS pages into the frame. The frame matches the
 * other page stories: a phone viewport (430×844) pinned so
 * Chromatic screenshots are deterministic, theme pinned to
 * Quiet Dawn, Memorize's brand.
 */
const meta: Meta<typeof TabbedShellPage> = {
  title: "Pages/Memorize/TabbedShellPage",
  component: TabbedShellPage,
  globals: { theme: "light_quietDawn" },
};

export default meta;
type Story = StoryObj<typeof TabbedShellPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

function VersesContent() {
  return (
    <>
      <SectionCard title="Continue">
        <Text variant="subheading">Alma 37:37</Text>
        <Text variant="verse">
          Counsel with the Lord in all thy doings, and he will direct thee for good.
        </Text>
      </SectionCard>
      <Card>
        <Text variant="subheading">Mosiah 2:17</Text>
        <Text variant="hint">In the service of your fellow beings</Text>
      </Card>
      <Card>
        <Text variant="subheading">Ether 12:27</Text>
        <Text variant="hint">Weakness become strong</Text>
      </Card>
    </>
  );
}

function SearchContent() {
  return (
    <SectionCard title="Search">
      <Text>Search the standard works by reference or text.</Text>
    </SectionCard>
  );
}

function ReviewContent() {
  return (
    <SectionCard title="Review">
      <Text>Verses due for review appear here.</Text>
    </SectionCard>
  );
}

function SettingsContent() {
  return (
    <SectionCard title="Settings">
      <Text>Memorization preferences and account settings.</Text>
    </SectionCard>
  );
}

const memorizeTabs: TabbedShellPageTab[] = [
  { id: "verses", label: "My verses", content: <VersesContent /> },
  { id: "search", label: "Search", content: <SearchContent /> },
  { id: "review", label: "Review", content: <ReviewContent /> },
  { id: "settings", label: "Settings", content: <SettingsContent /> },
];

/** The Memorize shell as the app renders it: label-only tabs, tab state host-held. */
function TabbedShellDemo() {
  const [activeTabId, setActiveTabId] = useState<string | null>("verses");
  return (
    <TabbedShellPage
      title="Memorize"
      tabsLabel="Memorize sections"
      tabs={memorizeTabs}
      activeTabId={activeTabId}
      onTabSelect={setActiveTabId}
    />
  );
}

export const TabbedShell: Story = {
  render: () => (
    <Viewport>
      <TabbedShellDemo />
    </Viewport>
  ),
};

/** Tabs may carry an icon NAME (data) — the glyph renders left of the label. */
function IconTabsDemo() {
  const [activeTabId, setActiveTabId] = useState<string | null>("home");
  return (
    <TabbedShellPage
      title="Tabbed app"
      tabsLabel="App sections"
      tabs={[
        { id: "home", label: "Home", icon: "home", content: <VersesContent /> },
        { id: "meals", label: "Meals", icon: "meals", content: <SearchContent /> },
        { id: "recipes", label: "Recipes", icon: "recipes", content: <ReviewContent /> },
        { id: "profile", label: "Profile", icon: "profile", content: <SettingsContent /> },
      ]}
      activeTabId={activeTabId}
      onTabSelect={setActiveTabId}
    />
  );
}

export const IconTabs: Story = {
  render: () => (
    <Viewport>
      <IconTabsDemo />
    </Viewport>
  ),
};

/** A child that suspends the way a pending lazy chunk does. */
function PendingContent(): never {
  throw new Promise(() => {});
}

/** The active tab's chunk is still loading: the slot shows the DS loading state. */
export const LoadingTabContent: Story = {
  render: () => (
    <Viewport>
      <TabbedShellPage
        title="Memorize"
        tabsLabel="Memorize sections"
        tabs={[
          { id: "verses", label: "My verses", content: <VersesContent /> },
          { id: "search", label: "Search", content: <PendingContent /> },
          { id: "review", label: "Review", content: <ReviewContent /> },
          { id: "settings", label: "Settings", content: <SettingsContent /> },
        ]}
        activeTabId="search"
        onTabSelect={() => {}}
      />
    </Viewport>
  ),
};

/** A child that fails the way a rejected lazy chunk import does. */
function FailingContent(): never {
  throw new Error("Failed to fetch dynamically imported module");
}

/**
 * The active tab's chunk failed to load: the internal boundary's
 * fallback (error alert + Reload the app) replaces the surface;
 * the shell and the other tabs stay usable.
 */
export const ChunkFailedTabContent: Story = {
  render: () => (
    <Viewport>
      <TabbedShellPage
        title="Memorize"
        tabsLabel="Memorize sections"
        tabs={[
          { id: "verses", label: "My verses", content: <VersesContent /> },
          { id: "search", label: "Search", content: <FailingContent /> },
          { id: "review", label: "Review", content: <ReviewContent /> },
          { id: "settings", label: "Settings", content: <SettingsContent /> },
        ]}
        activeTabId="search"
        onTabSelect={() => {}}
        // A no-op reload in Storybook so the fallback stays on
        // screen for inspection instead of reloading the page.
        onReload={() => {}}
      />
    </Viewport>
  ),
};

/**
 * The drill case (Memorize's /drill/:id): an override surface
 * replaces the tab content and NO tab is selected.
 */
export const DrillOpen: Story = {
  render: () => (
    <Viewport>
      <TabbedShellPage
        title="Memorize"
        tabsLabel="Memorize sections"
        tabs={memorizeTabs}
        activeTabId={null}
        onTabSelect={() => {}}
      >
        <SectionCard title="Drill — Alma 37:37">
          <Text variant="verse">
            Counsel with the Lord in all thy doings, and he will direct thee for ____.
          </Text>
        </SectionCard>
      </TabbedShellPage>
    </Viewport>
  ),
};

/** The link form: tabs navigate (real hrefs); the host renders the current page as children. */
export const LinkTabs: Story = {
  render: () => (
    <Viewport>
      <TabbedShellPage
        variant="link"
        title="Memorize"
        tabsLabel="Memorize sections"
        tabs={[
          { id: "verses", label: "My verses", href: "/verses" },
          { id: "search", label: "Search", href: "/search" },
          { id: "review", label: "Review", href: "/review" },
          { id: "settings", label: "Settings", href: "/settings" },
        ]}
        activeTabId="verses"
      >
        <VersesContent />
      </TabbedShellPage>
    </Viewport>
  ),
};
