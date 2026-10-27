import { tagColorNames, type TagColorName } from "../themes/tagColors.js";
import type { TagsPageTag } from "./TagsPage.js";

/**
 * Static fixture data for the full-page demo stories (design-system#44).
 *
 * Rules — these keep page screenshots deterministic, which is what makes
 * the Chromatic diffs on these stories meaningful:
 * - No network calls, no real API/auth/backend data. Everything a page
 *   story renders comes from this file.
 * - No clocks or relative timestamps: dates are fixed literal strings
 *   ("Week of Monday, October 19, 2026"), never the current time,
 *   "2h ago", or anything that changes between runs.
 * - No external images: people are represented by Avatar's initials
 *   fallback, never an image URL.
 * - Data mirrors the real screens' content shape (titles, meta lines,
 *   ingredient/step lists, week plans) so a page story composes the way
 *   the real screen does — when a real screen's layout changes
 *   deliberately, update its page story in the same spirit.
 */

export interface RecipeFixture {
  title: string;
  meta: string;
  tags: string[];
}

export const recipeFixtures: RecipeFixture[] = [
  {
    title: "Creamy Tuscan Garlic Chicken",
    meta: "30 min · 4 servings",
    tags: ["Dinner", "Chicken"],
  },
  { title: "Classic Stuffed Peppers", meta: "45 min · 6 servings", tags: ["Dinner", "Beef"] },
  { title: "Arroz con Pollo", meta: "50 min · 8 servings", tags: ["Dinner", "Rice"] },
  { title: "Fudgy Brownies", meta: "35 min · 12 servings", tags: ["Dessert", "Baking"] },
];

export const recipeDetailFixture = {
  title: "Creamy Tuscan Garlic Chicken",
  meta: "30 min · 4 servings · Dinner",
  tags: ["Dinner", "Chicken", "One pan"],
  ingredients: [
    { label: "Chicken breasts", metadata: "1 1/2 lb, sliced" },
    { label: "Garlic cloves", metadata: "4, minced" },
    { label: "Sun-dried tomatoes", metadata: "1/2 cup, drained" },
    { label: "Heavy cream", metadata: "1 cup" },
    { label: "Baby spinach", metadata: "2 cups" },
    { label: "Parmesan cheese", metadata: "1/2 cup, grated" },
  ],
  steps: [
    "Season the chicken and sear in a large skillet until golden, about 5 minutes per side. Set aside.",
    "In the same skillet, cook the garlic and sun-dried tomatoes until fragrant, about 1 minute.",
    "Pour in the cream, simmer gently, and stir in the Parmesan until the sauce thickens.",
    "Wilt the spinach into the sauce, return the chicken, and simmer 5 minutes until cooked through.",
  ],
};

export interface MealPlanDayFixture {
  day: string;
  dateLabel: string;
  dish: string;
  meta: string;
}

/** Fixed week — the date labels are literals on purpose (see header). */
export const mealPlanFixture: { weekLabel: string; days: MealPlanDayFixture[] } = {
  weekLabel: "Week of Monday, October 19, 2026",
  days: [
    { day: "Monday", dateLabel: "Oct 19", dish: "Creamy Tuscan Garlic Chicken", meta: "30 min" },
    { day: "Tuesday", dateLabel: "Oct 20", dish: "Classic Stuffed Peppers", meta: "45 min" },
    { day: "Wednesday", dateLabel: "Oct 21", dish: "Arroz con Pollo", meta: "50 min" },
    { day: "Thursday", dateLabel: "Oct 22", dish: "Vegetable Stir-Fry", meta: "25 min" },
    { day: "Friday", dateLabel: "Oct 23", dish: "Homemade Pizza", meta: "40 min" },
    { day: "Saturday", dateLabel: "Oct 24", dish: "Fudgy Brownies", meta: "Dessert · 35 min" },
    { day: "Sunday", dateLabel: "Oct 25", dish: "Leftovers", meta: "No cooking" },
  ],
};

export interface SharedRecipeFixture {
  title: string;
  meta: string;
  sharedBy: string;
}

export const sharedRecipeFixtures: SharedRecipeFixture[] = [
  { title: "Arroz con Pollo", meta: "50 min · 8 servings", sharedBy: "Katie Sorensen" },
  { title: "Fudgy Brownies", meta: "35 min · 12 servings", sharedBy: "Melody Sorensen" },
  { title: "Banana Bread", meta: "60 min · 10 servings", sharedBy: "Raleigh Sorensen" },
];

