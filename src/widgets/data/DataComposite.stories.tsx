/* eslint-disable max-lines -- single component's story catalog is one cohesive demo unit; splitting it across files would scatter the stories Chromatic and reviewers browse together (#902 T4) */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { XStack, YStack } from "tamagui";

import { storyImageSquare } from "../../storyFixtures.js";
import { Col } from "../layout/Col.js";

import { Avatar } from "./Avatar.js";
import { Badge } from "./Badge.js";
import { BulletList } from "./BulletList.js";
import { CandidateList } from "./CandidateList.js";
import { ChecklistRow } from "./ChecklistRow.js";
import { Divider } from "./Divider.js";
import { ListItem } from "./ListItem.js";
import { MarkableRow } from "./MarkableRow.js";
import { MediaRow } from "./MediaRow.js";
import { MetadataBadge } from "./MetadataBadge.js";
import { NutritionPanel, type NutritionFacts } from "./NutritionPanel.js";
import { RatingsCard } from "./RatingsCard.js";
import { StepDots } from "./StepDots.js";
import { StepList } from "./StepList.js";
import { TagList } from "./TagList.js";
import { Text } from "./Text.js";
import { Thumbnail } from "./Thumbnail.js";

/**
 * Composite story (#711): every data-display widget rendered
 * together in realistic list and detail arrangements, so
 * cross-widget inconsistencies — row heights and separators across
 * the row family, badge treatments, badge alignment — are visible
 * at a glance instead of hidden by isolated stories.
 *
 * Stories only: no component behavior lives here. Any inconsistency
 * this surface exposes gets filed as its own bug issue, never fixed
 * inside this story's PR.
 */
const meta: Meta = {
  title: "Widgets/Data Display/Composite: Recipe Data",
};

export default meta;
type Story = StoryObj;

const noop = () => { /* noop */ };

const TAGS = [
  { id: "t1", name: "Weeknight", color: "red" },
  { id: "t2", name: "Gluten-free", color: "green" },
  { id: "t3", name: "Kid favorite", color: "amber" },
  { id: "t4", name: "Freezer friendly", color: "blue" },
] as const;

const FACTS: NutritionFacts = {
  servingSizeLabel: "1 cup (240g)",
  servingsPerContainerLabel: "about 2 servings per container",
  caloriesLabel: "520",
  nutrients: [
    { kind: "totalFat", amountLabel: "16g", dailyValueLabel: "21%" },
    { kind: "sodium", amountLabel: "640mg", dailyValueLabel: "28%" },
    { kind: "totalCarbohydrate", amountLabel: "48g", dailyValueLabel: "17%" },
    { kind: "dietaryFiber", amountLabel: "6g", dailyValueLabel: "21%" },
    { kind: "netCarbs", amountLabel: "42g" },
    { kind: "protein", amountLabel: "42g", dailyValueLabel: "84%" },
  ],
};

const STEPS = [
  {
    id: "s1",
    label: "Step 1",
    body: "Season the chicken and sear until golden, 6 minutes per side.",
  },
  { id: "s2", label: "Step 2", body: "Add the rice and broth, cover, and simmer 18 minutes." },
  { id: "s3", label: "Step 3", body: "Rest 5 minutes, then fluff and fold in the spinach." },
];

function ChecklistDemo() {
  const [oil, setOil] = useState(true);
  const [chicken, setChicken] = useState(false);
  return (
    <Col>
      <ChecklistRow
        label="2 tbsp olive oil"
        metadata="Pantry"
        checked={oil}
        onCheckedChange={setOil}
      />
      <ChecklistRow
        label="1 whole chicken (3–4 lb), patted dry"
        metadata="Meat & seafood"
        checked={chicken}
        onCheckedChange={setChicken}
      />
    </Col>
  );
}

