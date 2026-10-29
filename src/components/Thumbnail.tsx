import { Image, YStack, styled } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";

/**
 * The hero frame: a recessed gray well the feature image sits in —
 * page-background gray fill, large radius, fixed 256px height,
 * overflow hidden so the image's corners follow the frame.
 */
const StyledHeroFrame = styled(YStack, {
  name: "ThumbnailHeroFrame",

  backgroundColor: tokens.colors.gray.gray1,
  borderRadius: tokens.radii.lg,
  height: 256,
  overflow: "hidden",
  width: "100%",
});

const StyledBannerImage = styled(Image, {
  name: "ThumbnailBanner",

  width: "100%",
  height: 192,
  objectFit: "cover",
  borderRadius: tokens.radii.lg,
});

const StyledRowImage = styled(Image, {
  name: "ThumbnailRow",

  width: "$16",
  height: "$16",
  objectFit: "cover",
  borderRadius: tokens.radii.md,
  backgroundColor: tokens.colors.gray.gray1,
});

export type ThumbnailProps = {
  /** The image URL. */
  src: string;
  /**
   * The image's presentation: `hero` (default — the detail page's
   * feature image, contained in its 256px recessed frame), `banner`
   * (a full-width 192px cover image with large rounded corners, the
   * import/review preview), or `row` (the 64px square list-row
   * thumbnail, cover-cropped with a gray well behind it).
   */
  variant?: "hero" | "banner" | "row";
  /**
   * Accessible name for the image. When given, the image is exposed
   * as an image with this name (the import review names its preview
   * this way); without it no accessibility props are set and the
   * image renders as the raw element does (list rows name their
   * press target from the row's title instead).
   */
  accessibilityLabel?: string;
};

/**
 * A content image with its presentation owned by the design system:
 * the three shapes the pages used to hand-style out of the raw
 * Image element — the recipe detail/public pages' hero, the import
 * review's banner preview, and the recipe list's row thumbnail
 * (RecipesPage's in-page `Thumbnail` helper, generalized). Extracted
 * as a shared component for the #119 page de-styling program: the
 * caller supplies only the image URL (and an accessible name where
 * the image carries meaning), so the component serves any app's
 * imagery.
 */
export function Thumbnail({ src, variant = "hero", accessibilityLabel }: ThumbnailProps) {
  // A named image is exposed as an image with that name, routed
  // through the accessibility translator (Avatar's pattern, #235):
  // the RN `image` role and label become `role="img"` and
  // `aria-label` on web instead of leaking as raw attributes.
  const a11yProps = accessibilityLabel
    ? platformAccessibilityProps({ accessibilityRole: "image", accessibilityLabel })
    : {};
  if (variant === "banner") {
    return <StyledBannerImage src={src} {...a11yProps} />;
  }
  if (variant === "row") {
    return <StyledRowImage src={src} {...a11yProps} />;
  }
  return (
    <StyledHeroFrame>
      <Image src={src} width="100%" height="100%" objectFit="contain" {...a11yProps} />
    </StyledHeroFrame>
  );
}
