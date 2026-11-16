---
"@spudly/ui": patch
---

Skeleton loading states now render reproducibly in Android visual-regression captures: capture mode freezes the shared skeleton pulse at its static mid-opacity (0.72) before stories mount, instead of leaving each capture at whatever phase the JS-driven pulse happened to be in. Shipped rendering is unchanged — the freeze applies only inside the Storybook capture harness. Test it by capturing a loading page story (e.g. HomePage Loading) twice through the capture-compare flow: the two captures now match pixel-for-pixel, and a merge-verify re-compare against a regenerated baseline passes.