export const passageFixture = {
  reference: "Psalm 23:1-3",
  text: "The LORD is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul.",
  drillWords: ["want", "pastures", "waters"],
};

export const verseListFixtures = [
  { reference: "Psalm 23:1", hint: "The LORD is my shepherd; I shall not want." },
  { reference: "Proverbs 3:5", hint: "Trust in the LORD with all your heart…" },
  { reference: "Philippians 4:6-7", hint: "Do not be anxious about anything…" },
  { reference: "Isaiah 40:31", hint: "But they who wait for the LORD shall renew their strength…" },
];

export const progressFixtures = {
  stats: [
    { value: "12", label: "verses mastered", sublabel: "of 20 in this set" },
    { value: "3", label: "in progress", sublabel: "started this month" },
    { value: "85%", label: "drill accuracy", sublabel: "last 7 days" },
  ],
  passages: [
    { reference: "Psalm 23:1-3", percent: 80 },
    { reference: "Proverbs 3:5-6", percent: 45 },
    { reference: "Isaiah 40:31", percent: 20 },
  ],
};

/**
 * Recipe form fixtures (#124): the option sets are app data in
 * production (the status set and the tags query are the app's);
 * here they are written out literally, mirroring the app form's
 * content for the same recipe as recipeDetailFixture.
 */
export const recipeFormFixture = {
  title: "Creamy Tuscan Garlic Chicken",
  description:
    "A one-pan weeknight chicken in a garlic cream sauce with sun-dried tomatoes and spinach.",
  servings: "4",
  prepTimeMin: "15",
  cookTimeMin: "25",
  // No scheme: the fixtures file bans external URLs outright
  // (pageStories.test) — the value is inert field text here.
  sourceUrl: "example.com/recipes/tuscan-garlic-chicken",
  statusOptions: [
    { value: "idea", label: "Idea" },
    { value: "evolving", label: "Evolving" },
    { value: "perfected", label: "Perfected" },
    { value: "abandoned", label: "Abandoned" },
  ],
  status: "evolving",
  tagOptions: [
    { value: "dinner", label: "Dinner" },
    { value: "chicken", label: "Chicken" },
    { value: "one-pan", label: "One pan" },
    { value: "weeknight", label: "Weeknight" },
  ],
  tagIds: ["dinner", "chicken", "one-pan"],
};

/**
 * Meal / meal-plan form fixtures (#125): the option sets are app
 * data in production (the recipe and meal queries are the app's);
 * here they are written out literally in the pages' view-model
 * shapes, mirroring the app forms' content.
 */
export const mealFormFixture = {
  title: "Sunday Chicken Dinner",
  notes: "The kids asked for the Tuscan chicken again.",
  recipeOptions: [
    { id: "tuscan-chicken", label: "Creamy Tuscan Garlic Chicken", servings: 4 },
    { id: "stuffed-peppers", label: "Classic Stuffed Peppers", servings: 6 },
    { id: "arroz-con-pollo", label: "Arroz con Pollo", servings: 8 },
    { id: "fudgy-brownies", label: "Fudgy Brownies", servings: 12 },
  ],
  selectedRecipeIds: ["tuscan-chicken", "fudgy-brownies"],
  servingsByRecipeId: { "tuscan-chicken": 6, "fudgy-brownies": 12 },
};

export const mealPlanFormFixture = {
  title: "Week of October 19",
  notes: "School nights need the fast recipes.",
  startsOn: "2026-10-19",
  endsOn: "2026-10-25",
  entryOptions: [
    { key: "meal:sunday-dinner", kind: "meal" as const, title: "Sunday Chicken Dinner" },
    { key: "meal:taco-night", kind: "meal" as const, title: "Taco Night" },
    {
      key: "recipe:tuscan-chicken",
      kind: "recipe" as const,
      title: "Creamy Tuscan Garlic Chicken",
      recipeId: "tuscan-chicken",
      servings: 4,
    },
    {
      key: "recipe:stuffed-peppers",
      kind: "recipe" as const,
      title: "Classic Stuffed Peppers",
      recipeId: "stuffed-peppers",
      servings: 6,
    },
  ],
  selectedKeys: ["meal:sunday-dinner", "recipe:tuscan-chicken"],
  quantityByKey: { "meal:sunday-dinner": 1, "recipe:tuscan-chicken": 2 },
  servingsByRecipeId: { "tuscan-chicken": 6 },
};

