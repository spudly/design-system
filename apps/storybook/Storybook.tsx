import AsyncStorage from "@react-native-async-storage/async-storage";
import { view } from "./.rnstorybook/storybook.requires";

// Browse mode: the full on-device Storybook UI (story list, on-device
// addons). Capture mode lives in App.tsx and drives the same `view`
// with onDeviceUI disabled.
//
// Chromatic's React Native visual testing drives Storybook over
// WebSockets (design-system #302): the Chromatic CLI sets the
// STORYBOOK_* environment variables and their EXPO_PUBLIC_-prefixed
// equivalents when it builds the app, and the options below turn that
// into the websocket configuration Chromatic's docs require. When the
// variables are unset (ordinary local browsing) websockets stay off
// and the UI behaves exactly as before.
const StorybookUIRoot = view.getStorybookUI({
  enableWebsockets: process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === "true",
  host: process.env.EXPO_PUBLIC_STORYBOOK_WEBSOCKET_HOST || "localhost",
  port: parseInt(process.env.EXPO_PUBLIC_STORYBOOK_WEBSOCKET_PORT || "7007", 10),
  secured: process.env.EXPO_PUBLIC_STORYBOOK_WEBSOCKET_SECURED === "true",
  onDeviceUI: process.env.EXPO_PUBLIC_STORYBOOK_DISABLE_UI !== "true",
  shouldPersistSelection: true,
  storage: {
    getItem: (key: string) => AsyncStorage.getItem(key),
    setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  },
});

export { view };
export default StorybookUIRoot;
