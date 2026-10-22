/**
 * Page components (#49): full-page, props-controlled views for the
 * apps' screens. Exported from the `@spudly/ui/pages` subpath, not
 * the package root — page components may import react-native (e.g.
 * FlatList), and the root entry must stay importable in plain Node.
 */
export { RecipesPage, type RecipesPageItem, type RecipesPageProps } from "./RecipesPage.js";
