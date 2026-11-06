import { tagColorNames, type TagColorName } from "../themes/tagColors.js";
import type { BigFooterData } from "../widgets/BigFooter.js";
import type { LegalDocumentPageProps } from "./LegalDocumentPage.js";
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

export type MealPlanDayFixture = {
  day: string;
  dateLabel: string;
  dish: string;
  meta: string;
};

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
  // The story's simulated library (#383): the story filters
  // it by the search text to stand in for the host's
  // server-side search, and resolves selections from it.
  recipeOptions: [
    { id: "tuscan-chicken", label: "Creamy Tuscan Garlic Chicken", servings: 4 },
    { id: "stuffed-peppers", label: "Classic Stuffed Peppers", servings: 6 },
    { id: "arroz-con-pollo", label: "Arroz con Pollo", servings: 8 },
    { id: "fudgy-brownies", label: "Fudgy Brownies", servings: 12 },
  ],
  searchText: "peppers",
  selectedRecipes: [
    { id: "tuscan-chicken", label: "Creamy Tuscan Garlic Chicken", servings: 4 },
    { id: "fudgy-brownies", label: "Fudgy Brownies", servings: 12 },
  ],
  servingsByRecipeId: { "tuscan-chicken": 6, "fudgy-brownies": 12 },
  // Direct ingredients (#440): entered on the meal itself, in
  // the form's free-text field shape.
  ingredients: [
    { id: "ing-olive-oil", name: "Olive oil", quantity: "2", unit: "tbsp", servings: "6" },
    { id: "ing-parmesan", name: "Parmesan", quantity: "1/2", unit: "cup", servings: "6" },
  ],
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
  // The story's search state (#383): "taco" matches the
  // unselected Taco Night meal in entryOptions above, which
  // the story filters by the search text to stand in for the
  // host's server-side search.
  searchText: "taco",
  selectedEntries: [
    { key: "meal:sunday-dinner", kind: "meal" as const, title: "Sunday Chicken Dinner" },
    {
      key: "recipe:tuscan-chicken",
      kind: "recipe" as const,
      title: "Creamy Tuscan Garlic Chicken",
      recipeId: "tuscan-chicken",
      servings: 4,
    },
  ],
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
      href: "/recipes/tuscan-chicken",
      title: "Creamy Tuscan Garlic Chicken",
      subtitle: "6 servings · 640 cal · 42g protein · satiety 74",
    },
    {
      recipeId: "fudgy-brownies",
      href: "/recipes/fudgy-brownies",
      title: "Fudgy Brownies",
      subtitle: "12 servings · 310 cal · 4g protein · satiety 38",
    },
    {
      recipeId: "arroz-con-pollo",
      href: "/recipes/arroz-con-pollo",
      title: "Arroz con Pollo",
      subtitle: "8 servings",
      isUnavailable: true,
    },
  ],
  // Direct ingredients (#440): no destination page, so their
  // rows are plain rows carrying a pre-composed subtitle.
  ingredients: [
    { id: "ing-olive-oil", name: "Olive oil", subtitle: "2 tbsp · 240 cal" },
    { id: "ing-parmesan", name: "Parmesan", subtitle: "1/2 cup · 210 cal · 19g protein" },
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
    {
      id: "sunday-dinner",
      href: "/meals/sunday-dinner",
      title: "Sunday Chicken Dinner",
      subtitle: "2 recipes · 1,240 cal",
    },
    {
      id: "taco-night",
      href: "/meals/taco-night",
      title: "Taco Night",
      subtitle: "3 recipes · 980 cal",
    },
    {
      id: "pizza-friday",
      href: "/meals/pizza-friday",
      title: "Pizza Friday",
      subtitle: "1 recipe",
    },
  ],
  plans: [
    {
      id: "week-of-oct-19",
      href: "/meal-plans/week-of-oct-19",
      title: "Week of October 19",
      subtitle: "7 entries · 2026-10-19 – 2026-10-25",
    },
    {
      id: "week-of-oct-26",
      href: "/meal-plans/week-of-oct-26",
      title: "Week of October 26",
      subtitle: "5 entries",
    },
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
 * Landing fixture (#171): mirrors @eciperay/client's landingCopy
 * constants (the host's copy source of truth) and the CTA shape
 * the web host passes — Discover and Sign up routes plus the
 * mobile-app install link. The install href is a same-shaped
 * stand-in: fixtures.ts bans URL literals so screenshots stay
 * deterministic (#44); the host passes the real install URL.
 */
export const landingFixture = {
  heroTitle: "Your recipes, organized and ready to cook",
  heroSubtitle:
    "Save recipes from anywhere, tweak them with AI, and share what you love with friends or the community.",
  discoverCta: { label: "Discover public recipes", href: "/discover" },
  signUpCta: { label: "Sign up free", href: "/signup" },
  getAppCta: { label: "Get the mobile app", href: "/get-the-app" },
  featureOne: {
    title: "Import from anywhere",
    description: "Paste a URL, photo, or notes and let AI turn it into a structured recipe.",
  },
  featureTwo: {
    title: "Cook with confidence",
    description: "Scale servings, track versions, and follow step-by-step cooking mode.",
  },
  featureThree: {
    title: "Share on your terms",
    description: "Keep recipes private, share unlisted links, or publish to the community.",
  },
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
      href: "/recipes/new/manual",
    },
    {
      label: "Generate with AI",
      description: "Describe what you want and let AI draft it.",
      href: "/recipes/new/ai",
    },
    {
      label: "Import from text",
      description: "Paste a recipe from anywhere.",
      href: "/recipes/new/import-text",
    },
    {
      label: "Import from URL",
      description: "Pull a recipe from a web page.",
      href: "/recipes/new/import-url",
    },
    {
      label: "Import from image",
      description: "Snap a photo of a recipe card or page.",
      href: "/recipes/new/import-image",
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

/**
 * Legal document fixtures for LegalDocumentPage (#170): two short
 * documents in the real pages' shape — the privacy policy and the
 * terms are the same page driven by different content props. The
 * copy is fixture prose written for the stories (the real legal
 * text is app content and stays app-side); the structure mirrors
 * the real documents: paragraphs mixing plain, strong, and code
 * spans, bullet lists whose items lead with a strong phrase, and a
 * mailto link span mid-sentence in the contact section. Dates are
 * fixed literals per the fixture rules above.
 */
export const legalPrivacyFixture: LegalDocumentPageProps = {
  title: "Privacy Policy",
  lastUpdated: "July 22, 2026",
  brandLabel: "Eciperay",
  brandHref: "/",
  signInLabel: "Sign in",
  signInHref: "/login",
  footer: {
    brand: { label: "Eciperay", href: "/" },
    columns: [
      {
        title: "Legal",
        links: [
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Terms of Service", href: "/terms" },
          {
            label: "Do Not Sell or Share My Personal Information",
            href: "/do-not-sell-or-share",
          },
        ],
      },
    ],
    storeLinks: [
      { label: "Download on the App Store", href: "/app-store" },
      { label: "Get it on Google Play", href: "/google-play" },
    ],
    socialLinks: [],
  },
  sections: [
    {
      title: "Information we collect",
      blocks: [
        {
          type: "paragraph",
          spans: [
            { type: "text", text: "Eciperay collects the information you give us when you " },
            { type: "strong", text: "create an account" },
            { type: "text", text: " and save recipes, including:" },
          ],
        },
        {
          type: "list",
          items: [
            [
              { type: "strong", text: "Account details." },
              { type: "text", text: " Your name and email address." },
            ],
            [
              { type: "strong", text: "Your content." },
              { type: "text", text: " Recipes, meal plans, and notes you save." },
            ],
            [
              { type: "strong", text: "Usage data." },
              { type: "text", text: " Which features you use, so we can improve them." },
            ],
          ],
        },
      ],
    },
    {
      title: "Search engines",
      blocks: [
        {
          type: "paragraph",
          spans: [
            { type: "text", text: "Private pages carry a " },
            { type: "code", text: "noindex" },
            { type: "text", text: " directive so search engines do not list them." },
          ],
        },
      ],
    },
    {
      title: "Contact us",
      blocks: [
        {
          type: "paragraph",
          spans: [
            { type: "text", text: "Questions about this policy? Email us at " },
            { type: "link", label: "legal@example.com", href: "mailto:legal@example.com" },
            { type: "text", text: " and we will reply within a few days." },
          ],
        },
      ],
    },
  ],
};

export const legalTermsFixture: LegalDocumentPageProps = {
  title: "Terms of Service",
  lastUpdated: "June 18, 2026",
  brandLabel: "Eciperay",
  brandHref: "/",
  signInLabel: "Sign in",
  signInHref: "/login",
  footer: {
    brand: { label: "Eciperay", href: "/" },
    columns: [
      {
        title: "Legal",
        links: [
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Terms of Service", href: "/terms" },
          {
            label: "Do Not Sell or Share My Personal Information",
            href: "/do-not-sell-or-share",
          },
        ],
      },
    ],
    storeLinks: [
      { label: "Download on the App Store", href: "/app-store" },
      { label: "Get it on Google Play", href: "/google-play" },
    ],
    socialLinks: [],
  },
  sections: [
    {
      title: "Using Eciperay",
      blocks: [
        {
          type: "paragraph",
          spans: [
            {
              type: "text",
              text: "By using Eciperay you agree to these terms. You may use the service to store and share your own recipes, and you are responsible for your account activity.",
            },
          ],
        },
        {
          type: "list",
          items: [
            [
              { type: "strong", text: "Your recipes stay yours." },
              { type: "text", text: " You keep ownership of the content you save." },
            ],
            [
              { type: "strong", text: "Be considerate." },
              { type: "text", text: " Do not upload content that infringes others' rights." },
            ],
          ],
        },
      ],
    },
    {
      title: "Contact us",
      blocks: [
        {
          type: "paragraph",
          spans: [
            { type: "text", text: "Questions about these terms? Email us at " },
            { type: "link", label: "legal@example.com", href: "mailto:legal@example.com" },
            { type: "text", text: "." },
          ],
        },
      ],
    },
  ],
};

/**
 * BigFooter fixtures (#410): the footer data objects the page
 * stories pass through each page's `footer` prop, in the shape a
 * real app host supplies. The Eciperay fixture carries the Legal
 * column convention — Privacy, Terms, and "Do Not Sell or Share
 * My Personal Information" (eciperay #408) — as caller data.
 * Storybook socials use the Feather social glyphs the component
 * supports; production hosts ship an empty socialLinks array
 * until they have socials. Hrefs are root-relative story
 * destinations (the fixtures ban external URLs outright).
 */
export const eciperayFooterFixture: BigFooterData = {
  brand: { label: "Eciperay", href: "/" },
  columns: [
    {
      title: "Product",
      links: [
        { label: "Recipes", href: "/recipes" },
        { label: "Meal plans", href: "/meal-plans" },
        { label: "Discover", href: "/discover" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Feedback", href: "/feedback" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        {
          label: "Do Not Sell or Share My Personal Information",
          href: "/do-not-sell-or-share",
        },
      ],
    },
  ],
  storeLinks: [
    { label: "Download on the App Store", href: "/app-store" },
    { label: "Get it on Google Play", href: "/google-play" },
  ],
  socialLinks: [
    { label: "Eciperay on Facebook", href: "/social/facebook", icon: "facebook" },
    { label: "Eciperay on Instagram", href: "/social/instagram", icon: "instagram" },
    { label: "Eciperay on Twitter", href: "/social/twitter", icon: "twitter" },
  ],
};

export const memorizeFooterFixture: BigFooterData = {
  brand: { label: "Memorize", href: "/" },
  columns: [
    {
      title: "Product",
      links: [
        { label: "My verses", href: "/my-verses" },
        { label: "Search verses", href: "/search" },
        { label: "Review", href: "/review" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
      ],
    },
  ],
  storeLinks: [
    { label: "Download on the App Store", href: "/app-store" },
    { label: "Get it on Google Play", href: "/google-play" },
  ],
  socialLinks: [
    { label: "Memorize on YouTube", href: "/social/youtube", icon: "youtube" },
    { label: "Memorize on GitHub", href: "/social/github", icon: "github" },
  ],
};
