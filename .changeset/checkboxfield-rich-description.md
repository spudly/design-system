---
"@spudly/ui": minor
---

CheckboxField: the `description` prop now accepts rich text content (`ReactNode`) — a consent line can mix plain text with an inline link (e.g. a Privacy Policy TextLink) and still render in the hint style — and the field accepts `children`, rendered as slotted content below the field inside its layout stack (e.g. an environment warning under the description). Plain-string descriptions render exactly as before. This closes the two gaps that kept the eciperay app-side CheckboxField adapter alive (#157).
