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
AllTones, Selectable, Selected, SelectableDisabled.

1. Every tone renders as a pill with a **visible 1px border in the
   same color as its label text** — no tone is borderless or uses a
   mismatched border color.
2. In AllTones, the five pills align on one baseline with even
   spacing; no pill is taller or wider than its label needs.
3. Long labels (type one in via Controls) wrap or truncate without
   breaking the pill shape or overlapping neighbors.
4. Selectable: pressing a pill toggles it — the pressed pill takes
   the **primary fill with the on-primary label**, the others keep
   the resting tint; pressing it again returns it to the tint.
   Only the pressed pill changes. The pills are keyboard-operable:
   Tab reaches them and Enter/Space toggles the focused pill.
5. Selected: the pill renders in the selected treatment and is a
   toggle button (aria-pressed true); in Selectable, unpressed
   pills announce aria-pressed false.
6. The display-only stories (Neutral through AllTones) carry no
   button role and no pressed state — the selectable form is
   opt-in only.
7. SelectableDisabled: the pill is dimmed, Tab skips it, and it
   does not toggle by pointer or keyboard; it still announces
   its pressed and disabled state.

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

## Slider

Open in `Components/Slider`: Default, Ticks, CustomRange, WithError,
Disabled.

1. Default: dragging the knob (or focusing it and pressing the arrow
   keys) moves the fill and knob together between the track ends;
   Home/End jump to the minimum/maximum, and the knob never leaves
   the track.
2. Ticks: the ten labels One–Ten sit under the 1–10 track, One flush
   with the left end, Ten flush with the right, the rest centered
   under their values; stepping with the arrow keys moves by 1.
3. CustomRange: arrow keys move by 0.5 (2.5 → 3.0 → 3.5), and the
   three tick labels (0, 2.5, 5) sit at the left end, center, and
   right end of the track.
4. WithError: the error line "Choose a level before continuing."
   renders under the slider in the error color, and the slider still
   drags/steps normally.
5. Disabled: the whole control reads dimmed, the knob cannot be
   dragged or focused, and the value does not change.
6. In every story the knob is a white circle with a visible outline,
   centered on the track, over a brand-primary fill that runs from
   the track's left end to the knob.

**Run when:** `src/components/Slider.tsx`, its stories, or a
changeset naming Slider.

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

## ButtonRow

Open in `Components/ButtonRow`: Default.

A ButtonRow is a row of action buttons that follows content.
It owns the bar's whole treatment — there are no spacing props
to pass.

1. The button row follows the text at the separation its parent
   supplies (in the story, the wrapping stack's gap — the bar
   itself carries no margin), the two buttons sit 12px apart,
   and at a narrow width the second button wraps onto the next
   line instead of overflowing (MealPlanDetailPage's Shopping
   list / Edit bar and the Memorize card footers are the live
   cases).

**Run when:** `src/components/ButtonRow.tsx`, its stories, the
pages that compose ButtonRow (MemorizeReviewPage, MyVersesPage,
MealPlanDetailPage), or a changeset naming ButtonRow.

---

## CardStack

Open in `Components/CardStack`: Default.

A CardStack is a stack of cards — a list whose rows are cards.

1. The three cards stack with an even 8px gap between them,
   each keeping its own internal padding and full width
   (MealPlansPage's plan list is the live case, including the
   first card's danger Delete action).

**Run when:** `src/components/CardStack.tsx`, its stories, the
pages that compose CardStack (MealPlansPage), or a changeset
naming CardStack.

---

## SectionStack

Open in `Components/SectionStack`: Default.

A SectionStack is a stack of a page's sections — its major
blocks in order.

1. Every block in the stack — title, meta line, paragraph — is
   separated by the same 32px gap, and children fill the
   stack's width (MealPlanDetailPage's page stack is the live
   case: every section separation on the page is that one gap).

**Run when:** `src/components/SectionStack.tsx`, its stories,
the pages that compose SectionStack (MealPlanDetailPage), or a
changeset naming SectionStack.

---

## FieldRow

Open in `Components/FieldRow`: Default.

A FieldRow composes form fields and their action on one line —
here a search field with its submit button.

1. The search field fills the row's remaining width, the Search
   button keeps its natural width, and field and button are
   vertically centered on each other (VerseSearchPage's search
   row is the live case).

**Run when:** `src/components/FieldRow.tsx`, its stories,
`src/components/SearchField.tsx` (the `grow` prop), the pages
that compose FieldRow (VerseSearchPage), or a changeset
naming FieldRow.

---

## ListStack

Open in `Components/ListStack`: Default.

A ListStack composes hairline rows as one continuous list; the
stack adds no gap of its own — the rows own their separation.

1. The three rows read as one ruled surface: hairlines run
   continuously from row to row with no gaps of card background
   between them, and the third row shows the disabled treatment
   (MealPlanDetailPage's Entries card and MealDetailPage's
   Recipes card are the live cases).

