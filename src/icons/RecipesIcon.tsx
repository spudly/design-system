import { Icon, type IconComponentProps, type IconElement } from "./Icon.js";

/**
 * The official Feather book-open element data (feathericons/feather,
 * MIT licensed) — copied from the Feather SVG source, not redrawn.
 */
const recipesElements: IconElement[] = [
  { kind: "path", d: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" },
  { kind: "path", d: "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" },
];

/** The book-open glyph: recipes and other reading content. Rendered through the Icon base component. */
export function RecipesIcon(props: IconComponentProps) {
  return <Icon elements={recipesElements} {...props} />;
}
