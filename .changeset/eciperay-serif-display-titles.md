---
"@spudly/ui": minor
---

Eciperay page and recipe titles now render in the design brief's serif display type. Themes gain a `display` typography role, resolved through a registered Tamagui `display` font: the base role mirrors the UI sans stack, and the Warm Harvest (Eciperay) theme overrides it to the existing Georgia serif stack, so the title-bearing Text variants (`heading`, `title`, `formTitle`, `subheading`, `display`) — and Tamagui's `heading` font — render serif under Eciperay and keep the UI sans under every other theme (Memorize titles are unchanged and do not take the verse role's Alegreya). Verify after adopting: under the Eciperay theme, page titles on the recipes, recipe detail, landing, home, meal-plan, profile, and recipe-form pages render in Georgia serif while body text stays Raleway; under the Memorize theme, all titles still render in the UI sans.
