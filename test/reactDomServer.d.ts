/**
 * react-dom ships no bundled types and @types/react-dom is not a
 * dependency of this repo, so the SSR renderer the contract tests
 * use is declared untyped here; the tests assert on the markup
 * string it returns, which needs no typed surface.
 */
declare module "react-dom/server";