**Run when:** `src/components/ListStack.tsx`, its stories, the
pages that compose ListStack (MealPlanDetailPage,
MealDetailPage), or a changeset naming ListStack.

---

## Center

Open in `Components/Center`: Centered, HorizontalOnly.

Center centers a single child; `horizontal` and `vertical` are
booleans, both defaulting to true.

1. Centered: the spinner sits at the center of the framed
   block, both dimensions on. Toggle `vertical` off in the
   controls: the spinner moves to the top, still centered
   horizontally; toggle `horizontal` off instead: it moves to
   the left edge, still centered vertically.
2. HorizontalOnly: the notice sits at the top of its block,
   centered horizontally (MealPlansPage's loading block is the
   live page case — the spinner centered under the heading and
   create button).

**Run when:** `src/components/Center.tsx`, its stories, the
pages that compose Center (MealPlansPage), or a changeset
naming Center.

---

## DetailRow

Open in `Components/DetailRow`: Default, Stacked.

1. Default: the muted label sits on the left edge and the value on
   the right edge of the same line, over a light hairline.
2. Stacked: three rows share the same hairline rhythm — labels
   aligned left, values aligned right, even vertical padding on
   every row.

**Run when:** `src/components/DetailRow.tsx`, its stories,
MealPlanDetailPage (the nutrition-goal rows), or a changeset
naming DetailRow.

---

## LoadingGate

Open in `Components/LoadingGate`: Default.

1. The spinner sits centered — horizontally and vertically — on a
   plain surface background that fills the story canvas, with its
   accessible label naming what is loading ("Loading meal plan").
2. MealPlanDetailPage's Loading story shows the identical gate.

**Run when:** `src/components/LoadingGate.tsx`, its stories,
MealPlanDetailPage's loading state, or a changeset naming
LoadingGate.

---

## ListRow

Open in `Components/ListRow`: Prefixed, Plain, Disabled.

1. Prefixed: the title line reads "Meal · Taco Tuesday" (the
   prefix is caller-supplied content) in medium weight over the
   muted meta line, with a hairline under the row; the row presses
   (pointer cursor on web, Enter/Space activate).
2. Plain: the title line reads "Garlic cream chicken" with no
   prefix and no meta line.
3. Disabled: the title gains its caller-supplied " (unavailable)"
   suffix; the row does not press, is not focusable, and is
   exposed as disabled.

**Run when:** `src/components/ListRow.tsx`, its stories,
MealPlanDetailPage's entries, or a changeset naming ListRow.

---

## CardRow

Open in `Components/CardRow`: Default, WithAction, TitleOnly.

1. Default: an elevated card with the title in semibold over its
   muted meta line; the text block presses (pointer cursor on
   web, Enter/Space activate) and no action button shows.
2. WithAction: a small soft-red action button ("Delete",
   danger tone) sits at the card's right edge, vertically
   centered, and pressing it does not trigger the row's press.
3. TitleOnly: the card shows the title alone, no meta line and no
   empty gap where it would sit.

**Run when:** `src/components/CardRow.tsx`, its stories,
MealPlansPage's list, or a changeset naming CardRow.

## PresetValueSelector

Open in `Components/PresetValueSelector`: Default,
CustomSelected.

1. Default: the Scale row shows ½× / 1× / 2× / 3× preset buttons
   at equal width in one non-wrapping row, 1× selected
   (primary-filled, light label), plus the narrower Custom
   button unselected.
2. CustomSelected: the Custom button shows "2.5×" and is
   selected (primary-filled); no preset is selected.
3. Pressing Custom swaps it in place for a decimal number
   input; entering 4 and blurring applies 4× (the button
   returns showing "4×", selected); entering 0 or text commits
   nothing and restores the previous value. On web the Custom
   button carries `aria-pressed` matching its selected state.

**Run when:** `src/components/PresetValueSelector.tsx`, its
stories, the recipe pages' scale rows, or a changeset naming
PresetValueSelector.

---

## CatalogFiltersBar & CatalogHeader

Open in `Components/CatalogFiltersBar`: Collapsed, ChooserOpen,
WithFiltersAdded; and `Components/CatalogHeader`: Default.

1. Collapsed: a search field with its clear button and a
   Filters button; below them the caller-supplied sorter row
   and the result count line. Nothing about the filter set is
   built in — the story's filters come from its args.
2. ChooserOpen: the filter chooser lists the passed-in filter
   definitions with their controls (the demo's tag, status,
   numeric, and availability shapes).
3. WithFiltersAdded: each added filter renders as a removable
   row naming its filter; its remove button reads "Remove
   <label> filter" and removing it returns the row to the
   chooser.
4. CatalogHeader Default: the title renders as the heading
   above the composed bar, left-aligned at the column inset.

**Run when:** `src/components/CatalogFiltersBar.tsx`,
`src/components/CatalogHeader.tsx`, their stories, the catalog
pages, or a changeset naming either.

---

## RatingsCard, StatusBadge & SectionHeading

Open in `Components/RatingsCard`: Default, NoRatingsYet,
Stale; `Components/StatusBadge`: Tones;
`Components/SectionHeading`: Default.

