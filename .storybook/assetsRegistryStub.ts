/**
 * Web stub for `@react-native/assets-registry/registry`.
 *
 * react-native-svg's web build imports `getAssetByID` from that
 * package to resolve local image assets for its SvgUri / Image
 * features. The package is not part of this repo's dependency tree
 * (react-native 0.88 no longer hoists it), so Rolldown cannot resolve
 * the import and fails the whole Storybook build. No DS component
 * uses svg image-asset resolution (the icons module renders static
 * shapes), so the web build aliases the import to this stub, whose
 * getAssetByID resolves nothing. Native builds use the real package
 * from the apps' trees.
 */
export function getAssetByID(): undefined {
  return undefined;
}
