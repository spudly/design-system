---
"@spudly/ui": patch
---

Internal test layout only: manual test steps now live beside the component they cover as `<Base>.test.steps.md` files, with `docs/manual-tests.md` regenerated as an index of them. Story-only changes: the auth page/form stories, CardRow (Default/WithAction), and ListRow (Prefixed) stories gained observable readouts (submission / press counts) so the manual steps can verify guarded repeat submissions and press behavior. No component, page, or API changes; nothing user-visible to test beyond the steps themselves.
