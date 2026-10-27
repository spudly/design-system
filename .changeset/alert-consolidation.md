---
"@spudly/ui": minor
---

Consolidate InlineAlert and DismissibleBanner into a single `Alert` component: `Alert` covers all four severities (info, success, warning, error), accepts a `message` string or rich `children`, optional action buttons, and a `dismissible` prop (with `onDismiss`) that toggles the dismiss button. The `InlineAlert`, `DismissibleBanner`, `InlineAlertProps`, `DismissibleBannerProps`, and `BannerAction` exports are removed — use `Alert`, `AlertProps`, and `AlertAction` instead. Every in-repo page and panel that rendered InlineAlert (AccessTokensPanel, FixedActionBanner, EditVersionPage, MemorizationSessionPage, MemorizeSettingsPage, RecipeFormPage, VerseSearchPage) now renders Alert with identical styling and announcements. On a @spudly/ui bump, re-test inline messages and banners on those pages and anywhere an app renders InlineAlert or DismissibleBanner today.
