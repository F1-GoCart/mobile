import { Href, Redirect, Slot } from "expo-router";
import { ActivityIndicator } from "react-native";
import useAuthStore from "~/stores/AuthStore";

export default function AppLayout() {
  const { session } = useAuthStore();

  if (session === undefined) {
    return <ActivityIndicator />;
  }

  if (session && session.user) {
    return <Redirect href={"/" as Href} />;
  }

  return <Slot />;
}