/**
 * Shopping list fixture (#125): line view-models in the page's
 * shape — the quantity labels are pre-composed strings, as the
 * app host composes them from its quantity/unit data.
 */
export const shoppingListFixture = {
  lines: [
    { key: "chicken-breast", name: "Chicken breast", quantityLabel: "2 lb", isChecked: true },
    { key: "heavy-cream", name: "Heavy cream", quantityLabel: "1 pint", isChecked: false },
    { key: "spinach", name: "Baby spinach", quantityLabel: "5 oz", isChecked: false },
    {
      key: "parmesan",
      name: "Parmesan, grated",
      quantityLabel: "1 cup",
      isOptional: true,
      isChecked: false,
    },
    { key: "brownies-mix", name: "Cocoa powder", quantityLabel: null, isChecked: false },
  ],
};

/**
 * Meal detail fixture (#125): member subtitles are pre-composed
 * strings, as the app host composes them (servings line plus the
 * nutrition summary).
 */
export const mealDetailFixture = {
  title: "Sunday Chicken Dinner",
  notes: "The kids asked for the Tuscan chicken again.",
  nutritionLabel: "1,240 cal · 82g protein",
  members: [
    {
      recipeId: "tuscan-chicken",
      title: "Creamy Tuscan Garlic Chicken",
      subtitle: "6 servings · 640 cal · 42g protein · satiety 74",
    },
    {
      recipeId: "fudgy-brownies",
      title: "Fudgy Brownies",
      subtitle: "12 servings · 310 cal · 4g protein · satiety 38",
    },
    {
      recipeId: "arroz-con-pollo",
      title: "Arroz con Pollo",
      subtitle: "8 servings",
      isUnavailable: true,
    },
  ],
};

/** Cooking mode fixture (#125): the plan's steps as view-models. */
export const mealCookingFixture = {
  mealTitle: "Sunday Chicken Dinner",
  steps: [
    {
      stepNumber: 1,
      recipeTitle: "Creamy Tuscan Garlic Chicken",
      body: "Season the chicken with salt, pepper, and Italian seasoning.",
    },
    {
      stepNumber: 2,
      recipeTitle: "Creamy Tuscan Garlic Chicken",
      body: "Sear in a hot pan until golden, about 5 minutes per side. Set aside.",
    },
    {
      stepNumber: 3,
      recipeTitle: "Creamy Tuscan Garlic Chicken",
      body: "Add garlic, sun-dried tomatoes, cream, and spinach. Simmer until the spinach wilts, then return the chicken to the pan.",
    },
    {
      stepNumber: 1,
      recipeTitle: "Fudgy Brownies",
      body: "Whisk the cocoa, sugar, and melted butter until glossy.",
    },
  ],
};

/**
 * Meals hub fixture (#125): meal rows carry pre-composed
 * subtitles (member count plus nutrition summary), and the plans
 * are MealPlansPage items, as the app host composes both.
 */
export const mealsHubFixture = {
  meals: [
    { id: "sunday-dinner", title: "Sunday Chicken Dinner", subtitle: "2 recipes · 1,240 cal" },
    { id: "taco-night", title: "Taco Night", subtitle: "3 recipes · 980 cal" },
    { id: "pizza-friday", title: "Pizza Friday", subtitle: "1 recipe" },
  ],
  plans: [
    {
      id: "week-of-oct-19",
      title: "Week of October 19",
      subtitle: "7 entries · 2026-10-19 – 2026-10-25",
    },
    { id: "week-of-oct-26", title: "Week of October 26", subtitle: "5 entries" },
  ],
};

/**
 * Access tokens fixture (#126): rows are view-models — the host
 * pre-formats each row's meta line ("Created … · Last used …"),
 * as the app host does. Prefixes are the tokens' non-secret
 * prefixes.
 */
