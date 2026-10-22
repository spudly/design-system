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
