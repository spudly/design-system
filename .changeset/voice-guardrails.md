---
"@spudly/ui": patch
---

Voice system guardrails (#539 tranche 4, final tranche): the en-XA pseudo-locale fixture is now exercised by a rendering test — representative surfaces (LegalDocumentPage, RatingsCard) rendered under the pseudo-locale voice must show every voice-supplied string transformed, with none left in plain en-US — and a repo-local no-new-literals check inventories the hard-coded copy that remains in pages/views/widgets and fails if a new JSX or copy-attribute literal lands without a deliberate baseline update. Test: render the named surfaces under the en-XA fixture voice and confirm all shared strings carry the pseudo-locale markers; add a hard-coded string to a page and confirm the guardrail test fails.