1. RatingsCard Default: the eyebrow label, the community stars
   with the numeric average and rating count, and the viewer's
   own star row; tapping a viewer star updates it.
2. NoRatingsYet: the empty community line renders in place of
   the average; the viewer row still rates.
3. Stale: the stale treatment renders as the story defines it,
   with no layout shift against Default.
4. StatusBadge Tones: one badge per tone, each showing the
   caller-passed label — the tones are Badge's, the words are
   the caller's.
5. SectionHeading Default: the heading renders in the
   subheading treatment, flush to its parent's inset — the
   heading itself carries no padding; the story's panel
   supplies the inset.

**Run when:** `src/components/RatingsCard.tsx`,
`src/components/StatusBadge.tsx`,
`src/components/SectionHeading.tsx`, their stories, or a
changeset naming any of them.

---

## Page shells (ScreenShell, ScrollShell, SessionShell, PinnedHeaderShell)

Open in `Components/ScreenShell`: Default;
`Components/ScrollShell`: Default; `Components/SessionShell`:
Fixed, Scrollable; `Components/PinnedHeaderShell`: Default.

1. ScreenShell: the pinned bar stays fixed while the region
   below scrolls; the surface behind is the shell's paint.
2. ScrollShell: the whole column scrolls inside the surface
   frame, content inset by the standard padding with even
   separation.
3. SessionShell Fixed: heading and actions stay put with a
   short form; Scrollable: a long form scrolls under the
   pinned heading/actions.
4. PinnedHeaderShell: the header block stays pinned while the
   body scrolls beneath it.

**Run when:** any of the four shell components, their stories,
or a changeset naming them.

---

## Public frame & document chrome

Open in `Components/PublicFrameLayout`: Default;
`Components/PublicFrameHeader`: Default;
`Components/PublicFrameFooter`: Default;
`Components/BrandLink`: Default;
`Components/DocumentHeader`: Default;
`Components/DocumentFooter`: Default.

1. The header band: wordmark left, Sign in right — both are
   real links (the DOM nodes are anchors carrying their
   hrefs; right-click offers "Open in new tab"). The wordmark
   is the semibold primary wordmark with no underline.
2. The footer band: the note in muted ink and the links the
   caller passed in (the story passes Privacy / Terms),
   rendered in the caller's order as real links and wrapping
   without overlap on narrow widths.
3. The layout centers its content column at 768px on wide
   viewports and fills narrow ones; header and footer bands
   span the full width.
4. DocumentHeader: the same wordmark + sign-in link contract
   in the lighter in-column row (no band); DocumentFooter
   renders the caller's links as links under its divider.

**Run when:** `src/components/PublicFrameLayout.tsx`,
`PublicFrameHeader.tsx`, `PublicFrameFooter.tsx`,
`BrandLink.tsx`, `DocumentHeader.tsx`, `DocumentFooter.tsx`,
their stories, or a changeset naming any of them.

---

## List states (ListLoadingState)

Open in `Components/ListLoadingState`: Default.

1. ListLoadingState: the spinner renders centered in its
   parent with its label; the state carries no padding or
   margin of its own — spacing around it is the parent's.
   The same component renders directly at the foot of a list
   for the loading-more slot — check that rendering in
   `Pages/Eciperay/DiscoverPage`: LoadingMore, where the
   spinner follows the last card with the list's own gap.
2. A list's error state has no wrapper component: the page
   renders the Alert component directly — check in
   `Pages/Eciperay/DiscoverPage`: ErrorState, where the alert
   sits under the filter bar, flush to the parent's inset.

**Run when:** `src/components/ListLoadingState.tsx`, its
stories, or a changeset naming it.

---

## Content rows (StepList, MarkableRow, SuggestionPanel, TagList, FieldStack, TextActionCardRow, CenteredText, StatusMessage, SearchRow, RemovableField)

Open in `Components/StepList`: Default;
`Components/MarkableRow`: Default;
`Components/SuggestionPanel`: Default;
`Components/TagList`: Default; `Components/FieldStack`: (its
stories); `Components/TextActionCardRow`: (its stories);
`Components/CenteredText`: (its stories);
`Components/StatusMessage`: Default, Empty, Transient;
`Components/SearchRow`: (its stories);
`Components/RemovableField`: (its stories).

1. StepList: steps render numbered in order; a step with a
   heading shows it above its body.
2. MarkableRow: the row's mark toggle flips its marked state
   treatment without shifting the row layout.
3. SuggestionPanel: the panel title sits over one entry per
   suggestion, in the caller's order.
4. TagList: one Badge per tag in the caller's tag colors,
   wrapping onto the next line at the story width — display
   only, nothing presses.
5. SearchRow: the search field claims the row's width and its
   trailing action sits at the end; RemovableField's remove
   button names the value it removes.
6. StatusMessage: the message line is centered, small, and in
   muted ink that stays readable in the dark theme; Empty shows
   nothing (the live region is mounted but empty); Transient's
   toggle makes the confirmation appear and disappear under the
   button row without shifting focus.

