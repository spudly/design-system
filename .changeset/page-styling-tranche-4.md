---
"@spudly/ui": patch
---

The shared recipe row no longer applies styling directly (#119 tranche 4, final tranche): its media-row composition now lives in the new MediaRow widget and its star-rating control in the new RatingStars widget; recipeRow is a domain adapter over them and BoundedList already owns the list styling. Rendering is unchanged.
