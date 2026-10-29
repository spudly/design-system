import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "../components/Text.js";
import { View } from "tamagui";
import { RecipeDetailPage, type RecipeDetailPageProps } from "./RecipeDetailPage.js";
import { tagColorNameForHex } from "../themes/tagColors.js";
import { recipeDetailFixture } from "./fixtures.js";
import { tokens } from "../tokens/index.js";

/**
 * Stories for the real RecipeDetailPage component (#49) — not a
 * made-up page composition: this renders the same component the
 * Eciperay app will consume, driven by fixture props. It succeeds
 * the RecipeDetail demo in Pages/Eciperay (#44), whose fixture
 * (recipeDetailFixture, the Tuscan chicken) supplies the title,
 * ingredients, and steps below; the demo stays as the spec until
 * the app rewires onto this component.
 *
 * Like RecipesPage, the frame pins a phone viewport (430×844): the
 * page is a flex column (pinned chrome over a scroll view), so a
 * bounded viewport is what it composes against, and fixed
 * dimensions keep Chromatic screenshots deterministic. Theme
 * pinned to Warm Harvest, Eciperay's brand.
 */
const meta: Meta<typeof RecipeDetailPage> = {
  title: "Pages/Eciperay/RecipeDetailPage",
  component: RecipeDetailPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof RecipeDetailPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

/** Fixture stand-in for app-side slot content (forms and panels
 * whose state and mutations stay in the app) — a plain dashed
 * panel, not a form, per the RecipesPage ExpandedAccessory
 * precedent. */
function SlotStandIn({ label }: { label: string }) {
  return (
    <View
      borderWidth={1}
      borderColor="#b08968"
      borderStyle="dashed"
      borderRadius={8}
      paddingVertical={12}
      paddingHorizontal={16}
    >
      <Text variant="body">{label}</Text>
    </View>
  );
}

const SCALE_MULTIPLIERS = [0.5, 1, 2, 3];

function scaleValueFor(baseServings: number, servings: number): string {
  const match = SCALE_MULTIPLIERS.find((multiplier) => {
    const scaled = Math.max(1, Math.round(baseServings * multiplier));
    return servings === scaled && (servings !== baseServings || multiplier === 1);
  });
  if (match !== undefined) {
    return String(match);
  }
  // No preset matches (a directly entered servings count, or the
  // custom scale field): the scale is the exact servings ratio, so
  // the page's custom scale chip shows it selected ("4×", "2.5×").
  return String(Math.round((servings / baseServings) * 100) / 100);
}

type DemoIngredient = {
  id: string;
  name: string;
  /** Quantity prefix per reachable servings count; the demo
   * recomputes the formatted line the way the app would. */
  quantityByServings?: Record<number, string>;
  isOptional?: boolean;
};

const fullIngredients: DemoIngredient[] = [
  {
    id: "chicken",
    name: "chicken breasts, sliced",
    quantityByServings: { 2: "3/4 lb", 4: "1 1/2 lb", 8: "3 lb", 12: "4 1/2 lb" },
  },
  {
    id: "garlic",
    name: "garlic cloves, minced",
    quantityByServings: { 2: "2", 4: "4", 8: "8", 12: "12" },
  },
  {
    id: "tomatoes",
    name: "sun-dried tomatoes, drained",
    quantityByServings: { 2: "1/4 cup", 4: "1/2 cup", 8: "1 cup", 12: "1 1/2 cups" },
  },
  {
    id: "heavy-cream",
    name: "heavy cream",
    quantityByServings: { 2: "1/2 cup", 4: "1 cup", 8: "2 cups", 12: "3 cups" },
  },
  {
    id: "spinach",
    name: "baby spinach",
    quantityByServings: { 2: "1 cup", 4: "2 cups", 8: "4 cups", 12: "6 cups" },
  },
  {
    id: "parmesan",
    name: "Parmesan cheese, grated",
    quantityByServings: { 2: "1/4 cup", 4: "1/2 cup", 8: "1 cup", 12: "1 1/2 cups" },
    isOptional: true,
  },
];

const minimalIngredients: DemoIngredient[] = [
  { id: "pasta", name: "spaghetti" },
  { id: "tomatoes", name: "crushed tomatoes" },
];

function RecipeDetailPageDemo({
  variant = "full",
  initialMissing = [],
  cookLogFormOpen = false,
  showPanelSlots = false,
}: {
  variant?: "full" | "minimal";
  initialMissing?: string[];
  cookLogFormOpen?: boolean;
  showPanelSlots?: boolean;
}) {
  const isFull = variant === "full";
  const baseServings = isFull ? 4 : 2;
  const demoIngredients = isFull ? fullIngredients : minimalIngredients;

  const [selectedVersionId, setSelectedVersionId] = useState(isFull ? "version-3" : "version-1");
  const [servings, setServings] = useState(baseServings);
  const [missing, setMissing] = useState<ReadonlySet<string>>(() => new Set(initialMissing));
  const [viewerRating, setViewerRating] = useState<number | null>(isFull ? 4 : null);
  const [formOpen, setFormOpen] = useState(cookLogFormOpen);

  const toggleMissing = (id: string) => {
    setMissing((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const readyProps: RecipeDetailPageProps = {
    state: "ready",
    status: isFull ? "evolving" : "idea",
    versions: isFull
      ? [
          { id: "version-3", label: "v3 — Active: Sear the chicken harder", versionNumber: 3 },
          { id: "version-2", label: "v2 — Archived: Initial import", versionNumber: 2 },
          { id: "version-1", label: "v1 — Archived: First draft", versionNumber: 1 },
        ]
      : [{ id: "version-1", label: "v1 — Active", versionNumber: 1 }],
    selectedVersionId,
    onSelectVersion: setSelectedVersionId,
    overview: {
      title: isFull ? recipeDetailFixture.title : "Weeknight Tomato Pasta",
      ...(isFull
        ? {
            description:
              "A one-pan weeknight chicken in a garlicky cream sauce with sun-dried tomatoes and spinach.",
            prepTimeLabel: "15m",
            cookTimeLabel: "30m",
          }
        : {}),
      servingsLabel: String(servings),
      cookingHref: "/recipes/1/cook",
      onPrintPress: () => undefined,
      onSharePress: () => undefined,
      editHref: "/recipes/1/edit",
      ...(isFull ? { editDraftHref: "/recipes/1/edit-draft" } : {}),
      onDeletePress: () => undefined,
      lifecycle: isFull
        ? {
            isEditable: true,
            candidates: [{ id: "version-4", label: "v4: Add the spinach at the very end" }],
          }
        : null,
      onTweakManuallyPress: () => undefined,
      tweakAiHref: "/recipes/1/tweak-ai",
      onMarkPerfectedPress: () => undefined,
      onAbandonPress: () => undefined,
      onActivateCandidatePress: () => undefined,
      // Tag colors are names at the prop boundary (#207): stored
      // hexes convert through `tagColorNameForHex`, as the host's
      // data layer does — the two hex stand-ins below are legacy
      // palette values mapping to orange and teal.
      tags: isFull
        ? [
            { id: "dinner", name: "Dinner", color: tagColorNameForHex("#f97316") },
            { id: "chicken", name: "Chicken", color: "indigo" },
            { id: "one-pan", name: "One pan", color: tagColorNameForHex("#14b8a6") },
          ]
        : [],
      ratings: {
        community: isFull ? { stars: "★★★★★", label: "4.6 (9)" } : null,
        viewer: isFull ? { value: viewerRating } : null,
      },
      onViewerRatingChange: setViewerRating,
      ...(showPanelSlots
        ? {
            renderSharingControls: () => (
              <SlotStandIn label="Sharing controls render here (app-side fixture stand-in)" />
            ),
            renderComments: () => (
              <SlotStandIn label="Comments render here (app-side fixture stand-in)" />
            ),
          }
        : {}),
    },
    ingredients: {
      servings,
      onServingsChange: setServings,
      scaleValue: scaleValueFor(baseServings, servings),
      onScaleChange: (value) => {
        setServings(Math.max(1, Math.round(baseServings * Number(value))));
      },
      ingredients: demoIngredients.map((ingredient) => {
        const prefix =
          ingredient.quantityByServings?.[servings] ??
          ingredient.quantityByServings?.[baseServings];
        return {
          id: ingredient.id,
          label: prefix ? `${prefix} ${ingredient.name}` : ingredient.name,
          isOptional: ingredient.isOptional ?? false,
          isMissing: missing.has(ingredient.id),
        };
      }),
      onIngredientPress: toggleMissing,
      substitutions:
        isFull && missing.has("heavy-cream")
          ? [
              {
                ingredient: "Heavy cream",
                suggestions: "Half-and-half, evaporated milk, or coconut cream",
              },
            ]
          : [],
    },
    instructions: {
      instructions: isFull
        ? recipeDetailFixture.steps.map((body, i) => ({
            id: `step-${i + 1}`,
            stepNumber: i + 1,
            body,
          }))
        : [
            {
              id: "step-1",
              stepNumber: 1,
              body: "Boil the pasta, warm the tomatoes through, combine.",
            },
          ],
    },
    history: {
      cookLogs: isFull
        ? [
            {
              id: "log-1",
              dateLabel: "Oct 12, 2026",
              starRating: 5,
              notes: "Doubled the garlic — perfect.",
            },
            { id: "log-2", dateLabel: "Sep 28, 2026", starRating: 4, notes: null },
          ]
        : [],
      onLogCookPress: () => {
        setFormOpen(true);
      },
      onDeleteCookLogPress: () => undefined,
      ...(formOpen
        ? {
            renderCookLogForm: () => (
              <SlotStandIn label="Cook log form renders here (app-side fixture stand-in)" />
            ),
          }
        : {}),
    },
    nutrition: isFull
      ? {
          state: "ready",
          rows: [
            { label: "Calories", valueLabel: "520 kcal" },
            { label: "Protein", valueLabel: "42 g" },
            { label: "Carbohydrates", valueLabel: "18 g" },
            { label: "Fat", valueLabel: "31 g" },
            { label: "Sodium", valueLabel: "640 mg" },
          ],
          disclaimer:
            "Estimated from the ingredient list with AI; values are approximate and not a substitute for professional nutrition advice.",
          onRefreshPress: () => undefined,
        }
      : { state: "unavailable", onEstimatePress: () => undefined },
  };

  return (
    <Viewport>
      <RecipeDetailPage {...readyProps} />
    </Viewport>
  );
}

export const Default: Story = {
  render: () => <RecipeDetailPageDemo showPanelSlots />,
};

export const Minimal: Story = {
  render: () => <RecipeDetailPageDemo variant="minimal" />,
};

export const Loading: Story = {
  render: () => (
    <Viewport>
      <RecipeDetailPage state="loading" />
    </Viewport>
  ),
};

// Section stories (#71): the page is a single scroll now, so there
// is no tab to preselect — each story below renders the full page
// with that section's state exercised (missing ingredient +
// substitutions, cook logs, ready nutrition). The screenshots pin
// the page as composed; the contract test pins the section order.
export const Ingredients: Story = {
  render: () => <RecipeDetailPageDemo initialMissing={["heavy-cream"]} />,
};

export const Instructions: Story = {
  render: () => <RecipeDetailPageDemo />,
};

export const CookHistory: Story = {
  render: () => <RecipeDetailPageDemo />,
};

export const CookLogFormOpen: Story = {
  // The form slot replaces the "Log a cook" button when it renders
  // content — the snapshot pins that swap.
  render: () => <RecipeDetailPageDemo cookLogFormOpen />,
};

export const Nutrition: Story = {
  render: () => <RecipeDetailPageDemo />,
};
