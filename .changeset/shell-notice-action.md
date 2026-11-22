---
"@spudly/ui": minor
---

Shell notice and route-error action: AppShellPage and TabbedShellPage now accept an optional `notice` — a message, plus an optional action with a label and a press callback — rendered above the page content and announced to assistive tech, while the content stays visible underneath; a shell given no notice renders exactly as before. RouteErrorPage now accepts an optional `action` — a label and a press callback — rendered as a button beside the home link, so a host can offer "Try again" on a failed route without building its own error panel. Verify after adopting: a shell supplied with a notice shows the message (and its action button, when one is supplied) above the content, and a route error page supplied with an action shows that button beside the home link.