function MarkableDemo() {
  const [marked, setMarked] = useState<Record<string, boolean>>({ rice: true });
  const toggle = (id: string) => {
    setMarked((current) => ({ ...current, [id]: !current[id] }));
  };
  return (
    <Col>
      <MarkableRow
        label="1 1/2 lb chicken thighs"
        isMarked={marked.chicken ?? false}
        onPress={() => { toggle("chicken"); }}
      />
      <MarkableRow
        label="2 cups jasmine rice"
        isMarked={marked.rice ?? false}
        onPress={() => { toggle("rice"); }}
      />
    </Col>
  );
}

/** The row family in one list: list items, media rows, checklist
 * rows, and markable rows separated by dividers — the surface
 * where row height, padding, and separator drift shows. */
export const RowFamily: Story = {
  render: () => (
    <YStack maxWidth={430} gap={16}>
      <Col>
        <ListItem title="Garlic cream chicken" subtitle="Serves 4 · 2,150 cal" onPress={noop} />
        <ListItem prefix="Meal · " title="Taco Tuesday" subtitle="Serves 4" onPress={noop} />
        <ListItem title="Archived recipe" subtitle="Unavailable" isDisabled onPress={noop} />
      </Col>
      <Divider />
      <YStack>
        <MediaRow href="/recipes/1" title="Weeknight Chili" subtitle="4 servings · 35 min" />
        <MediaRow
          href="/recipes/2"
          title="Shared Soup"
          subtitle="6 servings · 50 min"
          badgeLabel="Shared with you"
        />
      </YStack>
      <Divider />
      <ChecklistDemo />
      <Divider />
      <MarkableDemo />
    </YStack>
  ),
};

/** Badges, tags, stats, and identity marks together: every tone,
 * the tag colors, the metadata badges that carry the stats
 * (#743 — the stat tiles' replacement), avatars at working
 * sizes, a row thumbnail, and step dots. */
export const BadgesAndStats: Story = {
  render: () => (
    <YStack maxWidth={430} gap={16}>
      <XStack gap={8} flexWrap="wrap">
        <Badge tone="neutral">Learning</Badge>
        <Badge tone="info">Syncing</Badge>
        <Badge tone="success">Memorized</Badge>
        <Badge tone="warning">Due soon</Badge>
        <Badge tone="danger">Overdue</Badge>
      </XStack>
      <TagList tags={[...TAGS]} />
      <MetadataBadge parts={["Weeknight", "45 min", "Serves 4"]} />
      <MetadataBadge parts={["Servings 4", "Prep 15m", "Cook 30m"]} />
      <MetadataBadge parts={["Calories 520", "Protein 42g"]} />
      <XStack gap={12} alignItems="center">
        <Avatar name="Stephen Sorensen" />
        <Avatar name="Maria" size={48} />
        <Thumbnail src={storyImageSquare} variant="row" />
      </XStack>
      <StepDots count={4} activeIndex={1} label="Step 2 of 4" />
    </YStack>
  ),
};

/** Structured recipe content: steps, bullets, candidates, the
 * ratings card, and the nutrition panel in one detail column. */
export const StructuredContent: Story = {
  render: () => {
    const [viewer, setViewer] = useState<number | null>(4);
    return (
      <YStack maxWidth={430} gap={16}>
        <StepList steps={STEPS} />
        <BulletList
          items={[
            "Your email address, so we can sign you in.",
            "The recipes you save to your account.",
          ]}
        />
        <CandidateList
          title="Ready to activate"
          candidates={[
            { id: "v4", label: "v4 — Adds the slow-cooker variant" },
            { id: "v5", label: "v5 — Doubles the sauce" },
          ]}
          onActivatePress={noop}
        />
        <RatingsCard
          ratings={{
            community: { stars: "★★★★☆", label: "4.6 (9)" },
            viewer: { value: viewer },
          }}
          onViewerRatingChange={setViewer}
        />
        <NutritionPanel
          nutrition={{
            state: "ready",
            facts: FACTS,
            disclaimer: "Nutrition is estimated per serving.",
            onRefreshPress: noop,
          }}
        />
        <Text variant="hint">Nutrition is estimated per serving.</Text>
      </YStack>
    );
  },
};
