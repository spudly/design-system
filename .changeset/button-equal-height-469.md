---
"@spudly/ui": patch
---

Button: labeled, icon+label, and icon-only buttons of the same size now render at the same height (44/48/56px for sm/md/lg). Previously the labeled form sized from its content while the icon-only form was pinned to its touch-target box, so the two side by side in the Button/Icon Disabled stories had different heights.
