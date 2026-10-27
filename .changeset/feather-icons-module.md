---
"@spudly/ui": minor
---

New icons module (`@spudly/ui/icons`): an `Icon` base renderer plus eleven individually exported icon components under semantic usage names — AddIcon, FeedbackIcon, HomeIcon, MealsIcon, PrintIcon, ProfileIcon, RecipesIcon, ShareIcon, SharedIcon, TagsIcon, and WarningIcon. Each component renders the official Feather SVG data for its glyph (home, message-circle, book-open, coffee, printer, user, share-2, users, tag, alert-triangle, and plus respectively) with react-native-svg, at a caller-chosen size and stroke color with Feather's 2px round-cap stroke treatment, identically on web and native. Each icon is its own module, so apps bundle only the icons they import. There is no name-based icon API and no tab-to-icon mapping in the module: icons are imported by their semantic component names, and app-specific mappings (such as a tab bar's) live in the consuming app.
