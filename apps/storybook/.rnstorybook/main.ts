import type { StorybookConfig } from "@storybook/react-native";

const main: StorybookConfig = {
  // The react-native storybook (one of the repo's two storybooks,
  // #122): the same CSF files the react storybook renders (../../src),
  // so the on-device suite can never drift from the web suite. Stories
  // are platform-neutral (Tamagui views only — see
  // docs/android-visual-regression.md).
  stories: ["../../../src/**/*.stories.@(ts|tsx)"],
  deviceAddons: [
    "@storybook/addon-ondevice-controls",
    "@storybook/addon-ondevice-actions",
    "@storybook/addon-ondevice-backgrounds",
    "@storybook/addon-ondevice-notes",
  ],
};

export default main;
