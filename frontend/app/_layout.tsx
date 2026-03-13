import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

// Set login as the initial route
export const unstable_settings = {
  initialRouteName: "login",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Everyone sees this first */}
        <Stack.Screen name="login" />

        {/* Main app area */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* You can add a specific Vendor path here later */}
        <Stack.Screen
          name="vendor"
          options={{ title: "Vendor Portal", headerShown: true }}
        />

        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
