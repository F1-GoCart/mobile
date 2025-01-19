import { Session } from "@supabase/supabase-js";
import { Redirect, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "~/lib/supabase";
import { ActivityIndicator } from "react-native";

export default function AppLayout() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (session === undefined) {
    return <ActivityIndicator />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Home Screen",
        }}
      />
    </Stack>
  );
}
