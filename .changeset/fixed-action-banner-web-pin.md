---
"@spudly/ui": patch
---

FixedActionBanner (web): the banner now pins to the viewport edge with `position: fixed` instead of `position: absolute`, so a consent bar or install prompt stays at the top/bottom edge of the viewport at any scroll position instead of scrolling away with the document (or sitting a document-height away from the viewport's bottom edge). Native is unchanged: the banner still pins absolute inside its full-screen container. Also on web, a banner taller than the viewport is now capped at the viewport height and scrolls internally, so its action buttons stay reachable on short screens or at high zoom. On a @spudly/ui bump, re-check in Storybook: Components/FixedActionBanner's Default story shows the banner pinned to the bottom edge of the viewport, and hosts that wrapped the banner in their own fixed-position container (eciperay's consent bar) can drop the wrapper's positioning.
