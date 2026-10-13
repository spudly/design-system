# Design Brief — @spudly/ui

**Status:** Draft for review — nothing here is final until Stephen signs off.
**Pipeline:** This brief → AI visual directions → finalized tokens → components → visual regression (Storybook is the source of truth; no Figma).

## 1. Purpose

Define the visual identity of the shared design system so that Eciperay, Memorize,
and future apps feel like they belong to one family while each keeps its own
character. The output of this brief is a set of **chosen visual directions**
that get translated into real token values (replacing the current placeholders)
in `src/tokens/` and `src/themes/`.

## 2. Brand personalities

### Base (brand-neutral system)

The base theme is the fallback: clean, neutral, unopinionated. It should look
"designed" without expressing any particular brand — the visual equivalent of
a well-set system UI. Cool-neutral grays, indigo/blue accent, system type.

### Eciperay — recipe management

Eciperay is about food, home cooking, and gathering. It should feel **warm,
appetizing, and editorial** — like a well-designed cookbook, not a database.
Food photography is the hero; the UI should frame it, never compete with it.

### Memorize — scripture memorization

Memorize is about focused, reverent study. It should feel **calm, quiet, and
trustworthy** — like a beautifully printed volume of scripture. Text is the
hero; the UI should disappear around long reading and memorization sessions.
Nothing flashy, nothing that fights for attention with the words being studied.

## 3. Design principles

1. **Accessible by default.** WCAG AA contrast (4.5:1 for text), minimum 44px
   touch targets, visible focus states, honors `prefers-reduced-motion`.
   Accessibility is a release gate, not a polish pass.
2. **Token-driven, no hardcoding.** Every color, space, radius, and type value
   in a component comes from tokens. If a value can't be a token, the tokens
   are incomplete.
3. **Web + native parity.** Every component must render correctly on web and
   React Native via Tamagui. No web-only CSS tricks, no native-only APIs in
   shared components. Fonts must have solid cross-platform fallbacks.
4. **Content leads.** Eciperay: photography leads, UI recedes. Memorize: text
   leads, UI recedes. Chrome (nav, buttons, cards) stays quiet in both.
5. **Quiet confidence.** Rounded but not bubbly, warm but not loud. The system
   should feel crafted without calling attention to itself.

## 4. Proposed visual directions

Two directions per app. Each is a complete, coherent proposal — pick one per
app (mixing is allowed but should be deliberate). **Recommendations are marked.**

### Eciperay

#### Direction E1 — "Warm Harvest" ✅ recommended

A cozy, editorial kitchen feel. Warm cream surfaces, terracotta/burnt-orange
primary, deep espresso text. Serif display type for recipe titles (cookbook
feel), clean sans for UI chrome.

- **Backgrounds:** warm paper `#faf6f0` (light), deep espresso `#1c1410` (dark)
- **Primary (appetizing):** terracotta ramp centered on `#c2410c`
  (`#7c2d12` → `#fed7aa` across the 10-step ramp)
- **Text:** espresso `#292019` on light, warm cream `#f5ede3` on dark
- **Accent:** muted sage `#5f6f52` for secondary actions (fresh-herb contrast)
- **Type:** display serif (Fraunces or DM Serif Display) for recipe titles;
  system sans for UI, quantities, and metadata
- **Shape:** generous radii (cards `lg`/`xl`), soft shadows — food should look
  touchable
- **Why:** Orange/terracotta is the most appetite-associated hue family;
  cream + espresso gives the warmth of a printed cookbook. Serif titles make
  recipes feel authored, not generated.

#### Direction E2 — "Fresh Herb"

A clean, modern, health-forward feel. Crisp white surfaces, basil-green
primary, charcoal text. All-sans type, tighter radii, flatter surfaces.

- **Backgrounds:** pure white `#ffffff` (light), deep pine `#0f1a12` (dark)
- **Primary:** basil green ramp centered on `#15803d`
- **Text:** charcoal `#1a1a1a` / `#f2f2f2`
- **Type:** system sans throughout; weight contrast (bold titles) instead of
  serif for hierarchy
- **Shape:** medium radii, minimal shadows, hairline borders
- **Why:** Reads "fresh and healthy"; suits users who meal-plan and track
  nutrition. Less distinctive than E1 — risks looking like every other food app.

