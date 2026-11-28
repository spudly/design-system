import { Image as TamaguiImage, styled } from "tamagui";
import type { GetProps } from "tamagui";

import { Col } from "../layout/Col.js";
import type { ColProps } from "../layout/Col.js";
import { tokens } from "../../tokens/index.js";
import { platformAccessibilityProps } from "../accessibility.js";

import { Text } from "./Text.js";

const StyledImage = styled(TamaguiImage, {
  name: "AvatarImage",

  borderRadius: tokens.radii.full,
});

/**
 * The initials fallback disc (#746, Option B): a Col carrying
 * the primary tint, ring, and circular radius, centering the
 * initials.
 */
function AvatarFallback(props: ColProps) {
  return (
    <Col
      center
      middle
      backgroundColor="$primarySubtle"
      borderWidth={1}
      borderColor="$primaryEmphasis"
      borderRadius={tokens.radii.full}
      {...props}
    />
  );
}

type StyledImageProps = GetProps<typeof StyledImage>;

export type AvatarProps = Omit<StyledImageProps, "source"> & {
  src?: string;
  /** Full name; used for the accessibility label and the initials fallback. */
  name: string;
  size?: number;
};

function initialsFor(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = words[0] ?? "";
  if (words.length === 1) return first.slice(0, 2).toUpperCase();
  const last = words.at(-1) ?? "";
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

/**
 * User avatar: image when `src` is provided, otherwise the person's initials
 * (first letters of the first and last name words) on a primary-tinted
 * circle. Exposed as an image with the name as its accessible label.
 * (`accessibilityRole="image"`, React Native's role name — the web ARIA
 * spelling `img` is invalid there and crashes Android, spudly/eciperay#156;
 * `platformAccessibilityProps` maps `image` back to the `img` role and
 * the label to `aria-label` on web, #235.)
 */
export function Avatar({ src, name, size = 40, ...rest }: AvatarProps) {
  const dimensions = { width: size, height: size };
  if (!src) {
    return (
      <AvatarFallback
        style={dimensions}
        {...platformAccessibilityProps({
          accessibilityRole: "image",
          accessibilityLabel: name,
        })}
      >
        <Text
          style={{
            color: "$primaryEmphasis",
            fontWeight: tokens.typography.fontWeight.semibold,
            fontSize: Math.round(size * 0.4),
          }}
        >
          {initialsFor(name)}
        </Text>
      </AvatarFallback>
    );
  }
  return (
    <StyledImage
      // Tamagui's Image renders an <img> on web and maps `src` (not the
      // React Native-style `source` object, which web ignores) to the
      // image URL; on native it converts the string to `{ uri }`.
      src={src}
      objectFit="cover"
      style={dimensions}
      {...platformAccessibilityProps({
        accessibilityRole: "image",
        accessibilityLabel: name,
      })}
      {...rest}
    />
  );
}
