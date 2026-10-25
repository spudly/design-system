import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View, YStack } from "tamagui";
import { Text } from "../components/Text.js";
import { homeFixture } from "./fixtures.js";
import { HomePage } from "./HomePage.js";

const meta: Meta<typeof HomePage> = {
  title: "Pages/Eciperay/HomePage",
  component: HomePage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof HomePage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

/**
 * Rows cross through the renderRecipeRow slot — hosts render
 * their row component per recipe. The story's stand-in is a
 * simple title row in the row's shape.
 */
export const WithRecipes: Story = {
  render: () => (
    <Viewport>
      <HomePage
        {...homeFixture}
        renderRecipeRow={(recipe) => (
          <YStack marginBottom="$3" borderRadius="$3" backgroundColor="$surface" padding="$3">
            <Text>{recipe.id === "tuscan-chicken" ? "Tuscan Chicken" : "Fudgy Brownies"}</Text>
          </YStack>
        )}
        onBrowsePress={() => undefined}
        onAddPress={() => undefined}
        onSharedWithMePress={() => undefined}
      />
    </Viewport>
  ),
};

export const Empty: Story = {
  render: () => (
    <Viewport>
      <HomePage
        {...homeFixture}
        recipes={[]}
        renderRecipeRow={() => null}
        onBrowsePress={() => undefined}
        onAddPress={() => undefined}
        onSharedWithMePress={() => undefined}
      />
    </Viewport>
  ),
};

export const Loading: Story = {
  render: () => (
    <Viewport>
      <HomePage
        {...homeFixture}
        recipes={[]}
        isLoading
        renderRecipeRow={() => null}
        onBrowsePress={() => undefined}
        onAddPress={() => undefined}
        onSharedWithMePress={() => undefined}
      />
    </Viewport>
  ),
};
