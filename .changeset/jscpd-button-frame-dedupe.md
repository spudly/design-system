---
"@spudly/ui": patch
---

Internal refactor with no visual or behavior change: Button's link and button forms now build their shared frame treatment (label color, loading inertness, danger fill, the secondary border that follows the label color, and the skeleton fill) through one internal buttonFrameTreatment helper instead of two identical copies, so both forms keep rendering exactly as before and cannot drift apart.
