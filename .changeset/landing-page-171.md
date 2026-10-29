---
"@spudly/ui": minor
---

New LandingPage (Eciperay): the signed-out marketing landing page view — a centered hero (title + subtitle), three calls to action rendered as real links from the `{label, href}` props the host passes in (Discover, Sign up free, Get the mobile app), and three feature cards whose content arrives as fixed slots (featureOne / featureTwo / featureThree), each a title + one-line description. All copy and hrefs are host-supplied props; the page bakes in no app copy, and the CTAs are anchors, not buttons — they navigate. On a @spudly/ui bump, re-check in Storybook: Pages/Eciperay/LandingPage shows the hero and the three feature cards, and its three CTAs point at /discover, /signup, and the mobile app install URL.
