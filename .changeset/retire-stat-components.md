---
"@spudly/ui": major
---

Retire StatBand, StatCard, and StatRow in favor of the metadata badge. The three stat-tile components (and their shared loading tiles) are removed from the public surface: recipe metadata now renders through MetadataBadge — the overview panel composes its servings / prep / cook values as badge parts, the recipe detail page drops its duplicate stat band (the overview badge already carries the same values), and the Memorize progress story renders each progress stat as a metadata badge. Loading states skeletonize the badge's slot as a single pill bone.
