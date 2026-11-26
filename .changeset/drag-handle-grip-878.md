---
"@spudly/ui": minor
---

Recipe ingredient and instruction lists now render a design-system drag-handle grip by default (#878): when a host does not supply its own drag handle through `renderDragHandle`, each row shows the new DragHandleView grip (a six-dot grip icon, accessible name "Drag to reorder"), so hosts keep only the drag behavior and no longer render the handle visual themselves. A host-supplied `renderDragHandle` still wins exactly as before, replacing the DS grip on every row. Verify after adopting: a recipe form's ingredient and instruction rows show the six-dot grip when the host binds no handle, and show the host's own handle — with no DS grip — when the host binds one.
