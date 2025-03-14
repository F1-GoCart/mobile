import { Redirect, Stack } from "expo-router";
import { ActivityIndicator } from "react-native";
import useAuthStore from "~/stores/AuthStore";

export default function AppLayout() {
  const { session } = useAuthStore();

  if (session === undefined) {
    return <ActivityIndicator />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="scan"
        options={{
          title: "Scan",
        }}
      />
      <Stack.Screen
        name="status/[id]"
        options={{
          title: "Cart Status",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="confirm/[id]"
        options={{
          title: "Confirm",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="list"
        options={{
          title: "Shopping List",
        }}
      />
    </Stack>
  );
}
