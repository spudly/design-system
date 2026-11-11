import type { StorybookConfig } from "@storybook/react-native";

const main: StorybookConfig = {
  // The react-native storybook (one of the repo's two storybooks,
  // #122): the same CSF files the react storybook renders (../../src),
  // so the on-device suite can never drift from the web suite. Stories
  // are platform-neutral (Tamagui views only — see
  // docs/android-visual-regression.md).
  stories: ["../../../src/**/*.stories.@(ts|tsx)"],
  // Required by Storybook Core when it loads this config server-side:
  // Chromatic's RN publish step generates the story manifest via Core's
  // loadStorybook, which fails with MissingFrameworkFieldError
  // ("Could not find a 'framework' field in Storybook config") without
  // it — main run 42956366058 on a5452ec, build 2, is the evidence.
  // The field is part of @storybook/react-native's own StorybookConfig
  // type (framework?: '@storybook/react-native'); the on-device runtime
  // ignores it.
  framework: "@storybook/react-native",
  deviceAddons: [
    "@storybook/addon-ondevice-controls",
    "@storybook/addon-ondevice-actions",
    "@storybook/addon-ondevice-backgrounds",
    "@storybook/addon-ondevice-notes",
  ],
};

export default main;
