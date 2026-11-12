---
"@spudly/ui": minor
---

PublicRecipePage gains a `comments` data prop (#130, tranche T7): the page renders the recipe comments section (RecipeCommentsView) in the engagement stack under the ratings card from the supplied view-model, so public-page hosts no longer need to build the comments section themselves or pass it through the render slot. The existing `renderComments` slot remains as the fallback for unmigrated hosts, and the data prop wins when both are passed. Signed-out viewers see the comment list with no composer (the composer renders only when the host passes `onPost`). Test: open the PublicRecipePage CommentsAsData story and confirm the two fixture comments render in a Comments card under the ratings card with no composer, and that the Default story's slotted comments stand-in still renders.
