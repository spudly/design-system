---
"@spudly/ui": minor
---

Page scroll model (#547): pages now scroll as a whole page — on web the document scrolls and the footer sits after the content (pushed to the bottom on short pages), with no nested inner scroller; on native a single shell scroller wraps the page and the big footer no longer renders (native uses bottom navigation). Recipes and Discover are now one page component: the public catalog renders through RecipesPage's public variant (DiscoverPage remains as a compatibility wrapper), and on web both catalogs render their full list in page flow with scroll-driven loading of further pages instead of a windowed list; native keeps its windowed list.
