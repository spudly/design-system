// Story link routing for the on-device Storybook host (#300).
//
// The problem: stories pass web-style app hrefs ("/recipes/...",
// "/meal-plans/...") to the DS href-form components, exactly as a
// real app supplies them. On native, Tamagui's Anchor forwards the
// href verbatim to React Native's Linking.openURL, and a
// scheme-less URL has no handler there — openURL rejects ("Unable
// to open URL") and the press does nothing. Real native apps pass
// scheme-bearing URLs, so the component contract (href forwarded
// verbatim; hosts compose scheme-bearing URLs on native) is
// correct and documented on the components themselves. The dead
// end is an artifact of browsing app-shaped stories inside this
// host, so the fix lives in the host — not in the components, and
// not in the stories (the root-relative convention is suite-wide
// across fixtures and story literals, and hrefs also reach
// components through view-model props and href factories, which no
// literal edit could cover).
//
// The seam: App.tsx wraps Linking.openURL with
// createStoryLinkOpenURL below. Every href press in every story
// funnels through that one platform call, so the wrap covers the
// whole suite — present and future stories alike — with no
// per-story platform mapping. Web Storybook never loads this
// module, and no component's public contract changes.
//
// Behavior of the wrap:
// - Scheme-bearing URLs (https:, mailto:, tel:, and this host's
//   own spudlyds: capture/browse links) pass through untouched,
//   with their original promise semantics.
// - Scheme-less app paths are rewritten to the host's browse
//   scheme with the original path attached
//   (spudlyds://browse?path=<original>). Opening the app's own
//   registered scheme delivers the URL back to the host's link
//   listener, which stays in browse mode and logs the pressed
//   path (see App.tsx) — the press lands somewhere sane instead
//   of rejecting, and the path is visible in the device log.

const BROWSE_URL = "spudlyds://browse";

// An RFC 3986 scheme — ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
// followed by ":". Anything without one is an app-style path.
const SCHEME_PATTERN = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

/**
 * Resolve an href pressed inside a story to the URL the platform
 * should actually open: scheme-bearing URLs unchanged, app-style
 * paths routed to this host's browse scheme with the original
 * path preserved as a query parameter.
 */
export function resolveStoryLink(url: string): string {
  if (SCHEME_PATTERN.test(url)) return url;
  return `${BROWSE_URL}?path=${encodeURIComponent(url)}`;
}

export type OpenURL = (url: string) => Promise<void>;

/**
 * Wrap a Linking.openURL implementation with resolveStoryLink.
 * Pass-through URLs keep the original function's exact behavior
 * (including rejections — e.g. a mailto: with no mail app fails
 * the same way it does in a real app). A rewritten URL is this
 * host's own registered scheme and so cannot be unopenable in
 * principle; a rejection is absorbed anyway, because a story link
 * press must never surface as an unhandled promise rejection in
 * the host.
 */
export function createStoryLinkOpenURL(openURL: OpenURL): OpenURL {
  return (url: string) => {
    const resolved = resolveStoryLink(url);
    if (resolved === url) return openURL(url);
    return openURL(resolved).catch(() => {
      console.log(`DS LINK unresolved ${url}`);
    });
  };
}
