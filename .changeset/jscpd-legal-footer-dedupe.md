---
"@spudly/ui": patch
---

Internal refactor with no visual or behavior change: the Privacy Policy and Terms legal-page fixtures now share a single footer fixture object instead of two identical copies, so both legal pages' stories keep rendering the exact same footer as before.
