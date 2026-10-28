## Summary

<!-- One or two sentences: what does this PR do? -->

## What changed and why

<!-- The changes and the motivation. Link the issue this addresses. -->

## Pre-merge checklist

All boxes must be checked (or struck through with a one-line reason)
before this PR is merged.

- [ ] CI is green for the exact head commit
- [ ] Review feedback addressed (Copilot and/or human)
- [ ] Manual Storybook QA pass posted for this head SHA (changed
      components/pages only), or exempt (no component/page/story changes)
- [ ] No new console or CI warnings introduced — or a GitHub issue filed
      for each new one
- [ ] Changeset added, or not required (docs/CI/test-only) — and for
      user-visible changes, the changeset description describes the
      feature change in testable, user-visible terms (consuming apps
      test from these descriptions)
- [ ] Stories updated for component/page changes, or not applicable
- [ ] `visual-check` label added for this PR's one Chromatic snapshot
      run before merge-ready, or no visual changes
