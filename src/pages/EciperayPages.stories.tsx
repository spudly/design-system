import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { XStack, YStack } from "tamagui";
import { Avatar } from "../components/Avatar.js";
import { Badge } from "../components/Badge.js";
import { Button } from "../components/Button.js";
import { Card } from "../components/Card.js";
import { ChecklistRow } from "../components/ChecklistRow.js";
import { SearchField } from "../components/SearchField.js";
import { SectionCard } from "../components/SectionCard.js";
import { SelectField } from "../components/SelectField.js";
import { Text } from "../components/Text.js";
import { TextField } from "../components/TextField.js";
import { TextLink } from "../components/TextLink.js";
import { tokens } from "../tokens/index.js";
import { PageFrame } from "./PageFrame.js";
import {
  mealPlanFixture,
  recipeDetailFixture,
  recipeFixtures,
  sharedRecipeFixtures,
} from "./fixtures.js";

/**
 * Full-page demo stories for Eciperay's core screens (#44), composed
 * from @spudly/ui components with the static fixtures in ./fixtures.ts.
 * These are the visual spec for whole pages — component stories alone
 * would not have caught spudly/eciperay#162, where the Recipes screen
 * composed into a giant empty box. Every story pins the Warm Harvest
 * theme, Eciperay's brand, via its Storybook global.
 */
const meta: Meta = {
  title: "Pages/Eciperay",
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj;

function RecipeCard({ title, meta: metaLine, tags }: (typeof recipeFixtures)[number]) {
  return (
    <Card>
      <YStack gap={tokens.spacing[2]}>
        <Text variant="subheading">{title}</Text>
        <Text variant="hint">{metaLine}</Text>
        <XStack gap={tokens.spacing[2]} flexWrap="wrap">
          {tags.map((tag) => (
            <Badge key={tag} tone="info">
              {tag}
            </Badge>
          ))}
        </XStack>
      </YStack>
    </Card>
  );
}

/**
 * The #162 screen, mirroring the real RecipesListView composition
 * (spudly/eciperay packages/app): a `variant="list"` container, the
 * filter bar in a padded header block, then the recipe list. The
 * filter bar mirrors RecipeListFiltersBar control-for-control —
 * SearchField, the status SelectField, the Ingredient field, the
 * min/max calorie and satiety number fields, and the Sort by / Order
 * SelectFields — because those controls' sizing interactions with the
 * list are exactly what this page story exists to screenshot. The one
 * deliberate difference: the list is a mapped stack of cards, not
 * React Native's FlatList — this Storybook is web and composes only
 * @spudly/ui components, so the virtualized list itself cannot render
 * here (on-device coverage of the real list follows via #43).
 */
function RecipesBrowseDemo() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [sortDir, setSortDir] = useState("desc");
  return (
    <PageFrame variant="list">
      <YStack
        paddingHorizontal={tokens.spacing[4]}
        paddingTop={tokens.spacing[4]}
        paddingBottom={tokens.spacing[2]}
        gap={tokens.spacing[3]}
      >
        <SearchField placeholder="Search recipes…" value={query} onChangeText={setQuery} />
        <SelectField
          label="Status"
          value={status}
          onValueChange={setStatus}
          options={[
            { value: "all", label: "All statuses" },
            { value: "idea", label: "Idea" },
            { value: "evolving", label: "Evolving" },
            { value: "perfected", label: "Perfected" },
            { value: "abandoned", label: "Abandoned" },
          ]}
        />
        <TextField label="Ingredient" placeholder="e.g. chicken" />
        <XStack gap={tokens.spacing[2]}>
          <YStack flex={1}>
            <TextField label="Min cal" keyboardType="numeric" />
          </YStack>
          <YStack flex={1}>
            <TextField label="Max cal" keyboardType="numeric" />
          </YStack>
        </XStack>
        <XStack gap={tokens.spacing[2]}>
          <YStack flex={1}>
            <TextField label="Min satiety" keyboardType="numeric" />
          </YStack>
          <YStack flex={1}>
            <TextField label="Max satiety" keyboardType="numeric" />
          </YStack>
        </XStack>
        <SelectField
          label="Sort by"
          value={sort}
          onValueChange={setSort}
          options={[
            { value: "newest", label: "Newest" },
            { value: "rating", label: "Rating" },
            { value: "satiety", label: "Satiety" },
            { value: "calories", label: "Calories" },
          ]}
        />
        <SelectField
          label="Order"
          value={sortDir}
          onValueChange={setSortDir}
          options={[
            { value: "desc", label: "High to low" },
            { value: "asc", label: "Low to high" },
          ]}
        />
      </YStack>
      <YStack
        paddingHorizontal={tokens.spacing[4]}
        paddingBottom={tokens.spacing[8]}
        gap={tokens.spacing[3]}
      >
        {recipeFixtures.map((recipe) => (
          <RecipeCard key={recipe.title} {...recipe} />
        ))}
      </YStack>
    </PageFrame>
  );
}

export const RecipesBrowse: Story = {
  render: () => <RecipesBrowseDemo />,
};

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

export const SharedWithMe: Story = {
  render: () => (
    <PageFrame>
      <Text variant="heading">Shared with me</Text>
      <Text variant="hint">Recipes other people have shared with you.</Text>
      <YStack gap={tokens.spacing[3]}>
        {sharedRecipeFixtures.map((recipe) => (
          <Card key={recipe.title}>
            <XStack gap={tokens.spacing[3]} alignItems="center">
              <Avatar name={recipe.sharedBy} size={40} />
              <YStack gap={tokens.spacing[1]} flex={1}>
                <Text variant="subheading">{recipe.title}</Text>
                <Text variant="hint">
                  {recipe.meta} · Shared by {recipe.sharedBy}
                </Text>
              </YStack>
              <Badge tone="neutral">View only</Badge>
            </XStack>
          </Card>
        ))}
      </YStack>
    </PageFrame>
  ),
};
