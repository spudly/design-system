# Manual Test Plan — Storybook QA

Manual tests are the tests that are **not run via Jest or Playwright**
(Stephen's definition). For the design system, that surface is visual:
how components and pages render, lay out, and respond in their story
states. This document is the maintained record of those checks, seeded
from the components with the most review churn first (design-system
#212); it grows section by section as PRs touch new components.

## How runs work

- **Scope — changed components only.** A design-system PR (including a
  Version Packages PR) gets a manual QA pass over ONLY its changed
  components/pages. Each section below ends with a **Run when:** line
  naming the source paths / component names that select it. For a
  Version Packages PR, the trigger match runs against the components
  named across all changesets in the release.
- **Environment.** The Storybook deployment Chromatic publishes for
  the PR's build (the react Storybook). Use the build for the PR's
  head SHA; if no Chromatic build exists for the head yet, the pass
  is pending that build and still gates merge-ready.
- **Cases.** The checks a human would do that Jest/Playwright do not
  cover: open the named stories, verify the rendered states (variants,
  tones, empty/loading/error states the stories expose), and exercise
  the interactions the stories expose (controls/args, toggles, dismiss,
  stepping). The PR's changeset description — written in testable,
  user-visible terms — is the expected-behavior source for what the
  change should look like.
- **Recording.** One comment on the PR per head SHA: components
  tested, stories opened, pass/fail per component, and observed vs
  expected for any failure.
- **Failures.** A failure in behavior the PR changes is a loop failure
  (fix and re-run the affected stories). A pre-existing failure is
  filed as a `bug` + `qa` issue, linked on the PR, and does not block
  merge-ready.
- **Exemptions.** Diffs touching no component/page/story have nothing
  to test — the PR comment says so and the gate is satisfied.

## Maintaining this document

- **Every PR that adds or changes a component/page's visible behavior
  updates this document in the same PR** — add a section for a new
  component, adjust cases for changed behavior, delete cases for
  removed behavior.
- Keep cases concrete: real story names, real controls, and the
  expected rendered result — not general intentions.
- When a case becomes automated (Jest contract test or Playwright),
  remove it here and say so in the PR description.

---

## Accordion

Open in `Components/Accordion`: Default, FirstOpen, Controlled,
SingleSection.

1. Default: all sections start closed. Opening one section expands
   it with an animated height and closes whichever section was open
   — only one section is ever open at a time. Pressing the open
   section's header closes it, leaving all sections closed.
2. FirstOpen: the first section renders expanded on load, the rest
   closed.
3. Controlled: the "Open section:" line under the accordion tracks
   the open section's name as headers are pressed, and reads "none"
   when all sections are closed.
4. Section headers read as buttons: the chevron points down over a
   closed section and flips up over the open one; on web, Tab reaches
   a header and Enter/Space toggles it.

**Run when:** `src/components/Accordion.tsx`, its stories, or a
changeset naming Accordion.

---

## AccordionSection

Open in `Components/AccordionSection`: Closed, Open, LongTitle.

1. Closed: only the header row renders (title + chevron pointing
   down) inside the bordered frame; no body text is visible.
2. Open: the body renders expanded under a divider line, chevron
   flipped up. Pressing the header collapses it with an animated
   height; pressing again re-expands it.
3. LongTitle: the title wraps to two lines beside the chevron
   without truncating or pushing the chevron out of the frame.

**Run when:** `src/components/AccordionSection.tsx`, its stories, or
a changeset naming AccordionSection.

---

## Collapsible

Open in `Components/Collapsible`: Closed, Open, Interactive.

1. Closed renders nothing visible; Open renders the full content
   block.
2. Interactive: the Toggle button animates the region open and
   closed — height grows/shrinks smoothly rather than snapping, and
   no content spills outside the frame mid-animation.

**Run when:** `src/components/Collapsible.tsx`, its stories, or a
changeset naming Collapsible.

---

## Badge

Open in `Components/Badge`: Neutral, Info, Success, Warning, Danger,
AllTones.

1. Every tone renders as a pill with a **visible 1px border in the
   same color as its label text** — no tone is borderless or uses a
   mismatched border color.
2. In AllTones, the five pills align on one baseline with even
   spacing; no pill is taller or wider than its label needs.
3. Long labels (type one in via Controls) wrap or truncate without
   breaking the pill shape or overlapping neighbors.

**Run when:** `src/components/Badge.tsx`, `src/components/Badge.stories.tsx`,
or a changeset naming Badge (including TagPill-into-Badge changes).

---

## BulkSelectToolbar

Open in `Components/BulkSelectToolbar`: Default, NothingFiltered.

1. The selection count sits **on the same visual center line as the
   action buttons** beside it — not raised, dropped, or offset.
2. NothingFiltered renders the toolbar in its nothing-filtered state
   with no stray count or disabled-looking actions.
3. Buttons remain legible and tappable-looking at the story's default
   size; nothing overlaps the count text.

**Run when:** `src/components/BulkSelectToolbar.tsx`, its stories, or
a changeset naming BulkSelectToolbar.

---

## DismissibleBanner & InlineAlert

Open in `Components/DismissibleBanner`: Info, Warning, WithActions —
and `Components/InlineAlert`: Info, Success, Warning, Error.

1. The dismiss (×) glyph renders **large and clearly visible** (2xl
   class), centered in its 44px touch target — not a tiny × in the
   corner.
2. Clicking dismiss in the story removes the banner (actions addon /
   story state) without leaving an empty gap band behind.
3. WithActions: the action buttons sit clear of the dismiss target
   and the message text; nothing overlaps at the story width.
4. InlineAlert severity colors: each severity's icon/text treatment
   is distinguishable and the message is readable against its
   background in all four stories.

**Run when:** `src/components/DismissibleBanner.tsx`,
`src/components/InlineAlert.tsx`, their stories, or a changeset
naming DismissibleBanner, InlineAlert, or Alert.

---

## NumberStepper

Open in `Components/NumberStepper`: Default, AtMinBound, AtMaxBound,
CustomStep, Inline, Editable.

1. Exactly **one pair** of step buttons renders — the browser's native
   spin buttons never appear alongside them in the Editable story.
2. AtMinBound: the decrement button reads as disabled and clicking it
   does not move the value below the minimum. AtMaxBound: same for
   increment at the maximum.
3. Stepping in Default/CustomStep moves by 1 / the custom step, and
   the displayed value updates immediately.
4. Clearing the Editable field and blurring commits nothing (the
   value returns to / stays at the last committed value) — an empty
   entry never commits 0 or NaN.

**Run when:** `src/components/NumberStepper.tsx`, its stories, or a
changeset naming NumberStepper.

---

## CheckboxField

Open in `Components/CheckboxField`: Default, WithDescription, Checked,
WithRichDescription, WithChildren, WithError.

1. WithRichDescription: rich (multi-element) description content
   renders under the label with normal text spacing — not clipped,
   not squeezed against the checkbox.
2. WithChildren: child content renders inside the field's frame,
   aligned with the label column.
3. WithError: the error message is visible, in the danger treatment,
   and the checkbox remains toggleable in the story.
4. Toggling in Default/Checked flips the check with no layout shift.

**Run when:** `src/components/CheckboxField.tsx`, its stories, or a
changeset naming CheckboxField.

---

## StarRatingInput

Open in `Components/StarRatingInput`: Default, Unrated, WithoutLabel,
DarkTone, AllowClear, ReadOnly, Disabled.

1. Tapping the currently-selected star in AllowClear clears the
   rating back to unrated; in Default (no allow-clear) it does not.
2. DarkTone: stars render in the gold/dark tone treatment and remain
   clearly visible against the story background.
3. ReadOnly shows the value with no interactive affordance;
   Disabled reads as disabled (dimmed) and does not respond.
4. Unrated renders five empty stars with no partial fill.

**Run when:** `src/components/StarRatingInput.tsx`, its stories, or
a changeset naming StarRatingInput.

---

## MasonryGrid

Open in `Components/MasonryGrid`: VariableHeights, Narrow, TwoColumns,
Wide, CappedColumns, FewItems, Empty.

1. VariableHeights: the twelve cards form staggered columns — cards
   stack inside each column with even gaps and no overlap or clipping,
   and the columns end at visibly unequal heights.
2. Narrow (300px container): a single column. TwoColumns (360px):
   exactly two columns. Wide (760px): exactly four columns.
3. CappedColumns: despite the 760px container, exactly two columns
   render (the `maxColumns` cap).
4. FewItems (760px, three cards): three columns with one card each —
   no empty fourth column or stray gap.
5. Empty: nothing renders and nothing errors.
6. Web Storybook only: with VariableHeights open, slowly resize the
   browser window — the column count steps down/up as the width
   crosses the breakpoints and the cards re-flow without overlap.

**Run when:** `src/components/MasonryGrid.tsx`, its stories, or a
changeset naming MasonryGrid.

---

## PrevNextNav

Open in `Components/PrevNextNav`: Both, CustomLabels, NextOnly,
NextDisabled, BackDisabled.

1. BackDisabled: the Back button is hidden or visibly disabled (per
   the story) while Next stays active and right-aligned as in
   NextOnly.
2. NextDisabled: Next reads as disabled; Back remains usable.
3. CustomLabels render verbatim with no truncation at story width.

**Run when:** `src/components/PrevNextNav.tsx`, its stories, or a
changeset naming PrevNextNav.

---

## Spinner

Open in `Components/Spinner`: Default, Large, Determinate,
DeterminateComplete, DeterminateLarge, DeterminateStates.

1. Default and Large still spin continuously (indeterminate); Large
   is visibly bigger than Default.
2. Determinate (value 65) does NOT spin: it shows a static ring
   filled about two-thirds, the arc starting at the top and running
   clockwise, in the brand primary over the lighter progress-track
   ring.
3. DeterminateStates: the five rings fill 0 / 25 / 50 / 75 / 100 —
   0 is the empty track only, 50 fills exactly the right half, 100
   is a complete ring with no gap.
4. DeterminateComplete (100) matches the full ring in
   DeterminateStates; DeterminateLarge (30) shows the same ring at
   the large size.
5. Dragging the `value` control in Determinate moves the arc
   smoothly between the states above; setting `size` to large grows
   the ring without changing its proportions.

**Run when:** `src/components/Spinner.tsx`, its stories, or a
changeset naming Spinner.

---

## AccessTokensPanel

Open in `Components/AccessTokensPanel`: WithTokens,
SecretJustCreated, PlanNotice.

1. SecretJustCreated: there is a **visible gap** between the info
   alert at the top and the amber new-token panel below it — the two
   panels never touch.
2. The new-token secret text is fully visible (no clipping) and its
   warning copy sits clear of the panel edges.
3. PlanNotice renders its notice without pushing the token list into
   overlap or horizontal scroll.

**Run when:** `src/components/AccessTokensPanel.tsx`, its stories, or
a changeset naming AccessTokensPanel.

---

## AiSessionPage

Open in `Pages/Eciperay/AiSessionPage`: Start, Planning, PreviewReady.

1. Start: the Cancel button is a **ghost (text-only) button with a
   readable label** — never a filled button whose label clashes with
   the fill. The Refine plan button in Planning follows the same
   treatment.
2. PreviewReady renders the plan preview with all sections visible
   and no clipped footer actions.

**Run when:** `src/pages/AiSessionPage.tsx`, its stories, or a
changeset naming AiSessionPage.

---

## MemorizeSettingsPage

Open in `Pages/Memorize/MemorizeSettingsPage`: Default, NoApiKeyDriveDisconnected,
SyncConflict.

1. There is **visible spacing above the action buttons** in each
   card — buttons never sit flush against the field or text above
   them (spacing comes from the parent stack's gap).
2. SyncConflict renders the conflict notice and both resolution
   actions legibly, with nothing overlapping the notice.

**Run when:** `src/pages/MemorizeSettingsPage.tsx`, its stories, or a
changeset naming MemorizeSettingsPage.

---

## RecipesPage

Open in `Pages/Eciperay/RecipesPage`: Default, Filtered, Empty,
Loading, FilterChooserOpen, WithFiltersAdded, ExpandedAccessory —
and the Shared-with-me configuration (#185): SharedDefault,
SharedFiltered, SharedEmpty, SharedLoading.

1. The **Filters button is exactly as tall as the search field**
   beside it — top and bottom edges align.
2. FilterChooserOpen shows only the collapsed filter affordance by
   default (no full filter panel) until filters are added in
   WithFiltersAdded.
3. Empty and Loading render their states centered in the page frame
   with no leftover list chrome.
4. SharedDefault: the shared configuration shows the **same
   collapsed filter bar** (search + Filters button, no always-visible
   filter panel) and its rows are **press-only** — no star/log-cook
   control on any row.
5. SharedEmpty shows the shared screen's own empty message —
   "Recipes others share with you will appear here." with its
   second sentence — **not** "No recipes found."; the Recipes
   configuration's Empty still shows "No recipes found."
6. SharedFiltered lists the two matching rows, Creamy Tuscan
   Garlic Chicken and Chicken Tikka Masala, below the collapsed
   filter bar. SharedLoading shows the spinner centered below the
   filter bar with no recipe rows, like the Recipes configuration's
   Loading state.

**Run when:** `src/pages/RecipesPage.tsx`, its stories, or a
changeset naming RecipesPage or the Shared-with-me screen.

---

## RecipeDetailPage

Open in `Pages/Eciperay/RecipeDetailPage`: Default, Minimal, Loading,
Ingredients, Instructions, CookHistory, CookLogFormOpen, Nutrition.

1. The overview action row: Print and Share render as **real icons**
   (printer / share-2 from `@spudly/ui/icons`) in the same neutral
   chip treatment as Edit/Delete — no emoji or text glyphs, no
   color-rendered printer.
2. Tags render as bordered Badge pills whose border matches the tag
   label color.
3. CookLogFormOpen: the inline form fits the section width; its
   rating stars and fields do not overflow the card.

**Run when:** `src/pages/RecipeDetailPage.tsx`, its stories, or a
changeset naming RecipeDetailPage.

---

## PublicRecipePage

Open in `Pages/Eciperay/PublicRecipePage`: Default, SignedIn,
ClonePending, Minimal, Loading, NotFound, Unavailable, Ingredients.

1. One scroll, no tab bar: overview, Ingredients, Instructions,
   and the engagement block (ratings card above the comments
   stand-in) are all reachable by scrolling the Default story —
   nothing is hidden behind a tab.
2. Default (signed out): the CTA bar shows "Sign up free",
   "Clone this recipe", and "Get the mobile app"; the ratings
   card shows the community rating only — no "Your rating" star
   input. SignedIn shows the star input; ClonePending's primary
   button reads "Saving…" and is disabled.
3. NotFound shows the card "Recipe not found" / "This recipe may
   be private or no longer available."; Unavailable shows "Recipe
   unavailable" / "This recipe link is invalid or has expired."
4. Ingredients: tapping the "Heavy cream" row in the Ingredients
   story dims it and shows the substitutions panel below the
   list; the servings stepper and scale chips fit the story
   width without wrapping the Scale row.
5. Open in `Pages/Eciperay/PublicPageFrame`: Default, Content,
   Narrow. The header (Eciperay brand, Sign in) and footer (the
   without-an-account note, Privacy Policy, Terms of Service)
   frame the centered wide column; in Narrow the column fills the
   phone width and the footer wraps without overlap.

**Run when:** `src/pages/PublicRecipePage.tsx`,
`src/pages/PublicPageFrame.tsx`, their stories, or a changeset
naming PublicRecipePage or PublicPageFrame.

---

## TagsPage

Open in `Pages/Eciperay/TagsPage`: WithTags, Loading.

1. In the create form, the **name input and the color swatches never
   overlap** at the story width — the form stacks cleanly.
2. Existing tags render their color swatch and name on one line with
   even row spacing.

**Run when:** `src/pages/TagsPage.tsx`, its stories, or a changeset
naming TagsPage.

---

## Button

Open in `Components/Button`: Primary, Secondary, Ghost, Danger,
Sizes, Disabled, AllVariants, WithIcon, WithIconVariants, IconOnly,
IconOnlyVariants, IconSizes, IconDisabled, IconPressCounter.

The plain stories (Primary → AllVariants) are the unchanged labeled
button. The icon-slot stories:

1. WithIcon / WithIconVariants: the glyph sits to the **left** of
   the label with an even gap, vertically centered on the label's
   line, inked in the variant's label color — light glyph on the
   primary fill, dark glyph on the secondary gray, link-colored
   glyph with no fill on ghost, white glyph on the danger fill.
2. IconOnly / IconOnlyVariants: only the glyph renders — no text —
   centered in a square target, in every variant.
3. IconSizes: the labeled row's glyph grows with the button size
   (sm → lg); the icon-only row's squares grow sm → lg with the
   glyph centered in each, and the smallest is still a full 44px
   touch target (compare it with the 44px SearchField clear target
   in `Components/SearchField` — it is no smaller).
4. IconDisabled: both the labeled and the icon-only button render
   dimmed and pressing them does nothing.
5. IconPressCounter: pressing the icon-only button increments the
   "Pressed N times" count; on web, tabbing to the button and
   pressing Enter or Space increments it too.
6. The icon-only button's accessible name is its label: in the
   rendered DOM (or the Storybook accessibility panel) the IconOnly
   story's button carries `aria-label="Print recipe"` and there is
   no `accessibilitylabel` attribute.

**Run when:** `src/components/Button.tsx`, its stories, or a
changeset naming Button or the Button icon slot.

---

## Dropdown

Open in `Components/Dropdown`: ActionMenu, IconOnlyTrigger,
AlignEnd, SideTop, InitiallyOpen, Controlled.

1. ActionMenu: pressing "Recipe actions" opens the panel anchored
   under the button (surface fill, bordered, shadowed), the
   trigger's chevron flips up while open, and pressing the trigger
   again closes it. Pressing outside the panel, or pressing Escape
   on web, also closes it — and on web, closing with Escape returns
   focus to the trigger button (keep tabbing from where the menu
   was opened, not from the top of the page).
2. ActionMenu rows: choosing "Print recipe" closes the menu and the
   line under it reads "Last action: Print recipe" (close-on-select);
   "Delete recipe" renders in the danger color. Rows are at least
   44px tall; on web, Tab reaches a row and Enter/Space activates it.
3. IconOnlyTrigger: the trigger is the profile glyph plus chevron
   with no text, and its accessible name is "Account menu".
4. AlignEnd: the panel's trailing edge lines up with the trigger's
   trailing edge (the panel extends left from the button).
5. SideTop: the panel opens above its trigger instead of below.
6. InitiallyOpen: the panel renders open on load, rows visible
   without any press.
7. Controlled: the "Menu is open/closed" line tracks the menu as it
   is toggled, and "Open from outside" opens it — the host owns the
   state.

**Run when:** `src/components/Dropdown.tsx`, its stories, or a
changeset naming Dropdown.

---

## DropdownButton

Open in `Components/DropdownButton`: Labeled, WithIcon, IconOnly,
Variants, Disabled. Each story's button is the trigger of a small
dropdown whose panel reads "Menu content".

1. Labeled: the label sits left of a chevron pointing down; opening
   the menu flips the chevron up.
2. WithIcon: the share glyph renders left of the label, the chevron
   after it, all in the secondary variant's ink.
3. IconOnly: no label text — profile glyph plus chevron — and the
   button's accessible name is "Account menu".
4. Variants: Primary, Secondary, and Ghost triggers each open their
   menu; the chevron takes the variant's label color (light on the
   primary fill, dark on the secondary gray, link-colored on ghost).
5. Disabled: the trigger renders dimmed and pressing it does not
   open the menu.

**Run when:** `src/components/DropdownButton.tsx`, its stories, or
a changeset naming DropdownButton.

---

## Text

Open in `Components/Text`: AllVariants (or any page story, e.g.
`Pages/Eciperay/SignInPage`).

1. The `heading` variant ("Heading" in AllVariants; the page title
   on a page story) is exposed as a heading at level 1: in the
   rendered DOM / Storybook accessibility panel it carries
   `role="heading"` and `aria-level="1"`, and there is no
   `accessibilityrole` attribute.
2. The `subheading` variant carries `role="heading"` with
   `aria-level="2"`.
3. The `body`, `hint`, `error`, and `verse` variants carry no
   heading role and no `aria-level`.
4. Visually nothing changes: heading/subheading keep their sizes
   and weights, and all variants keep their theme fonts.

**Run when:** `src/components/Text.tsx`, its stories, the
accessibility translator (`src/components/accessibility.ts`), or a
changeset naming Text or heading semantics.

---

## Import pages (ImportTextPage, ImportUrlPage, ImportReviewPage)

Open in `Pages/Eciperay/ImportTextPage`: Empty, WithError.
Open in `Pages/Eciperay/ImportUrlPage`: Filled, Interactive.
ImportReviewPage has no image story — its image case is verified
from the changeset/PR description against a host render.

1. ImportTextPage: the paste field is findable by the accessible
   name "Recipe text" (Storybook accessibility panel or DOM
   `aria-label`), not only by its "Paste your recipe here…"
   placeholder. The Import button stays disabled on blank text.
2. ImportUrlPage (Interactive): pressing Enter in the URL field
   increments the "Submitted N times" counter, exactly like
   pressing the Import button; clear the field first and Enter
   does nothing (the counter does not move).
3. ImportReviewPage: a render that passes `imageAlt` (hosts pass
   the recipe title) exposes that text as the hero image's
   accessible name — `alt` on web, accessibility label on
   native; a render without an image shows no image at all.

**Run when:** `src/pages/ImportTextPage.tsx`,
`src/pages/ImportUrlPage.tsx`, `src/pages/ImportReviewPage.tsx`,
their stories, or a changeset naming the import pages.

---

## Auth pages (SignInPage, SignUpPage, ForgotPasswordPage, ResetPasswordPage)

Open in `Pages/Eciperay/SignInPage`, `Pages/Eciperay/SignUpPage`,
`Pages/Eciperay/ForgotPasswordPage`,
`Pages/Eciperay/ResetPasswordPage` (the Filled story of each —
the stories are interactive: fields can be typed in, and a
submit switches the page to its loading state).

1. In every field of each page's Filled story, pressing Enter
   submits the page — visible as the page switching to its
   loading state (the submit button's label changes to its
   loading label, e.g. "Signing in…", and the button disables),
   the same result as pressing the submit button. This holds
   for the first field as well as the last.
2. In each page's Loading story (and in a Filled story after
   step 1 has put it in the loading state), pressing Enter in
   a field does not submit again — the page stays in the
   loading state with no further change.
3. Pressing the submit button itself in a Filled story still
   submits (same loading-state switch), and the "Create an
   account" / "Forgot password?" / "Back to sign in" /
   "Already have an account? Sign in" links do not submit —
   clicking one does not switch the page to its loading state.
4. Native (separate QA step — not covered by the deployed web
   Storybook above): in the on-device Storybook
   (`npm run storybook:react-native`), the return key submits
   from every field of each page, and the last field's return
   key is labeled "go".

**Run when:** `src/pages/SignInPage.tsx`,
`src/pages/SignUpPage.tsx`, `src/pages/ForgotPasswordPage.tsx`,
`src/pages/ResetPasswordPage.tsx`, their stories, or a changeset
naming the auth pages or Enter-to-submit.
