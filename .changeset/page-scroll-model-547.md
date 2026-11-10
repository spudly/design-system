---
"@spudly/ui": minor
---

Page scroll model (#547): pages now scroll as a whole page — on web the document scrolls and the footer sits after the content (pushed to the bottom on short pages), with no nested inner scroller; on native the big footer no longer renders (native uses bottom navigation) and native scrolling is owned explicitly per page through the shell's scroll mode — the shell's single scroller for plain pages (with or without footer data), the page's own windowed list or scroll region for list and self-scrolling pages, or an enclosing shell for nested pages. Recipes and Discover are now one page component: the public catalog renders through RecipesPage's public variant (DiscoverPage remains as a compatibility wrapper), and on web both catalogs render their full list in page flow with scroll-driven loading of further pages instead of a windowed list; native keeps its windowed list.
