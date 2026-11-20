---
"@spudly/ui": patch
---

Badge: the colored-tag (`color`) and status-pill (`tone`) forms now delegate to one shared internal render (`BadgeShell`) — each form passes only its own background, border, and label colors, and the pill structure and label typography exist exactly once (#707). No behavior or visual change; the existing source-pinned Badge contracts (#174, #211) are preserved verbatim.