export const accessTokensFixture = {
  tokens: [
    {
      id: "token-1",
      name: "Claude Desktop",
      prefix: "ecp_9f2ka",
      metaLabel: "Created Oct 2, 2026 · Last used Oct 24, 2026",
    },
    {
      id: "token-2",
      name: "Backup script",
      prefix: "ecp_41mdx",
      metaLabel: "Created Sep 14, 2026 · Never used",
    },
    {
      id: "token-3",
      name: "Old laptop",
      prefix: "ecp_77qpa",
      metaLabel: "Created Jun 30, 2026 · Last used Aug 11, 2026",
      revoked: true,
    },
  ],
  createdSecret: "ecp_example_000000000000000000000000",
};

/**
 * Nutrition goals fixture (#126): the goals view-model —
 * numbers or null, as the host's form state carries them.
 */
export const nutritionGoalsFixture = {
  calories: 2100,
  proteinG: 140,
  carbsG: 220,
  fatG: 70,
  satietyScore: null,
};

/**
 * Home fixture (#126): the page's copy crosses as props (the
 * strings are the app's content constants), and rows are
 * id-only view-models the host renders through its row slot.
 */
export const homeFixture = {
  title: "Eciperay",
  subtitle: "Your recipes, organized and ready to cook.",
  browseLabel: "Browse recipes",
  addLabel: "Add a recipe",
  sharedWithMeLabel: "Shared with me",
  recipesTitle: "Recently viewed",
  emptyMessage: "No recipes yet. Add your first recipe to get started.",
  recipes: [{ id: "tuscan-chicken" }, { id: "fudgy-brownies" }],
};

/**
 * Tags fixture (#126): tag view-models plus the selectable swatch
 * palette, which crosses as a prop in token names (#207 — the
 * canonical `tagColorNames` list).
 */
export const tagsFixture: { tags: TagsPageTag[]; colorOptions: TagColorName[] } = {
  tags: [
    { id: "tag-1", name: "Weeknight", color: "green" },
    { id: "tag-2", name: "Comfort food", color: "orange" },
    { id: "tag-3", name: "Freezer-friendly", color: "blue" },
  ],
  colorOptions: [...tagColorNames],
};

/**
 * Add-recipe menu fixture (#126): the options are app data —
 * labels, descriptions, and navigation targets.
 */
export const addRecipeMenuFixture = {
  options: [
    {
      label: "Create manually",
      description: "Type in a recipe from scratch.",
      target: "manualEntry",
    },
    {
      label: "Generate with AI",
      description: "Describe what you want and let AI draft it.",
      target: "generateAi",
    },
    {
      label: "Import from text",
      description: "Paste a recipe from anywhere.",
      target: "importText",
    },
    {
      label: "Import from URL",
      description: "Pull a recipe from a web page.",
      target: "importUrl",
    },
    {
      label: "Import from image",
      description: "Snap a photo of a recipe card or page.",
      target: "importImage",
    },
  ],
};

/**
 * AI session fixtures (#126): the two flows' config strings
 * (app content) and a planning-stage session view-model — the
 * host resolves the phase label and the stage booleans.
 */
export const aiSessionGenerateConfigFixture = {
  title: "Generate with AI",
  intro:
    "Tell me what you'd like to cook. I'll sketch a plan first — you approve it before I write the full recipe.",
  promptPlaceholder: "e.g. A cozy vegetarian dinner for four…",
  startLabel: "Start planning",
  startPendingLabel: "Starting…",
  previewTitle: "Proposed recipe",
  finalizeLabel: "Save recipe",
  finalizePendingLabel: "Saving…",
};

export const aiSessionPlanningFixture = {
  phaseLabel: "Planning",
  messages: [
    {
      role: "user" as const,
      content: "A cozy vegetarian dinner for four, something with mushrooms.",
    },
    {
      role: "assistant" as const,
      content:
        "How about a creamy mushroom stroganoff over egg noodles? Serves four, about 35 minutes, with a simple green salad on the side.",
    },
  ],
  canRefine: true,
  canCancel: true,
};

export const aiSessionPreviewFixture = {
  phaseLabel: "Preview ready",
  messages: [
    {
      role: "user" as const,
      content: "A cozy vegetarian dinner for four, something with mushrooms.",
    },
    {
      role: "assistant" as const,
      content: "Creamy mushroom stroganoff it is — here's the full recipe for your review.",
    },
  ],
  canRefine: false,
  canCancel: true,
};
