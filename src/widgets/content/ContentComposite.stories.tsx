import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { tokens } from "../../tokens/index.js";
import { eciperayFooterFixture } from "../../pages/shared/fixtures.js";
import { Button } from "../actions/Button.js";
import { TextLink } from "../actions/TextLink.js";
import { Text } from "../data/Text.js";
import { BigFooter } from "./BigFooter.js";
import { CenteredText } from "./CenteredText.js";
import { ChatTranscript } from "./ChatTranscript.js";
import { CreatedSecretPanel } from "./CreatedSecretPanel.js";
import { DashedPlaceholder } from "./DashedPlaceholder.js";
import { DiscoveryCard } from "./DiscoveryCard.js";
import { LegalSection } from "./LegalSection.js";
import { MessageCard } from "./MessageCard.js";
import { OptionCard } from "./OptionCard.js";
import { OverlayTextPanel } from "./OverlayTextPanel.js";
import { PreviewCard } from "./PreviewCard.js";
import { SectionCard } from "./SectionCard.js";
import { SectionHeading } from "./SectionHeading.js";
import { TextActionCardRow } from "./TextActionCardRow.js";

/**
 * Composite story (#711): every content widget rendered together in
 * realistic page arrangements, so cross-widget inconsistencies —
 * card padding and corner treatments across the card family,
 * heading rhythm, subtitle formats — are visible at a glance
 * instead of hidden by isolated stories.
 *
 * Stories only: no component behavior lives here. Any inconsistency
 * this surface exposes gets filed as its own bug issue, never fixed
 * inside this story's PR.
 */
const meta: Meta = {
  title: "Widgets/Content/Composite: Content Page",
};

export default meta;
type Story = StoryObj;

const noop = () => {};

/** A browse page: section headings over discovery cards and
 * action rows — the catalog surface where the card family's
 * padding, radii, and subtitle rhythm compare directly. */
export const BrowsePage: Story = {
  render: () => (
    <YStack maxWidth={430} gap={16}>
      <SectionHeading icon="list">Fresh this week</SectionHeading>
      <DiscoveryCard
        title="Creamy Tuscan Garlic Chicken"
        subtitle="By Maria · ★ 4.5 · Satiety 60"
        href="/recipe/tuscan-chicken/creamy-tuscan-garlic-chicken"
        actions={[
          { id: "hide", label: "Hide this recipe", onSelect: noop },
          { id: "show-less", label: "Show less like this", onSelect: noop },
        ]}
      />
      <DiscoveryCard
        title="Classic Stuffed Peppers"
        subtitle="By Anonymous · ★ 5 · Satiety 72"
        href="/recipe/stuffed-peppers/classic-stuffed-peppers"
      />
      <DiscoveryCard title="Beef Chili" href="/recipe/beef-chili/beef-chili" />
      <SectionHeading>Your meal plans</SectionHeading>
      <TextActionCardRow
        title="Taco night"
        subtitle="Beef tacos, elote, lime crema"
        href="/meals/1"
        actionLabel="Delete"
        onActionPress={noop}
      />
      <TextActionCardRow
        title="Soup Sunday"
        href="/meals/2"
        actionLabel="Delete"
        onActionPress={noop}
      />
    </YStack>
  ),
};

/** The card and panel family side by side: option cards, a preview
 * card, section cards in their variants, a message card, a chat
 * transcript, a created-secret panel, and an overlay text panel. */
export const CardsAndPanels: Story = {
  render: () => (
    <YStack maxWidth={480} gap={16}>
      <OptionCard
        title="Manual entry"
        description="Type or paste a recipe by hand"
        onPress={noop}
      />
      <OptionCard
        title="Import from URL"
        description="Pull a recipe from a website link"
        onPress={noop}
      />
      <PreviewCard title="Your recipe" actions={<Button variant="primary">Looks good</Button>}>
        <Text>Tuscan Chicken — 4 servings, 15 min prep, 30 min cook.</Text>
      </PreviewCard>
      <SectionCard
        title="Profile"
        action={
          <Button ghost size="sm">
            Edit
          </Button>
        }
      >
        <Text variant="body">Stephen</Text>
        <Text variant="hint">stephen@example.com</Text>
      </SectionCard>
      <SectionCard title="Ingredients" variant="bordered">
        <Text variant="body">Outline-only section, no surface fill.</Text>
      </SectionCard>
      <SectionCard title="Cook history" variant="muted">
        <Text variant="body">Recessed section on the page-background tone.</Text>
      </SectionCard>
      <MessageCard title="Page not found" message="This page may have moved or no longer exists." />
      <ChatTranscript
        messages={[
          { own: false, author: "Plan", content: "Here is a first draft of your week." },
          { own: true, author: "You", content: "Swap Tuesday's dinner for something quicker." },
          { own: false, author: "Plan", content: "Done — Tuesday is now a 20-minute meal." },
        ]}
      />
      <CreatedSecretPanel
        title="Your new token"
        secret="eci_live_example_token_value"
        hint="Copy it now — it won't be shown again."
        doneLabel="Done"
        onDismiss={noop}
      />
      <YStack backgroundColor={tokens.colors.gray.gray9} padding="$4">
        <OverlayTextPanel heading="Panel heading" lines={["First line", "Second line"]} />
      </YStack>
    </YStack>
  ),
};

/** Empty-state and closing content: centered text over a dashed
 * placeholder, the legal section, and the big footer that ends
 * the page. */
export const EmptyAndClosing: Story = {
  render: () => (
    <YStack maxWidth={430} gap={16}>
      <CenteredText muted>Your recipes, plans, and lists in one place.</CenteredText>
      <DashedPlaceholder>
        <Text variant="hint">Nothing here yet</Text>
      </DashedPlaceholder>
      <LegalSection title="Legal">
        <TextLink href="#/privacy">Privacy Policy</TextLink>
        <TextLink href="#/terms">Terms of Service</TextLink>
      </LegalSection>
      <BigFooter footer={eciperayFooterFixture} />
    </YStack>
  ),
};
