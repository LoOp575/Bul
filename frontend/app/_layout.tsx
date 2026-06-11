import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { useIconFonts } from "@/src/hooks/use-icon-fonts";

// Keep the native splash visible from cold start until icon fonts register.
// Required because @expo/vector-icons' componentDidMount fallback fires
// Font.loadAsync against a broken vendor path if any <Icon> mounts before
// the family is registered — which throws on Android Expo Go.
SplashScreen.preventAutoHideAsync();

// Brand fonts from fontsource CDN (no Google Fonts API)
const FONT_CDN = "https://cdn.jsdelivr.net/npm";
const brandFontMap: Record<string, string> = {
  Lora_400Regular: `${FONT_CDN}/@fontsource/lora/files/lora-latin-400-normal.ttf`,
  Lora_600SemiBold: `${FONT_CDN}/@fontsource/lora/files/lora-latin-600-normal.ttf`,
  Lora_700Bold: `${FONT_CDN}/@fontsource/lora/files/lora-latin-700-normal.ttf`,
  PlusJakartaSans_400Regular: `${FONT_CDN}/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-400-normal.ttf`,
  PlusJakartaSans_500Medium: `${FONT_CDN}/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-500-normal.ttf`,
  PlusJakartaSans_600SemiBold: `${FONT_CDN}/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-600-normal.ttf`,
  PlusJakartaSans_700Bold: `${FONT_CDN}/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.ttf`,
};

export default function RootLayout() {
  const [iconLoaded, iconError] = useIconFonts();
  const [brandLoaded, brandError] = useFonts(brandFontMap);

  const ready = (iconLoaded || iconError) && (brandLoaded || brandError);

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="buyer/[id]" options={{ headerShown: false, presentation: "card" }} />
          <Stack.Screen name="commodity/[id]" options={{ headerShown: false, presentation: "card" }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