### Memorize

#### Direction M1 — "Quiet Dawn" ✅ recommended

A calm morning-study feel. Warm paper background like a printed page, deep
teal primary, ink text. Serif for scripture text (print-scripture feel),
quiet sans for UI.

- **Backgrounds:** warm paper `#faf8f2` (light), deep ink-teal `#0d1b1a` (dark)
- **Primary (calm, focused):** deep teal ramp centered on `#0f766e`
  (`#134e4a` → `#ccfbf1` across the ramp)
- **Text:** ink `#1f2937`-warm (`#2b2620`) on light, soft paper `#e8e2d4` on dark
- **Accent:** muted gold `#b45309` reserved for progress/mastery states
  (streaks, completed verses) — used sparingly so it feels earned
- **Type:** readable serif (Source Serif 4 or Georgia) for verse text at
  generous sizes and line-height (1.75); system sans for UI chrome
- **Shape:** small radii, almost no shadow — the page is the interface
- **Why:** Teal is calm without being cold; paper + serif honors the feeling
  of studying from a real volume. Gold-as-reward gives progression a quiet
  celebratory note without gamified noise.

#### Direction M2 — "Candlelight"

An evening-study feel. Deep navy surfaces, warm gold primary, candle-warm
text. Suits nighttime memorization sessions.

- **Backgrounds:** parchment `#f7f3ea` (light), midnight navy `#101828` (dark)
- **Primary:** warm gold ramp centered on `#b45309`
- **Text:** dark umber `#3b2f23` / warm white `#f5efe2`
- **Type:** same serif-for-verse approach as M1
- **Shape:** same quiet treatment as M1
- **Why:** Distinctive and reverent; but gold-as-primary risks feeling
  ornate, and dark-mode-first identities complicate the default light theme.

## 5. Typography direction

| Role              | Eciperay                         | Memorize                         | Base (neutral)    |
| ----------------- | -------------------------------- | -------------------------------- | ----------------- |
| Display / titles  | Serif (Fraunces / DM Serif)      | Serif (Source Serif / Georgia)   | System sans, bold |
| UI / body         | System sans                      | System sans                      | System sans       |
| Scripture / verse | —                                | Serif, 18–20px, 1.75 line-height | —                 |
| Mono              | System mono (quantities, timers) | System mono                      | System mono       |

**Font loading strategy (decision needed):** custom display fonts require
bundling (webfont + expo-font) and add load complexity. Options: (a) system
stacks only — zero loading cost, slightly less character; (b) one display
font per app — more brand feel, needs font-loading plumbing in both apps.
Recommendation: start with (a), add (b) once the apps integrate the system.

The existing type scale (`xs`–`4xl`, weights 400–700, line-heights) is sound
and stays; only families change.

## 6. Color system mechanics (unchanged)

- 10-step ramps per hue (light → dark), same structure as the current
  placeholders — only the hue values change per chosen direction.
- Semantic roles (`background`, `surface`, `text`, `textMuted`, `border`,
  `primary`, `primaryHover`, `primaryActive`, `onPrimary`, `success`,
  `warning`, `danger`) keep their names; apps remap roles, never raw ramps.
- Dark themes are full citizens, designed alongside light — not inverted
  afterthoughts.

## 7. What happens next

1. **Stephen picks a direction per app** (E1/E2, M1/M2 — recommendations: E1, M1).
2. AI visual directions: key screens rendered from the chosen directions
   (recipe card + detail for Eciperay; verse study + progress for Memorize).
3. Winning visuals become real token values in `src/tokens/` + `src/themes/`.
4. Components built against real tokens; Storybook stories updated.
5. Visual regression (Playwright) locks the visuals in CI.

## 8. Open questions for Stephen

1. Direction picks: Eciperay E1 or E2? Memorize M1 or M2? (Recommended: E1, M1.)
2. Font loading: system-only now, or bundle a display serif per app?
3. Dark mode: design both themes now, or light-first with dark to follow?
4. Eciperay imagery: photography-forward (needs art direction for empty
   states), or illustrated?
5. Anything in the brand personalities (§2) that feels wrong for either app?