**Run when:** any of these components, their stories, or a
changeset naming them.

---

## Form set (FormStack, FormHeading, LabeledField, LabeledGroup, FieldLabel, RevertAction, ChangedListBanner)

Open in `Components/FormStack`: Default;
`Components/FormHeading`: Default, WithSubtitle;
`Components/LabeledField`: Default, WithAction, WithError;
`Components/LabeledGroup`: Default, WithAction;
`Components/FieldLabel`: Default, Associated;
`Components/RevertAction` and `Components/ChangedListBanner`
(their stories).

1. FormStack: fields render in order with the form rhythm —
   even 16px separation and the longer tail below the last
   field.
2. FormHeading: the title renders in the form-title treatment;
   WithSubtitle shows the hint line under the title.
3. LabeledField: the label sits 4px over the field; on web the
   label is a real label element — clicking it focuses the
   field. WithError shows the error line below the field in
   the error treatment; WithAction shows the action at the
   label row's end.
4. LabeledGroup: the label sits 8px over the grouped control —
   the wider separation than a field's; the group announces
   itself by the label's name.
5. RevertAction: the "Revert to: <label>" text action renders
   in the warning ink and presses like a button.
6. ChangedListBanner: the changed-lines list renders on the
   warning wash; the "Revert changes" action appears only in
   the story that passes a revert handler.

**Run when:** any of these components, their stories, the form
pages, or a changeset naming them.

---

## Thumbnail

Open in `Components/Thumbnail`: Hero, Banner, Row.

1. Hero: the image sits contained (whole image visible) inside
   a recessed light-gray frame 256px tall with large rounded
   corners, at full story width.
2. Banner: the image fills the full width at 192px tall,
   cover-cropped, with large rounded corners and no frame.
3. Row: a 64px square image, cover-cropped, medium rounded
   corners, over the hint line.

**Run when:** `src/components/Thumbnail.tsx`, its stories, the
recipe pages' imagery or the import review's preview, or a
changeset naming Thumbnail.

---

## ScrollRegion

Open in `Components/ScrollRegion`: Default.

1. The "Pinned header" block stays at the top and the "Pinned
   footer" block at the bottom of the 480px frame while the
   twelve section paragraphs between them scroll.
2. The scrolling region fills exactly the space between the
   header and footer — no gap, no overlap.
3. Keyboard only: Tab reaches the scrolling region itself (its
   paragraphs contain no focusable elements) and the arrow /
   Page Down keys scroll it.

**Run when:** `src/components/ScrollRegion.tsx`, its stories,
a fixed-shell page's scroll region, or a changeset naming
ScrollRegion.

---

## StatBand

Open in `Components/StatBand`: Default, TwoStats.

1. Default: Servings, Prep, and Cook stat cards spread evenly
   across a recessed light-gray band with large rounded corners
   and vertical padding; the band itself has no margin.
2. TwoStats: the two cards spread to the band's ends with the
   same fill and padding.

**Run when:** `src/components/StatBand.tsx`, its stories, the
recipe detail pages' stat band, or a changeset naming StatBand.

---

## RemovableField

Open in `Components/RemovableField`: Default.

1. A small ghost "Remove" button sits right-aligned above the
   Ingredient field at a 4px gap; its accessible name names the
   field ("Remove Ingredient filter").
2. The field under it renders at full width, unchanged.

**Run when:** `src/components/RemovableField.tsx`, its
stories, the catalog pages' filter bars, or a changeset naming
RemovableField.

---

## LegalDocumentPage

Open in `Pages/Eciperay/LegalDocumentPage`: PrivacyPolicy,
TermsOfService, Wide.

