import { Image as TamaguiImage, YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Text } from "./Text.js";

const StyledImage = styled(TamaguiImage, {
  name: "AvatarImage",

  borderRadius: tokens.radii.full,
});

const Fallback = styled(YStack, {
  name: "AvatarFallback",

  backgroundColor: "$primarySubtle",
  borderRadius: tokens.radii.full,
  alignItems: "center",
  justifyContent: "center",
});

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
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return `${words[0]![0]}${words[words.length - 1]![0]}`.toUpperCase();
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
      <Fallback
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
      </Fallback>
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
