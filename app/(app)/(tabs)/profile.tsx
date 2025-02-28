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

  if (status === "pending") {
    return <ActivityIndicator />;
  }

  if (status === "error") {
    return <Text>Error: {error.message}</Text>;
  }

  return (
    <SafeAreaView className="flex-1 items-start justify-normal gap-2 bg-secondary/30 p-2 px-4">
      <Card className="w-full border-0">
        <CardHeader className="w-full flex-row items-center justify-between pr-24">
          <Avatar alt="Your Avatar" className="h-14 w-14">
            <AvatarImage source={{ uri: user.avatar_url! }} />
          </Avatar>
          <View>
            <CardTitle>{user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </View>
        </CardHeader>
      </Card>
      <View className="h-[0.55] w-[95%] self-center bg-black opacity-50" />
      <View className="mt-6 w-full gap-2">
        <TouchableOpacity
          className="h-14 w-full flex-row items-center gap-2 rounded-lg bg-white px-4 shadow-2xl"
          onPress={() => router.push("/list")}
        >
          <AntDesign name="shoppingcart" size={24} color="#0FA958" />
          <Text className="font-semibold">Shopping List</Text>
        </TouchableOpacity>
        <TouchableOpacity className="h-14 w-full flex-row items-center gap-2 rounded-lg bg-white px-4 shadow-2xl">
          <Feather name="settings" size={24} color="#0FA958" />
          <Text className="font-semibold">Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
