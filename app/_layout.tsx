import "~/global.css";

import "expo-dev-client";
import "react-native-get-random-values";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";
import { PortalHost } from "@rn-primitives/portal";
import { setAndroidNavigationBar } from "~/lib/android-navigation-bar";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Appearance, Platform } from "react-native";
import { Toaster } from "sonner-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { supabase } from "~/lib/supabase";
import useAuthStore from "~/stores/AuthStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useReactQueryDevTools } from "@dev-plugins/react-query";

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

const queryClient = new QueryClient();

if (Platform.OS === "android") {
  const GoogleSignin =
    require("@react-native-google-signin/google-signin").GoogleSignin;

  GoogleSignin.configure({
    webClientId:
      "894661082702-svtpejtro8khh3rjshgm357i1oul2u5n.apps.googleusercontent.com",
  });
}

Appearance.setColorScheme("light"); // Default to light theme

export default function RootLayout() {
  const hasMounted = useRef(false);
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = useState(false);
  useReactQueryDevTools(queryClient);

  useLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }

    setAndroidNavigationBar(colorScheme);
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  const { setSession } = useAuthStore();
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <GestureHandlerRootView>
          <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "fade_from_bottom",
            }}
          />
          <Toaster />
          <PortalHost />
        </GestureHandlerRootView>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
