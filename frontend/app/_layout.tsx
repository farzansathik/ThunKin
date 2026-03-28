import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useFonts } from "expo-font";
import { UserProvider } from "../context/UserContext";

// Set login as the initial route
export const unstable_settings = {
  initialRouteName: "login",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // LOAD FONTS HERE
  const [loaded] = useFonts({
    // Inter (English)
    "Inter-Regular": require("../assets/fonts/Inter/static/Inter_18pt-Regular.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter/static/Inter_18pt-Bold.ttf"),

    // Inria Sans
    "Inria-Regular": require("../assets/fonts/Inria_Sans/InriaSans-Regular.ttf"),
    "Inria-Bold": require("../assets/fonts/Inria_Sans/InriaSans-Bold.ttf"),

    // Thai (Noto Sans Thai)
    "NotoSansThai-Regular": require("../assets/fonts/Noto_Sans_Thai/static/NotoSansThai-Regular.ttf"),
    "NotoSansThai-Bold": require("../assets/fonts/Noto_Sans_Thai/static/NotoSansThai-Bold.ttf"),
    "NotoSansThai-Medium": require("../assets/fonts/Noto_Sans_Thai/static/NotoSansThai-Medium.ttf"),
    "NotoSansThai-SemiBold": require("../assets/fonts/Noto_Sans_Thai/static/NotoSansThai-SemiBold.ttf"),
  });

  if (!loaded) return null;


  return (
    <UserProvider>
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Everyone sees this first */}
        <Stack.Screen name="login" />

        {/* Main app area */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Vendor screen */}
        <Stack.Screen
          name="vendor"
          options={{ headerShown: false }} 
        />

        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
    </UserProvider>
  );
}