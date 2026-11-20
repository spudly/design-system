---
"@spudly/ui": patch
---

Badge: the colored-tag (`color`) and status-pill (`tone`) forms now share a single render — the three unselected color values (background, border, label) are computed first and one `<StyledBadge>` renders both forms (#707). No behavior or visual change.
