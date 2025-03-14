import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { Avatar, AvatarImage } from "~/components/ui/avatar";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { supabase } from "~/lib/supabase";
import useAuthStore from "~/stores/AuthStore";
import { useQuery } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { Button } from "~/components/ui/button";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect } from "react";

const dec2hex = (dec: number) => {
  return dec.toString(16).padStart(2, "0");
};

const generateId = (len: number) => {
  var arr = new Uint8Array((len || 40) / 2);
  crypto.getRandomValues(arr);
  return Array.from(arr, dec2hex).join("");
};

export default function Screen() {
  const router = useRouter();

  const { session } = useAuthStore();

  if (!session) {
    return null;
  }

  const {
    data: user,
    status,
    error,
  } = useQuery({
    queryKey: ["user", session.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select()
        .eq("id", session.user.id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
  });

  const userId = generateId(12);

  const {
    data: cart,
    status: cartStatus,
    error: cartError,
    refetch,
  } = useQuery({
    queryKey: ["cart", session.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shopping_carts")
        .select()
        .eq("user_id", session.user.id)
        .eq("status", "in_use")
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    },
  });

  useEffect(() => {
    const userChannel = supabase
      .channel("current_cart_userId")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shopping_carts",
          filter: "user_id=eq." + session.user.id,
        },
        () => {
          refetch();
        },
      )
      .subscribe();
    const cartChannel = supabase
      .channel("current_cart_cartId")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shopping_carts",
          filter: "cart_id=eq." + cart?.cart_id,
        },
        () => {
          refetch();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(userChannel);
      supabase.removeChannel(cartChannel);
    };
  }, []);

  if (status === "pending" || cartStatus === "pending") {
    return <ActivityIndicator />;
  }

  if (status === "error") {
    return <Text>Error: {error.message}</Text>;
  }

  if (cartStatus === "error") {
    return <Text>Error: {cartError.message}</Text>;
  }

  return (
    <SafeAreaView className="flex-1 items-start justify-normal gap-2 bg-secondary/30 p-2 px-4">
      <Card className="bg-[ w-full border-0">
        <CardHeader className="w-full flex-row items-center justify-between gap-6 pr-32">
          <Avatar alt="Your Avatar" className="h-20 w-20">
            <AvatarImage source={{ uri: user.avatar_url! }} />
          </Avatar>
          <View>
            <CardTitle>{user.name}</CardTitle>
            <CardDescription className="mt-1">
              {user.email ?? `${userId}@gocart.ph`}
            </CardDescription>
          </View>
        </CardHeader>
      </Card>
      <View className="mt-3 w-full gap-5">
        {cart && (
          <TouchableOpacity
            className="h-14 w-full flex-row items-center gap-2 rounded-lg bg-white px-4"
            onPress={() =>
              router.push({
                pathname: "/status/[id]",
                params: { id: cart.cart_id },
              })
            }
          >
            <AntDesign name="shoppingcart" size={24} color="#0FA958" />
            <Text className="font-semibold">Cart Status - Cart {cart.id}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className="h-14 w-full flex-row items-center gap-2 rounded-lg bg-white px-4"
          onPress={() => router.push("/list")}
        >
          <Feather name="list" size={24} color="#0FA958" />
          <Text className="font-semibold">Shopping List</Text>
        </TouchableOpacity>
        <TouchableOpacity className="h-14 w-full flex-row items-center gap-2 rounded-lg bg-white px-4">
          <Feather name="settings" size={24} color="#0FA958" />
          <Text className="font-semibold">Settings</Text>
        </TouchableOpacity>

        <Button
          variant="outline"
          className="shadow shadow-foreground/5"
          onPress={async () => {
            await supabase.auth.signOut();
          }}
        >
          <Text>Sign out</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
