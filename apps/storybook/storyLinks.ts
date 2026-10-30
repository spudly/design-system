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
// - Scheme-less app paths are rewritten to the host's browse URL
//   with the original path attached (<browse>?path=<original>).
//   Opening that URL delivers it back to the host's link
//   listener, which stays in browse mode and logs the pressed
//   path (see App.tsx) — the press lands somewhere sane instead
//   of rejecting, and the path is visible in the device log.
//
// The browse URL is supplied by the host (App.tsx) rather than
// hardcoded here, because the reachable form depends on how the
// host was started: expo-linking's createURL("browse") yields
// `spudlyds://browse` in a native build (the scheme app.json
// registers), but `exp://<metro-host>/--/browse` under
// `expo start` in Expo Go, which registers no custom scheme — a
// spudlyds: URL there has no handler and would reject like the
// original href did. This module stays import-free so the
// routing logic is directly unit-testable; the host passes its
// environment-aware browse URL in.

// An RFC 3986 scheme — ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
// followed by ":". Anything without one is an app-style path.
const SCHEME_PATTERN = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

/**
 * Resolve an href pressed inside a story to the URL the platform
 * should actually open: scheme-bearing URLs unchanged, app-style
 * paths routed to the host's browse URL with the original path
 * preserved as a query parameter.
 */
export function resolveStoryLink(url: string, browseUrl: string): string {
  if (SCHEME_PATTERN.test(url)) return url;
  const separator = browseUrl.includes("?") ? "&" : "?";
  return `${browseUrl}${separator}path=${encodeURIComponent(url)}`;
}

export type OpenURL = (url: string) => Promise<void>;

/**
 * Wrap a Linking.openURL implementation with resolveStoryLink.
 * Pass-through URLs keep the original function's exact behavior
 * (including rejections — e.g. a mailto: with no mail app fails
 * the same way it does in a real app). A rewritten URL is the
 * host's own browse URL and so cannot be unopenable in
 * principle; a rejection is absorbed anyway, because a story
 * link press must never surface as an unhandled promise
 * rejection in the host.
 */
export function createStoryLinkOpenURL(openURL: OpenURL, browseUrl: string): OpenURL {
  return (url: string) => {
    const resolved = resolveStoryLink(url, browseUrl);
    if (resolved === url) return openURL(url);
    return openURL(resolved).catch(() => {
      console.log(`DS LINK unresolved ${url}`);
    });
  };
}
