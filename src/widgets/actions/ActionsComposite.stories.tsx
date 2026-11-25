import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View, XStack, YStack } from "tamagui";
import { Badge } from "../data/Badge.js";
import { Text } from "../data/Text.js";
import { SelectField } from "../form/SelectField.js";
import { Card } from "../layout/Card.js";
import { ActionBar } from "./ActionBar.js";
import { BackLink } from "./BackLink.js";
import { BrandLink } from "./BrandLink.js";
import { Button } from "./Button.js";
import { ButtonRow } from "./ButtonRow.js";
import { ButtonStack } from "./ButtonStack.js";
import { LinkStack } from "./LinkStack.js";
import { PrevNextNav } from "./PrevNextNav.js";
import { StackedButtonRow } from "./StackedButtonRow.js";
import { Tabs } from "./Tabs.js";
import { TextLink } from "./TextLink.js";
import { Toolbar } from "./Toolbar.js";
import { TrailingActionsRow } from "./TrailingActionsRow.js";

/**
 * Composite story (#711): every actions & navigation widget rendered
 * together in realistic screen chrome, so cross-widget inconsistencies
 * — button heights across variants and sizes, link treatments, tab
 * alignment, pinned-bar spacing — are visible at a glance instead of
 * hidden by isolated stories.
 *
 * Stories only: no component behavior lives here. Any inconsistency
 * this surface exposes gets filed as its own bug issue, never fixed
 * inside this story's PR.
 */
const meta: Meta = {
  title: "Widgets/Actions & Navigation/Composite: Screen Actions",
};

export default meta;
type Story = StoryObj;

const noop = () => {};

const RECIPE_TABS = [
  { value: "overview", label: "Overview" },
  { value: "ingredients", label: "Ingredients" },
  { value: "instructions", label: "Instructions" },
];

const LINK_TABS = [
  { value: "recipes", label: "Recipes", href: "/recipes" },
  { value: "plans", label: "Meal plans", href: "/meals" },
  { value: "shared", label: "Shared", href: "/shared" },
];

/** A recipe screen's full chrome: brand header, back link, tabs,
 * content card with its action rows, step navigation, and the
 * pinned bottom action bar — every actions widget in situ. */
export const ScreenChrome: Story = {
  render: () => {
    const [tab, setTab] = useState("overview");
    return (
      <View
        position="relative"
        height={560}
        maxWidth={480}
        borderWidth={1}
        borderColor="#ccc"
        borderStyle="dashed"
        overflow="hidden"
      >
        <YStack padding={16} gap={16}>
          <XStack justifyContent="space-between" alignItems="center">
            <BrandLink label="Eciperay" href="/" mark="eciperay" />
            <Button ghost size="sm" onPress={noop}>
              Sign out
            </Button>
          </XStack>
          <BackLink label="Back to recipes" href="/recipes" />
          <Tabs tabs={RECIPE_TABS} value={tab} onValueChange={setTab} />
          <Card>
            <YStack gap={12}>
              <Text variant="body">
                Tender chicken, garlic cream sauce with spinach and sun-dried tomatoes.
              </Text>
              <TrailingActionsRow leading={<Badge color="green">Weeknight</Badge>}>
                <Button ghost size="sm" onPress={noop}>
                  Edit
                </Button>
                <Button ghost size="sm" variant="danger" onPress={noop}>
                  Delete
                </Button>
              </TrailingActionsRow>
              <ButtonRow>
                <Button onPress={noop}>Shopping list</Button>
                <Button variant="secondary" onPress={noop}>
                  Cook now
                </Button>
              </ButtonRow>
            </YStack>
          </Card>
          <Text variant="body">
            Adapted from <TextLink href="https://example.com/source">the original recipe</TextLink>{" "}
            — <TextLink onPress={noop}>report an issue</TextLink> if a step looks off.
          </Text>
          <PrevNextNav
            onBack={noop}
            onNext={noop}
            backLabel="Previous step"
            nextLabel="Start cooking"
          />
        </YStack>
        <ActionBar placement="bottom">
          <XStack gap={12} justifyContent="flex-end">
            <Button variant="secondary" onPress={noop}>
              Cancel
            </Button>
            <Button variant="primary" onPress={noop}>
              Save changes
            </Button>
          </XStack>
        </ActionBar>
      </View>
    );
  },
};

