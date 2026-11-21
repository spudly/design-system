---
"@spudly/ui": patch
---

Badge: the colored-tag (`color`) and status-pill (`tone`) forms now render through one `StyledBadge` — each form computes only its own background, border, and label colors into variables, and the pill structure and label typography exist exactly once (#707). No behavior or visual change; the Badge contracts (#174, #211) keep their behavior, and their source-scan pins were updated to the variable computations.
