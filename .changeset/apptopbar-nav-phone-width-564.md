---
"@spudly/ui": patch
---

AppTopBar: the nav no longer overflows phone-width viewports (#564). The nav list is now shrinkable within the bar (flexShrink with minWidth 0 alongside its existing wrap), so with a 6-item icon+label nav (Home/Recipes/Meals/Add/Tags/Profile) the top bar fits 390px and 430px viewports with no horizontal page overflow and every nav link — Profile included — fully visible and reachable; the nav wraps onto additional rows inside the bar at narrow widths. Desktop layout is unchanged. Test: open the AppTopBar PhoneWidthNav story (390px frame) and confirm all six links render fully inside the frame; open Default and confirm the desktop single-row treatment is unchanged.
