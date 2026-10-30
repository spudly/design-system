import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { XStack, YStack } from "tamagui";
import { Badge } from "../components/Badge.js";
import { Button } from "../components/Button.js";
import { Card } from "../components/Card.js";
import { ChecklistRow } from "../components/ChecklistRow.js";
import { SectionCard } from "../components/SectionCard.js";
import { Text } from "../components/Text.js";
import { TextLink } from "../components/TextLink.js";
import { tokens } from "../tokens/index.js";
import { PageFrame } from "../components/PageFrame.js";
import { mealPlanFixture, recipeDetailFixture } from "./fixtures.js";

/**
 * Full-page demo stories for Eciperay's core screens (#44), composed
 * from @spudly/ui components with the static fixtures in ./fixtures.ts.
 * These are the visual spec for whole pages on web: they guard how the
 * pieces compose on a real screen, which component stories alone do
 * not show. Native-only rendering defects — spudly/eciperay#162's root
 * cause, a SearchField glyph that rendered correctly on web and only
 * exploded under Android's text layout — are the on-device Storybook
 * work in #43, not these web screenshots. Every story pins the Warm
 * Harvest theme, Eciperay's brand, via its Storybook global.
 *
 * The RecipesBrowse and SharedWithMe demos that opened this file are
 * retired (#185): the app rewired onto the real page components, and
 * the RecipesPage stories (Pages/Eciperay/RecipesPage, including the
 * Shared* stories for the Shared-with-me configuration) are those
 * screens' spec now.
 */
const meta: Meta = {
  title: "Pages/Eciperay",
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj;

function RecipeDetailDemo() {
  const [checked, setChecked] = useState<boolean[]>(
    recipeDetailFixture.ingredients.map(() => false),
  );
  return (
    <PageFrame>
      <TextLink onPress={() => undefined}>Back to recipes</TextLink>
      <Text variant="heading">{recipeDetailFixture.title}</Text>
      <Text variant="hint">{recipeDetailFixture.meta}</Text>
      <XStack gap={tokens.spacing[2]} flexWrap="wrap">
        {recipeDetailFixture.tags.map((tag) => (
          <Badge key={tag} tone="info">
            {tag}
          </Badge>
        ))}
      </XStack>
      <SectionCard title="Ingredients">
        <YStack>
          {recipeDetailFixture.ingredients.map((ingredient, index) => (
            <ChecklistRow
              key={ingredient.label}
              label={ingredient.label}
              metadata={ingredient.metadata}
              checked={checked[index] ?? false}
              onCheckedChange={(next) =>
                setChecked((rows) => rows.map((row, i) => (i === index ? next : row)))
              }
            />
          ))}
        </YStack>
      </SectionCard>
      <SectionCard title="Steps">
        <YStack gap={tokens.spacing[3]}>
          {recipeDetailFixture.steps.map((step, index) => (
            <Text key={step} variant="body">
              {index + 1}. {step}
            </Text>
          ))}
        </YStack>
      </SectionCard>
      <Button>Start cooking</Button>
    </PageFrame>
  );
}

export const RecipeDetail: Story = {
  render: () => <RecipeDetailDemo />,
};

export const MealPlans: Story = {
  render: () => (
    <PageFrame>
      <Text variant="heading">Meal plans</Text>
      <Text variant="hint">{mealPlanFixture.weekLabel}</Text>
      <YStack gap={tokens.spacing[3]}>
        {mealPlanFixture.days.map((entry) => (
          <Card key={entry.day}>
            <XStack justifyContent="space-between" alignItems="center" gap={tokens.spacing[3]}>
              <YStack gap={tokens.spacing[1]} flex={1}>
                <Text variant="subheading">
                  {entry.day} · {entry.dateLabel}
                </Text>
                <Text variant="body">{entry.dish}</Text>
              </YStack>
              <Text variant="hint">{entry.meta}</Text>
            </XStack>
          </Card>
        ))}
      </YStack>
      <Button variant="secondary">New meal plan</Button>
    </PageFrame>
  ),
};
