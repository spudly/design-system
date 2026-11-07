---
component: Dialog
run_when:
  - src/widgets/Dialog.tsx, its stories, or a changeset naming Dialog.
---

# Dialog — manual test steps

Colocated manual test steps for `src/widgets/Dialog.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## Dialog

Open in `Widgets/Dialog`: Interactive, WithoutActions,
NestedDialogs.

1. Interactive: the "Delete recipe" button opens the dialog with
   its title, description, body text, and Cancel / Delete actions
   laid out in a centered card over a dimmed overlay.
2. Focus restoration (web, #385): focus the "Delete recipe"
   button (Tab to it), open the dialog, then dismiss it each
   way — Cancel, Delete, Escape, and clicking the overlay.
   After every dismissal keyboard focus returns to the
   "Delete recipe" button; focus never lands on the page body
   leaving the user to navigate back from the top.
3. WithoutActions: the "About" button opens a dialog with no
   footer row; dismissing it likewise returns focus to the
   "About" button.
4. NestedDialogs (web, #394): both dialogs start open, the
   nested one on top of its parent. Tab and Shift+Tab cycle
   only between the nested dialog's Keep draft / Discard
   buttons — focus never lands in the parent dialog (which
   has no controls of its own) or on the "Open nested
   dialogs" button behind the overlays. Dismiss the nested
   dialog (Keep draft) and the parent dialog remains open.

**Run when:** `src/widgets/Dialog.tsx`, its stories, or a
changeset naming Dialog.
