import AsyncStorage from "@react-native-async-storage/async-storage";
import { view } from "./.rnstorybook/storybook.requires";

// Browse mode: the full on-device Storybook UI (story list, on-device
// addons). Capture mode lives in App.tsx and drives the same `view`
// with onDeviceUI disabled.
const StorybookUIRoot = view.getStorybookUI({
  shouldPersistSelection: true,
  storage: {
    getItem: (key: string) => AsyncStorage.getItem(key),
    setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  },
});

export { view };
export default StorybookUIRoot;
