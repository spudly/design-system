import type { ReactNode } from "react";
import { MediaRow } from "../../widgets/data/MediaRow.js";
import { RatingStars } from "../../widgets/form/RatingStars.js";

/**
 * The shared recipe row (#657): the row composition RecipesPage's
 * own section and HomePage's recently-viewed list both render —
 * one internal module, never exported from the package (the
 * pages-only rule, #298: consumers consume pages, never the row
 * directly). Extracted from RecipesPage, where it lived as the
 * page-local MediaRow / RatingStars compositions, when HomePage
 * became its second consumer; rendering is unchanged.
 *
 * The compositions themselves live in src/widgets since the #119
 * tranche-4 extraction: MediaRow and RatingStars own all of the
 * row's styling (Tamagui, inline styles, star glyphs), and this
 * module is the domain adapter — it maps a RecipeRowItem onto
 * MediaRow's semantic props and wires the log-cook control.
 */

/** One own-section recipe row's view-model. The app formats
 * `subtitle` (its list meta line — servings · time ·
 * rating/satiety); the view only renders it. Own-section items
 * are the user's created recipes and the recipes shared with
 * them, in the caller's order (preferred placement is the
 * section's, ordering inside it is the caller's). */
export type RecipeRowItem = {
  id: string;
  /** The recipe's destination (#248's navigation rule: the row
   * navigates, so it is a link): the host composes it from the
   * recipe id — for a shared-with-me recipe, the recipe's
   * permalink. Both of the row's targets (thumbnail and text
   * block) render as links carrying this href. */
  href: string;
  title: string;
  subtitle?: string;
  /** Display rating, 0–5, or null/absent when the recipe is
   * unrated. The app computes it by its display-rating rule
   * (the owner's star rating, else the community average); the
   * view renders it as the row's log-cook control — a rated
   * recipe's stars are the control, an unrated recipe gets an
   * icon-only button — and never formats it into the subtitle,
   * so an app that passes `rating` keeps the rating text out
   * of `subtitle`. */
  rating?: number | null;
  imageUrl?: string | null;
  /** Caller-supplied marker distinguishing this item inside the
   * own section — the shared-with-me badge (#415): the host
   * passes its shared label (e.g. "Shared with you") for
   * recipes someone shared with the user and omits it for
   * recipes the user created. The view renders it as a badge
   * on the row and folds it into the row's accessible name; it
   * never invents the copy or decides which items earn it. */
  badgeLabel?: string;
  /** Whether the user may log a cook for this item. The host
   * sets it `false` for rows the user cannot log cooks for —
   * shared-with-me rows (cook logs are owner-only in the host)
   * — and the row then renders no log-cook control at all; the
   * row stays a link with its badge and accessory behavior
   * unchanged. Absent or `true` keeps the control, exactly as
   * before. This is a capability the host computes, deliberately
   * NOT inferred from `badgeLabel`: the badge is a display
   * marker, and a badged-but-cookable row must stay expressible. */
  canLogCook?: boolean;
};

type RecipeRowProps = {
  item: RecipeRowItem;
  /** Log-cook callback (the RecipesPage semantics): absent, or
   * the item's `canLogCook` false, renders no log-cook control;
   * an accessory also suppresses it (the accessory owns the
   * row's action surface). */
  onLogCookPress?: ((recipeId: string) => void) | undefined;
  accessory?: ReactNode;
};

/**
 * One recipe row: a link to the item's href carrying the shared
 * MediaRow composition, with the RatingStars log-cook control as
 * its subtitle action — pressable stars on a rated recipe, a
 * single icon-only star button on an unrated one. No Delete
 * control and no "Log cook" text button exist in the row
 * (Stephen's 2026-10-24 ruling).
 */
export function RecipeRow({ item, onLogCookPress, accessory }: RecipeRowProps) {
  const hasAccessory = accessory !== null && accessory !== undefined;
  return (
    <MediaRow
      href={item.href}
      title={item.title}
      subtitle={item.subtitle}
      badgeLabel={item.badgeLabel}
      imageUrl={item.imageUrl}
      subtitleAction={
        onLogCookPress && !hasAccessory && item.canLogCook !== false ? (
          <RatingStars
            rating={item.rating}
            accessibilityLabel={
              item.rating !== null && item.rating !== undefined && item.rating > 0
                ? `Log a cook of ${item.title}, rated ${item.rating} out of 5 stars`
                : `Log a cook of ${item.title}`
            }
            onPress={() => {
              onLogCookPress(item.id);
            }}
          />
        ) : undefined
      }
      accessory={hasAccessory ? accessory : undefined}
    />
  );
}
