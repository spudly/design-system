---
"@spudly/ui": patch
---

Fix the RatingsCard Stale story fixture: the Stale story (Components/RatingsCard) is now state-wired like Default — activating a viewer star updates the displayed rating instead of doing nothing, and updating the rating clears the viewer's stale flag (the stale hint reads "Tap a star to update it for the current version"). The RatingsCard component itself is unchanged, and the story's initial rendering is identical. On a @spudly/ui bump, re-check the RatingsCard Stale story in Storybook: clicking or pressing Space on a star changes the "Your rating" value and the stale viewer hint disappears.
