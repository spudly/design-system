import type { Preview } from "@storybook/react";
import { TamaguiProvider } from "tamagui";
import { tamaguiConfig } from "../src/tamagui.config.js";

const preview: Preview = {
  decorators: [
    (Story) => (
      <TamaguiProvider config={tamaguiConfig}>
        <div style={{ padding: 24 }}>
          <Story />
        </div>
      </TamaguiProvider>
    ),
  ],
};

export default preview;