1. The document title is the level-1 heading, with the muted
   last-updated line under it — "Last updated: July 22, 2026"
   in PrivacyPolicy, "Last updated: June 18, 2026" in
   TermsOfService (each story's fixture date); each section
   title is a level-2 heading.
2. The paragraph renders its strong span bold and its mailto
   link underlined in link ink; the list renders bulleted rows
   with bold lead-ins and a monospace code span.
3. In Wide (the unconstrained story — the other two pin a
   430px viewport, where the cap cannot bind): on a wide
   viewport the prose column caps at 768px and centers; the
   frame header (wordmark + sign-in links) and footer (the
   host's legal links) render as real links.

**Run when:** `src/pages/LegalDocumentPage.tsx`, its stories,
DocumentHeader / DocumentFooter, or a changeset naming
LegalDocumentPage.

---

## LandingPage

Open in `Pages/Eciperay/LandingPage`: Default, Wide.

1. The headline renders centered as the level-1 heading, with
   the muted subtitle centered under it and breathing room
   above the headline.
2. The three CTAs are Button's href form (`<Button href>` —
   the ButtonLink form; there is no CtaLink): the primary CTA
   is the filled brand button link, the two secondaries are
   neutral button links, all real links (role link, their
   hrefs), never buttons. On web they sit in one centered row
   (check in Wide); on native (the RN storybook) they stack
   vertically — the row never wraps two CTAs side by side at
   phone width.
3. Feature cards: in Wide the three cards share one row, each
   with its title as a level-2 heading and the muted
   description under it; in Default (the 430px phone viewport)
   they wrap onto further rows at their 260px basis instead
   of squeezing — three-across cannot fit there.

**Run when:** `src/pages/LandingPage.tsx`, its stories,
Button's href form, or a changeset naming LandingPage.

---

## MealPlansPage & MealPlanDetailPage

Open in `Pages/Eciperay/MealPlansPage`: Default, Empty, Loading,
NoActions. Open in `Pages/Eciperay/MealPlanDetailPage`: Default,
Empty, Loading, NoGoals, NutritionUnavailable.

1. MealPlansPage Default: the "Meal plans" heading, the full-width
   "New meal plan" button under it, then the plan cards stacked
   at an even rhythm — each title over its meta line; NoActions
   drops the create button and the row Delete buttons.
2. MealPlansPage Loading: the spinner sits centered horizontally,
   16px below the create button; Empty shows "No meal plans yet."
3. MealPlanDetailPage Default: the plan title (xl bold, heading
   level 1) and its muted meta lines separated by the page's
   uniform 32px section gap, the Nutrition goals card (plan
   total, then label/value rows over hairlines at the card's
   even content rhythm), the Shopping list / Edit buttons side
   by side with a 12px gap, then the Entries card with
   kind-prefixed entry rows as one continuous ruled list.
4. MealPlanDetailPage Loading shows only the centered loading
   gate; NoGoals (a nutrition summary is present but no goals
   are set) shows the goals card with the plan total, the
   set-goals hint, and the "Set nutrition goals" link;
   NutritionUnavailable forces the same card via the visibility
   control when no summary exists.

**Run when:** `src/pages/MealPlansPage.tsx`,
`src/pages/MealPlanDetailPage.tsx`, their stories, or a changeset
naming either page.

---

## RecipeFormPage, MealFormPage & MealPlanFormPage

Open in `Pages/Eciperay/RecipeFormPage`: Default, Empty,
ContentLocked, VersionDiff. Open in `Pages/Eciperay/MealFormPage`:
Default, NoSelection, SaveError. Open in
`Pages/Eciperay/MealPlanFormPage`: Default, NoSelection.

1. RecipeFormPage Default: Title, the Status toggle buttons,
   Description with its "Generate with AI" action, the Servings
   / Prep / Cook fields in one equal-width FieldColumns row,
   image, Ingredients and Instructions
   slots, the selectable Tag badges, Source URL, and the
   full-width Create Recipe button, evenly spaced in one
   scrolling form. On web, clicking a field label (Title,
   Description, Servings, Prep, Cook, Source URL) focuses its
   input.
2. ContentLocked: the lock notice renders in place of the
   Ingredients and Instructions slots — the slots disappear —
   while the scalar fields and tags remain editable.
3. VersionDiff: the ingredients and instructions changed-list
   banners render above their slots with Revert actions, and
   changed fields carry their revert actions beside the labels.
4. MealFormPage Default: the meal-title heading, fields, recipe
   checkbox list, and a servings stepper per selected recipe;
   NoSelection disables Save meal; SaveError shows the error
   line above the submit row.
5. MealPlanFormPage Default: the plan-title heading, the Starts
   on / Ends on fields, the entry checkbox list with kind
   prefixes, and quantity (plus servings for recipes) steppers
   grouped per selected entry in their own field stacks;
   NoSelection disables Save plan.

**Run when:** `src/pages/RecipeFormPage.tsx`,
`src/pages/MealFormPage.tsx`, `src/pages/MealPlanFormPage.tsx`,
their stories, or a changeset naming any of the three pages.

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
Loading, LoadingMore, FilterChooserOpen, WithFiltersAdded,
ExpandedAccessory — and the Shared-with-me configuration (#185):
SharedDefault, SharedFiltered, SharedEmpty, SharedLoading.

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
7. LoadingMore keeps the recipe rows rendered with the footer
   spinner below them (the next-page-in-flight state,
   `isFetchingNextPage`), like DiscoverPage's LoadingMore story.
8. Rows: each row is an elevated card with a 64px cover-cropped
   thumbnail (or the gray placeholder well when the recipe has
   no image), a semibold title, and a hint subtitle. Both the
   thumbnail and the text are links to the recipe — the card
   itself is not pressable. At a narrow width the text block
   wraps under the thumbnail rather than collapsing beside it
   (the 60dp basis). ExpandedAccessory shows the accessory
   content under the card inside the same list item, 12px
   below it.
9. Log-cook control: a rated row's stars are one button with a
   44dp target, filled by rounding (a 4.5 rating shows five
   amber stars), named "Log a cook of <title>, rated <N> out
   of 5 stars"; an unrated row shows a single gray star as the
   button, named "Log a cook of <title>". The control flows
   inline after the subtitle text, never as a trailing row
   item, and it hides on the row whose accessory is open.

**Run when:** `src/pages/RecipesPage.tsx` (including its
page-local row and log-cook control compositions), its
stories, or a changeset naming RecipesPage or the
Shared-with-me screen.

---

## RecipeDetailPage

Open in `Pages/Eciperay/RecipeDetailPage`: Default, Minimal, Loading,
Ingredients, Instructions, CookHistory, CookLogFormOpen, Nutrition.

1. The overview action row: Print and Share render as **real icons**
   (printer / share-2 from `@spudly/ui/icons`) in the same neutral
   button treatment as Edit/Delete — no emoji or text glyphs, no
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
4. Ingredients: the Ingredients story opens with the "Heavy
   cream" row already marked missing — the row is dimmed and the
   substitutions panel shows below the list. Tapping the row
   clears the missing mark (the dim and the panel disappear);
   tapping it again restores them. The servings stepper and the
   Scale preset buttons fit the story width without wrapping the
   Scale row; the selected scale is primary-filled.
5. Open in `Pages/Eciperay/PublicPageFrame`: Default, Content,
   NarrowViewport. The header (Eciperay brand, Sign in) and footer (the
   without-an-account note, Privacy Policy, Terms of Service)
   frame the centered wide column; in NarrowViewport the column fills the
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
IconOnlyVariants, IconSizes, IconDisabled, IconPressCounter,
Toggle, ToggleStates.

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
7. Toggle: the pill row's selected member is primary-filled with
   a light label; pressing another pill moves the selection and
   the fill. On web the selected button carries
   `aria-pressed="true"` and the others `aria-pressed="false"`.
8. ToggleStates: unselected renders in the resting secondary
   treatment, selected primary-filled, and selected-disabled is
   dimmed and inert.

**Run when:** `src/components/Button.tsx`, its stories, or a
changeset naming Button or the Button icon slot.

---

## Navigation link forms (Button, TextLink, BackLink, Tabs)

Open in `Components/Button`: Link, LinkVariants, LinkSizes,
LinkDisabled. Open in `Components/TextLink`: Href, HrefInProse.
Open in `Components/BackLink`: Href. Open in `Components/Tabs`:
LinkNavigation.

The href (link) forms from #248 stage 1 — a navigating control
renders as a real anchor carrying its href:

1. Button Link / LinkVariants / LinkSizes: each renders as an
   anchor (in the DOM it is an `<a>` with the story's href, and
   right-click offers "Open in new tab"), visually identical to
   the corresponding button story — same fill, label color,
   padding, and size steps. LinkDisabled renders dimmed and is
   not followable (no href in the DOM).
2. TextLink Href / HrefInProse: the links carry their hrefs and
   keep the link color and underline, inline in the prose.
   TextLink Muted: the same link in the muted treatment (the
   theme's muted ink, still underlined) — the de-emphasized
   treatment the auth forms' "Forgot password?" and "Back to
   sign in" links render in.
3. BackLink Href: the drawn arrow and label render inside one
   anchor with the href; the arrow stays centered on the label's
   line, as in the Default story.
4. Tabs LinkNavigation: all four tabs are anchors with hrefs;
   Search (the current tab) carries the active underline and
   label treatment. The button-variant stories (RecipeDetail,
   AppNavigation) still switch the selection in place.

**Run when:** `src/components/Button.tsx`, `TextLink.tsx`,
`BackLink.tsx`, or `Tabs.tsx`, their stories, or a changeset
naming the navigation link forms or #248.

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
2. The `title` variant ("Title" in AllVariants) is the compact
   page title — xl bold — and is also exposed as a heading at
   level 1 (MealPlanDetailPage's plan title renders through it).
3. The `subheading` variant carries `role="heading"` with
   `aria-level="2"`.
4. The `body`, `hint`, `error`, and `verse` variants carry no
   heading role and no `aria-level`.
5. The `formTitle` variant ("FormTitle" in the Text stories)
   is the form-flow page title — 2xl bold — and is exposed as a
   heading at level 1 (the Import pages' titles render through
   it once their tranches land).
6. The `label` variant ("Label" in the Text stories) is the
   section eyebrow — xs semibold, uppercase, letter-spaced,
   muted gray — and carries no heading role and no `aria-level`.
7. The `muted` variant ("Muted" in the Text stories) is
   body-size text in the muted treatment — the intro line under
   the auth pages' titles and the Profile page's email line
   render through it — and the `success` variant ("Success")
   is small text in the success treatment — the Feedback page's
   submitted thanks renders through it. Neither carries a
   heading role.
8. Visually nothing changes: heading/subheading keep their sizes
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
`src/pages/ResetPasswordPage.tsx`, the form components they
compose (`src/components/SignInForm.tsx`,
`src/components/SignUpForm.tsx`,
`src/components/ForgotPasswordForm.tsx`,
`src/components/ResetPasswordForm.tsx`), their stories, or a
changeset naming the auth pages or Enter-to-submit.

---

## Auth forms (SignInForm, SignUpForm, ForgotPasswordForm, ResetPasswordForm) & LegalSection

Open in `Components/SignInForm`, `Components/SignUpForm`,
`Components/ForgotPasswordForm`, `Components/ResetPasswordForm`,
`Components/LegalSection` (each form's Default story — the
stories are interactive: fields can be typed in).

The auth pages' forms as standalone components: each form
composes the shared FormStack (which owns the 16px field
rhythm) and its own footer layout, and the pages compose the
forms.

1. Each form's fields stack at a 16px rhythm, and an error (the
   WithError story) renders directly above the submit button in
   the error treatment.
2. In SignInForm's Default story, both footer links render
   under the submit button at a tighter 8px separation:
   "Create an account" in the link color and "Forgot password?"
   in the muted treatment. In the WithoutLinks story neither
   link renders and the form ends at the submit button.
3. In SignUpForm's Default story, the legal notice under the
   submit button and the centered "Already have an account?
   Sign in" link below it read as one centered footer block.
4. In ForgotPasswordForm's Default story, the muted "Back to
   sign in" link renders under the submit button.
5. In LegalSection's Default story, the "Legal" title (large,
   semibold) sits 12px above the two links, which stack 12px
   apart — the Profile page's legal block.

**Run when:** `src/components/SignInForm.tsx`,
`src/components/SignUpForm.tsx`,
`src/components/ForgotPasswordForm.tsx`,
`src/components/ResetPasswordForm.tsx`,
`src/components/LegalSection.tsx`, their stories, the auth or
Profile pages that compose them, or a changeset naming the
auth forms or LegalSection.

---

## PanelStack

Open in `Components/PanelStack`: Default.

1. The panel's blocks (the title, the body text, the stat
   band) sit inside an even 16px inset with 16px between
   blocks, and the panel stretches to its column's width —
   the blocks are listed, never spaced by hand.

**Run when:** `src/components/PanelStack.tsx`, its stories, a
detail page composing it, or a changeset naming PanelStack.

---

## Toolbar

Open in `Components/Toolbar`: Default.

1. The status badge and the Version select share one line
   over a hairline divider, the select growing to take the
   bar's remaining width; the bar's inset is 16px at the
   sides and 12px vertically. Narrow the story's frame: the
   select wraps onto a second line instead of overflowing
   the bar.

**Run when:** `src/components/Toolbar.tsx`, its stories, a
fixed-shell page composing it, or a changeset naming Toolbar.

---

## CandidateList

Open in `Components/CandidateList`: Default, Pending,
ReadOnly.

1. Default: the heading sits over one tinted card per
   candidate, each card carrying the candidate's label and
   its Activate button; each button's accessible name
   includes its candidate ("Activate Pea soup").
2. Pending: the Activate button renders disabled while the
   activation is in flight.
3. ReadOnly: the cards render their labels with no Activate
   button — candidate data alone exposes no dead action.

**Run when:** `src/components/CandidateList.tsx`, its
stories, or a changeset naming CandidateList.

---

## LogEntryCard

Open in `Components/LogEntryCard`: Default, WithoutAction.

1. Default: the date and the star rating head the card, the
   notes body follows, and the Delete action sits below,
   carrying its entry-specific accessible name (position +
   date, composed by the caller).
2. WithoutAction: the card renders its date and rating with
   no Delete action.

**Run when:** `src/components/LogEntryCard.tsx`, its
stories, or a changeset naming LogEntryCard.

---

## NutritionPanel

Open in `Components/NutritionPanel`: Ready, Loading,
Unavailable, UnavailableRefreshing.

1. Ready: the "Per Serving" header with its Refresh action,
   one hairline label/value row per nutrient, and the
   disclaimer in small muted text below.
2. Loading: a single "Estimating nutrition…" line.
3. Unavailable: the not-available line with the Estimate
   nutrition action below it. UnavailableRefreshing: the
   action reads "Refreshing…" and renders disabled while
   the refresh is in flight.

**Run when:** `src/components/NutritionPanel.tsx`, its
stories, or a changeset naming NutritionPanel.

---

## RecipeOverviewPanel

Open in `Components/RecipeOverviewPanel`: Default, Minimal.

1. Default: the title, status pill, description, stat band,
   and tag pills stack with even 16px separation; the tag
   pills carry their named colors. Minimal shows the title,
   the "Idea" pill, and the Servings stat only — no
   description, Prep/Cook stats, or tag row.

**Run when:** `src/components/RecipeOverviewPanel.tsx`, its
stories, PublicRecipePage, RecipeDetailPage, or a changeset
naming RecipeOverviewPanel.

---

## RecipeIngredientsPanel

Open in `Components/RecipeIngredientsPanel`: Default, Plain.

1. Default: the servings stepper and the Scale preset row
   fit the width without the Scale row wrapping; the Custom
   button turns into a number input when pressed and, once a
   value is entered, shows it selected (e.g. "4×"). The
   dimmed "heavy cream" row is marked missing and the
   Substitutions panel shows below the list; pressing the
   row clears the dim.
2. Plain: two unadorned rows with hairline separators and no
   substitutions panel.

**Run when:** `src/components/RecipeIngredientsPanel.tsx`,
its stories, PublicRecipePage, RecipeDetailPage, or a
changeset naming RecipeIngredientsPanel.

---

## RecipeInstructionsPanel

Open in `Components/RecipeInstructionsPanel`: Default.

1. The first step card is highlighted (primary border and
   tint) on open; pressing another card moves the highlight
   to it. Steps render in step-number order.

**Run when:** `src/components/RecipeInstructionsPanel.tsx`,
its stories, PublicRecipePage, RecipeDetailPage, or a
changeset naming RecipeInstructionsPanel.

---

## PreviewCard

Open in `Components/PreviewCard`: Default, NoTitle,
NoActions.

1. Default: the title heads the framed preview in its own
   treatment, the preview content follows, and the actions
   sit below the content inside the card — the frame is the
   fixed gray3 hairline on the surface fill.
2. NoTitle: no title block renders; the content starts at
   the card's inset.
3. NoActions: no actions row renders below the content.

**Run when:** `src/components/PreviewCard.tsx`, its stories,
AiSessionPage, ImportReviewPage, or a changeset naming
PreviewCard.

---

## BadgeCardRow

Open in `Components/BadgeCardRow`: Default, DeleteOnly.

1. Default: a compact card (small padding and shadow) with
   the colored badge at the left and Edit / Delete as bare
   text actions at the right, Delete in the error treatment.
2. DeleteOnly: only the Delete action shows; the badge
   keeps its color and the row height is unchanged.

**Run when:** `src/components/BadgeCardRow.tsx`, its
stories, TagsPage's rows, or a changeset naming
BadgeCardRow.

---

## TrailingActionsRow; Card's compact variant

Open in `Components/TrailingActionsRow`: FieldAndAction,
ContentAndTextActions, Narrow; `Components/Card`: Compact.

1. FieldAndAction: the leading group sits at the left and
   the action at the right on one line.
   ContentAndTextActions: the badge sits left, Edit / Delete
   right, at a 12px gap between the actions. Narrow: when
   the groups cannot fit, the action wraps below the leading
   group instead of overflowing.
2. Card Compact: the surface is the small card treatment —
   12px padding, medium corners, small shadow, no border
   (the former CompactCard, folded into Card as
   `variant="compact"` under Stephen's 2026-10-29 ruling).

**Run when:** `src/components/TrailingActionsRow.tsx`,
`src/components/Card.tsx`, their stories, TagsPage's forms
or rows, or a changeset naming any of them.

---

## ButtonStack

Open in `Components/ButtonStack`: Default.

1. The three buttons stretch full width at an even 12px
   rhythm.

**Run when:** `src/components/ButtonStack.tsx`, its
stories, HomePage's actions, or a changeset naming
ButtonStack.

---

## CheckRow

Open in `Components/CheckRow`: Default, Checked, LabelOnly.

1. Default: an outlined box sits left of a bold label with
   its muted detail ("2 tbsp · optional") on the same line,
   over a hairline; the whole row is the press target
   (pointer cursor on web, Enter/Space toggle it, the
   story's row checks and unchecks).
2. Checked: the box fills with the primary color and a check
   glyph, and the label renders muted and struck through.
3. LabelOnly: no detail segment renders — the label stands
   alone with no trailing separator.

**Run when:** `src/components/CheckRow.tsx`, its stories,
ShoppingListPage's list, or a changeset naming CheckRow.

---

## StepOverlay

Open in `Components/StepOverlay`: Default.

1. The dark overlay fills its frame: title and step eyebrows
   render uppercase and dimmed over the step body in large
   light text, and the translucent Done pill sits at the
   top right (focusable on web; Enter/Space activate it —
   each activation adds to the "Done activated" line under
   the frame).
2. The story's dots and Back / Next row render below the
   body, composed by the caller, and walk the demo's three
   steps (Back disables on the first step, Next on the
   last) — the controls are the caller's; the shell owns
   only the gap above them (its 32px body bottom padding).

**Run when:** `src/components/StepOverlay.tsx`, its
stories, MealCookingModePage, or a changeset naming
StepOverlay.

---

## FieldColumns

Open in `Components/FieldColumns`: Default.

1. Servings, Prep (min), and Cook (min) fields sit in three
   equal-width columns with an even gutter between them;
   each label sits over its own field.

**Run when:** `src/components/FieldColumns.tsx`, its
stories, RecipeFormPage, or a changeset naming FieldColumns.

---

## FormSubmit

Open in `Components/FormSubmit`: Default.

1. FormSubmit Default: the Save meal button sits 32px below
   the field above it — FormSubmit's own 16px of top padding
   on top of the layout's 16px gap — full width.

**Run when:** `src/components/FormSubmit.tsx`, its stories,
a form page composing it, or a changeset naming it.
(FormStack and FormHeading are covered by the Form set
section above.)
