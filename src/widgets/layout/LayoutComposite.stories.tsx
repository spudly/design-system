import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { Text } from "../data/Text.js";
import { Spinner } from "../feedback/Spinner.js";
import { AppTopBar } from "./AppTopBar.js";
import { Card } from "./Card.js";
import { CardGrid } from "./CardGrid.js";
import { CardRow } from "./CardRow.js";
import { Center } from "./Center.js";
import { Col } from "./Col.js";
import { Row } from "./Row.js";
import { ScreenContainer } from "./ScreenContainer.js";

/**
 * Composite story (#711): the layout & structure widgets rendered
 * together, so cross-widget inconsistencies — the gap scale reading
 * the same across Row and Col; card treatments
 * across Card, CardRow, and CardGrid; shell padding — are visible
 * at a glance instead of hidden by isolated stories.
 *
 * Stories only: no component behavior lives here. Any inconsistency
 * this surface exposes gets filed as its own bug issue, never fixed
 * inside this story's PR.
 */
const meta: Meta = {
  title: "Widgets/Layout & Structure/Composite: Layout System",
};

export default meta;
type Story = StoryObj;

/** Row and Col across the shared vocabulary: gap sizes, alignment
 * and distribution props, wrapping, and the padding props — the
 * surface where the two primitives must read identically. */
export const RowColMatrix: Story = {
  render: () => (
    <YStack maxWidth={480} gap={20}>
      <Row gap="s">
        <Text>Gap S</Text>
        <Text>Second</Text>
        <Text>Third</Text>
      </Row>
      <Row gap="m">
        <Text>Gap M</Text>
        <Text>Second</Text>
        <Text>Third</Text>
      </Row>
      <Row gap="l">
        <Text>Gap L</Text>
        <Text>Second</Text>
        <Text>Third</Text>
      </Row>
      <Row middle between>
        <Text>Middle</Text>
        <Text>Between</Text>
      </Row>
      <Row middle wrap gap="s">
        <Text>Wrap one</Text>
        <Text>Wrap two</Text>
        <Text>Wrap three</Text>
        <Text>Wrap four</Text>
        <Text>Wrap five</Text>
        <Text>Wrap six</Text>
      </Row>
      <Col gap="s">
        <Text>Column gap S — first block</Text>
        <Text>Second block</Text>
      </Col>
      <Col gap="l">
        <Text>Column gap L — first block</Text>
        <Text>Second block</Text>
      </Col>
      <Row p="l" gap="m">
        <Text>Padded row</Text>
        <Text>Second</Text>
      </Row>
      <Col px="xl" py="s" gap="s">
        <Text>Padded column block one</Text>
        <Text>Padded column block two</Text>
      </Col>
    </YStack>
  ),
};

/** The stack rhythms as Col configurations, and the card
 * arrangements, with identical content, so each rhythm and each
 * card treatment compares directly against its siblings. */
export const StacksAndCards: Story = {
  render: () => (
    <YStack maxWidth={480} gap={24}>
      <Col gap="m">
        <Text variant="subheading">Col gap m stretch</Text>
        <Text>First block of content.</Text>
        <Text>Second block of content.</Text>
      </Col>
      <Col gap="xxl">
        <Text variant="subheading">Col gap xxl stretch</Text>
        <Text>First block of content.</Text>
        <Text>Second block of content.</Text>
      </Col>
      <Col gap="s">
        <Text variant="subheading">Col gap s stretch</Text>
        <Text>First block of content.</Text>
        <Text>Second block of content.</Text>
      </Col>
      <Col gap="xs">
        <Text variant="subheading">Col gap xs stretch</Text>
        <Text>First block of content.</Text>
        <Text>Second block of content.</Text>
      </Col>
      <Col gap="m">
        <Text variant="subheading">Col gap m</Text>
        <Text>First block of content.</Text>
        <Text>Second block of content.</Text>
      </Col>
      <Col gap="s">
        <Card>
          <Text variant="subheading">Card in a stack</Text>
          <Text variant="body">Default card treatment.</Text>
        </Card>
        <Card variant="bordered">
          <Text variant="subheading">Bordered card</Text>
          <Text variant="body">Outline only, no surface fill.</Text>
        </Card>
        <Card variant="muted">
          <Text variant="subheading">Muted card</Text>
          <Text variant="body">Recessed page-background fill.</Text>
        </Card>
        <Card elevated>
          <Text variant="subheading">Elevated card</Text>
          <Text variant="body">Raised treatment.</Text>
        </Card>
      </Col>
      <Row gap="m">
        <YStack flex={1}>
          <CardRow
            title="Weeknight favorites"
            subtitle="4 entries · 12,400 cal"
            onPress={() => {}}
          />
        </YStack>
        <YStack flex={1}>
          <CardRow title="Slow Sundays" subtitle="3 entries · 9,850 cal" onPress={() => {}} />
        </YStack>
      </Row>
      <CardGrid>
        <Card>
          <Text variant="subheading">Grid card one</Text>
          <Text color="$textMuted">First grid cell.</Text>
        </Card>
        <Card>
          <Text variant="subheading">Grid card two</Text>
          <Text color="$textMuted">Second grid cell.</Text>
        </Card>
        <Card>
          <Text variant="subheading">Grid card three</Text>
          <Text color="$textMuted">Third grid cell.</Text>
        </Card>
      </CardGrid>
    </YStack>
  ),
};

/** A screen shell end to end: the app top bar over a scrolling
 * screen container, with a centered loading state in a framed
 * block beneath — the layout primitives composed as a page. */
export const ScreenShell: Story = {
  render: () => (
    <YStack maxWidth={640} gap={20}>
      <AppTopBar
        brand={{ label: "Eciperay", href: "/", mark: "eciperay" }}
        navItems={[
          { id: "home", label: "Home", href: "/", kind: "home" },
          { id: "recipes", label: "Recipes", href: "/recipes", kind: "recipes" },
          { id: "meals", label: "Meals", href: "/meals", kind: "meals" },
          { id: "profile", label: "Profile", href: "/profile", kind: "profile" },
        ]}
        navLabel="Eciperay sections"
        activeItemId="recipes"
        actions={[{ id: "sign-out", label: "Sign out", onPress: () => {} }]}
      />
      <YStack height={300} borderWidth={1} borderColor="#ccc" borderStyle="dashed">
        <ScreenContainer>
          <Text variant="heading">My recipes</Text>
          {[
            "Tuscan chicken",
            "Stuffed peppers",
            "Beef chili",
            "Arroz con pollo",
            "Fudgy brownies",
            "Weeknight pasta",
          ].map((name) => (
            <Card key={name}>
              <Text variant="body">{name}</Text>
            </Card>
          ))}
        </ScreenContainer>
      </YStack>
      <YStack height={160} borderWidth={1} borderColor="$borderColor">
        <Center fill>
          <Spinner label="Loading" />
        </Center>
      </YStack>
    </YStack>
  ),
};
