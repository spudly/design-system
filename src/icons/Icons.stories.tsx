import type { Meta, StoryObj } from "@storybook/react";
import { XStack, YStack } from "tamagui";
import { Text } from "../components/Text.js";
import { AddIcon } from "./AddIcon.js";
import { FeedbackIcon } from "./FeedbackIcon.js";
import { HomeIcon } from "./HomeIcon.js";
import { Icon, type IconElement } from "./Icon.js";
import { MealsIcon } from "./MealsIcon.js";
import { PrintIcon } from "./PrintIcon.js";
import { ProfileIcon } from "./ProfileIcon.js";
import { RecipesIcon } from "./RecipesIcon.js";
import { ShareIcon } from "./ShareIcon.js";
import { SharedIcon } from "./SharedIcon.js";
import { TagsIcon } from "./TagsIcon.js";
import { WarningIcon } from "./WarningIcon.js";

const meta: Meta<typeof Icon> = {
  title: "Components/Icons",
  component: Icon,
  argTypes: {
    size: { control: "number" },
    color: { control: "color" },
    strokeWidth: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

// Sample glyph data for exercising the base renderer directly: the
// official Feather home elements. Callers normally use the per-icon
// components (HomeIcon and friends below), which supply their own.
const sampleElements: IconElement[] = [
  { kind: "path", d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { kind: "polyline", points: "9 22 9 12 15 12 15 22" },
];

export const Default: Story = {
  args: { elements: sampleElements, size: 24, color: "#333333" },
};

export const Large: Story = {
  args: { elements: sampleElements, size: 48, color: "#333333" },
};

const galleryIcons = [
  { name: "AddIcon", Icon: AddIcon },
  { name: "FeedbackIcon", Icon: FeedbackIcon },
  { name: "HomeIcon", Icon: HomeIcon },
  { name: "MealsIcon", Icon: MealsIcon },
  { name: "PrintIcon", Icon: PrintIcon },
  { name: "ProfileIcon", Icon: ProfileIcon },
  { name: "RecipesIcon", Icon: RecipesIcon },
  { name: "ShareIcon", Icon: ShareIcon },
  { name: "SharedIcon", Icon: SharedIcon },
  { name: "TagsIcon", Icon: TagsIcon },
  { name: "WarningIcon", Icon: WarningIcon },
];

/** Every icon component in the module, at Feather's native 24px. */
export const AllIcons: Story = {
  render: () => (
    <XStack flexWrap="wrap" gap={16} maxWidth={520}>
      {galleryIcons.map(({ name, Icon: Glyph }) => (
        <YStack key={name} alignItems="center" gap={4} width={110}>
          <Glyph size={24} color="#333333" />
          <Text variant="hint">{name}</Text>
        </YStack>
      ))}
    </XStack>
  ),
};
