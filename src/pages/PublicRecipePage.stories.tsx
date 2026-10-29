import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "../components/Text.js";
import { View } from "tamagui";
import { PublicRecipePage, type PublicRecipePageProps } from "./PublicRecipePage.js";
import { tagColorNameForHex } from "../themes/tagColors.js";
import { recipeDetailFixture } from "./fixtures.js";

/**
 * Stories for the real PublicRecipePage component (#169) — not a
 * made-up page composition: this renders the same component the
 * Eciperay web app will consume, driven by fixture props (the
 * Tuscan chicken from recipeDetailFixture, as in the
 * RecipeDetailPage stories).
 *
 * The public surface is wide (the PublicPageFrame column is
 * max-w-3xl), so the frame pins a desktop viewport (1024×900)
 * instead of the phone frame the app pages use: the page is a
 * flex column over a single scroll view, so a bounded viewport is
 * what it composes against, and fixed dimensions keep Chromatic
 * screenshots deterministic. Theme pinned to Warm Harvest,
 * Eciperay's brand. The host wraps the page in PublicPageFrame;
 * these stories render the page alone, as the RecipeDetailPage
 * stories render that page alone.
 */
const meta: Meta<typeof PublicRecipePage> = {
  title: "Pages/Eciperay/PublicRecipePage",
  component: PublicRecipePage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof PublicRecipePage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={1024} maxWidth="100%" height={900}>
      {children}
    </View>
  );
}

/** Fixture stand-in for app-side slot content (the comments
 * section, whose query and mutations stay in the app) — a plain
 * dashed panel, not a form, per the RecipesPage ExpandedAccessory
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

function PublicRecipePageDemo({
  variant = "full",
  signedIn = false,
  clonePending = false,
  initialMissing = [],
  showCommentsSlot = false,
}: {
  variant?: "full" | "minimal";
  signedIn?: boolean;
  clonePending?: boolean;
  initialMissing?: string[];
  showCommentsSlot?: boolean;
}) {
  const isFull = variant === "full";
  const baseServings = isFull ? 4 : 2;
  const demoIngredients = isFull ? fullIngredients : minimalIngredients;

  const [servings, setServings] = useState(baseServings);
  const [missing, setMissing] = useState<ReadonlySet<string>>(() => new Set(initialMissing));
  const [viewerRating, setViewerRating] = useState<number | null>(4);

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

  const readyProps: PublicRecipePageProps = {
    state: "ready",
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
      status: isFull ? "perfected" : "idea",
      servingsLabel: String(servings),
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
    },
    ctas: signedIn
      ? { variant: "signedIn", isClonePending: clonePending }
      : { variant: "signedOut" },
    onSignUpPress: () => undefined,
    onClonePress: () => undefined,
    onGetAppPress: () => undefined,
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
    ...(isFull
      ? {
          ratings: {
            community: { stars: "★★★★★", label: "4.6 (9)" },
            // Signed out, the viewer is null and the star input
            // hides — the anonymous audience sees the community
            // rating only.
            viewer: signedIn ? { value: viewerRating } : null,
          },
          onViewerRatingChange: setViewerRating,
        }
      : {}),
    ...(showCommentsSlot
      ? {
          renderComments: () => (
            <SlotStandIn label="Comments render here (app-side fixture stand-in)" />
          ),
        }
      : {}),
  };

  return (
    <Viewport>
      <PublicRecipePage {...readyProps} />
    </Viewport>
  );
}

export const Default: Story = {
  render: () => <PublicRecipePageDemo showCommentsSlot />,
};

export const SignedIn: Story = {
  render: () => <PublicRecipePageDemo signedIn showCommentsSlot />,
};

export const ClonePending: Story = {
  // The signed-in CTA bar while the clone mutation is in flight:
  // the primary button reads "Saving…" and disables.
  render: () => <PublicRecipePageDemo signedIn clonePending />,
};

export const Minimal: Story = {
  render: () => <PublicRecipePageDemo variant="minimal" />,
};

export const Loading: Story = {
  render: () => (
    <Viewport>
      <PublicRecipePage state="loading" />
    </Viewport>
  ),
};

export const NotFound: Story = {
  render: () => (
    <Viewport>
      <PublicRecipePage state="notFound" />
    </Viewport>
  ),
};

export const Unavailable: Story = {
  render: () => (
    <Viewport>
      <PublicRecipePage state="unavailable" />
    </Viewport>
  ),
};

// Section story: the full page with the ingredients section's
// state exercised (missing ingredient + substitutions). The
// screenshots pin the page as composed; the contract test pins
// the section order.
export const Ingredients: Story = {
  render: () => <PublicRecipePageDemo initialMissing={["heavy-cream"]} />,
};
