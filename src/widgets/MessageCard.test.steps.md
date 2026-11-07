---
component: MessageCard
run_when:
  - src/widgets/MessageCard.tsx, its stories, PublicRecipePage's notFound and unavailable states, or a changeset naming MessageCard.
---

# MessageCard — manual test steps

Colocated manual test steps for `src/widgets/MessageCard.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## MessageCard

Open in `Widgets/MessageCard`: Default, LongMessage.

A MessageCard is a whole-screen message state: a card carrying
a heading and one explanatory line, centered — horizontally
and vertically — on a surface-filled shell that fills the
story frame's height, inset 16px from the frame's edges. It
owns the whole treatment; the caller supplies only the two
strings.

1. Default: the card sits at the vertical center of the frame
   (not the top), the heading reads centered over the muted
   message line, also centered.
2. LongMessage: the message wraps inside the card and every
   wrapped line stays centered; the card grows taller and
   remains vertically centered.
3. PublicRecipePage's NotFound and Unavailable stories show
   the identical state once the page adopts the component.

**Run when:** `src/widgets/MessageCard.tsx`, its stories,
PublicRecipePage's notFound and unavailable states, or a
changeset naming MessageCard.