/** Every button form on one canvas: variants, ghost forms, sizes,
 * the stacked and equal-row arrangements, and a toolbar — the
 * surface where height or padding drift between forms shows. */
export const AllButtons: Story = {
  render: () => (
    <YStack maxWidth={430} gap={20}>
      <XStack gap={12} alignItems="center" flexWrap="wrap">
        <Button variant="primary" onPress={noop}>
          Primary
        </Button>
        <Button variant="secondary" onPress={noop}>
          Secondary
        </Button>
        <Button variant="danger" onPress={noop}>
          Danger
        </Button>
      </XStack>
      <XStack gap={12} alignItems="center" flexWrap="wrap">
        <Button ghost onPress={noop}>
          Ghost primary
        </Button>
        <Button ghost variant="secondary" onPress={noop}>
          Ghost secondary
        </Button>
        <Button ghost variant="danger" onPress={noop}>
          Ghost danger
        </Button>
      </XStack>
      <XStack gap={12} alignItems="center" flexWrap="wrap">
        <Button size="sm" onPress={noop}>
          Small
        </Button>
        <Button size="md" onPress={noop}>
          Medium
        </Button>
        <Button size="lg" onPress={noop}>
          Large
        </Button>
      </XStack>
      <ButtonRow equal>
        <Button variant="primary" onPress={noop}>
          Get started
        </Button>
        <Button variant="secondary" onPress={noop}>
          Learn more
        </Button>
      </ButtonRow>
      <ButtonStack>
        <Button variant="primary" onPress={noop}>
          Browse recipes
        </Button>
        <Button variant="secondary" onPress={noop}>
          Add a recipe
        </Button>
        <Button variant="secondary" onPress={noop}>
          Shared with me
        </Button>
      </ButtonStack>
      <StackedButtonRow>
        <Button href="/discover" variant="primary">
          Discover recipes
        </Button>
        <Button href="/sign-up" variant="secondary">
          Sign up
        </Button>
      </StackedButtonRow>
      <Toolbar>
        <Badge tone="info">Evolving</Badge>
        <SelectField
          label="Version"
          value="v3"
          options={[
            { value: "v3", label: "v3 — Active" },
            { value: "v2", label: "v2" },
            { value: "v1", label: "v1" },
          ]}
          onValueChange={() => {}}
          grow
        />
      </Toolbar>
    </YStack>
  ),
};

/** The navigation forms together: link tabs, a link stack, and
 * step navigation in its enabled and one-sided states. */
export const Navigation: Story = {
  render: () => (
    <YStack maxWidth={430} gap={20}>
      <Tabs variant="link" tabs={LINK_TABS} value="plans" />
      <LinkStack>
        <TextLink href="https://example.com/about">About</TextLink>
        <TextLink href="https://example.com/privacy">Privacy Policy</TextLink>
        <TextLink href="https://example.com/licenses">Open Source Licenses</TextLink>
      </LinkStack>
      <PrevNextNav onBack={noop} onNext={noop} />
      <PrevNextNav onNext={noop} nextLabel="Continue" />
      <PrevNextNav onBack={noop} onNext={noop} nextDisabled />
    </YStack>
  ),
};

/** Disabled treatment across the button variants and step nav. */
export const Disabled: Story = {
  render: () => (
    <YStack maxWidth={430} gap={20}>
      <XStack gap={12} alignItems="center" flexWrap="wrap">
        <Button variant="primary" disabled onPress={noop}>
          Primary
        </Button>
        <Button variant="secondary" disabled onPress={noop}>
          Secondary
        </Button>
        <Button variant="danger" disabled onPress={noop}>
          Danger
        </Button>
        <Button ghost disabled onPress={noop}>
          Ghost
        </Button>
      </XStack>
      <ButtonRow equal>
        <Button variant="primary" disabled onPress={noop}>
          Get started
        </Button>
        <Button variant="secondary" disabled onPress={noop}>
          Learn more
        </Button>
      </ButtonRow>
      <PrevNextNav onBack={noop} onNext={noop} backDisabled nextDisabled />
    </YStack>
  ),
};
