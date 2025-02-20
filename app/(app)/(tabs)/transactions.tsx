import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  View,
} from "react-native";
import { Text } from "~/components/ui/text";
import useAuthStore from "~/stores/AuthStore";
import { Calendar } from "~/lib/icons/Calendar";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { supabase } from "~/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { CreditCard } from "~/lib/icons/CreditCard";
import { toast } from "sonner-native";
import { Link } from "expo-router";

export default function Screen() {
  const { session } = useAuthStore();

  if (!session) {
    return null;
  }

  const {
    data: transactions,
    status,
    error,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["transactions", session.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_history")
        .select()
        .eq("user_id", session.user.id)
        .order("datetime", { ascending: false });

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
    toast.error(error.message);
  }

  return (
    <FlatList
      data={transactions}
      className="w-full flex-1 bg-secondary/20"
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
      ItemSeparatorComponent={() => (
        <View className="m-auto h-[0.5] w-[90%] bg-[#d6dfd7]" />
      )}
      renderItem={({ item }) => (
        <View className="m-2 overflow-hidden rounded-xl">
          <Link
            href={{ pathname: "/transaction/[id]", params: { id: item.id } }}
            asChild
          >
            <Pressable android_ripple={{ color: "gray" }} className="p-3">
              <View className="w-full flex-row items-center gap-3">
                <Avatar alt="Cart id">
                  {item.mode_of_payment === "gcash" && (
                    <AvatarImage
                      source={require("~/assets/images/logos/gcash.jpg")}
                    />
                  )}
                  <AvatarFallback>
                    {item.mode_of_payment === "card" ? (
                      <CreditCard size={20} color="gray" />
                    ) : (
                      <Text>{`C${item.cart_id}`}</Text>
                    )}
                  </AvatarFallback>
                </Avatar>
                <View className="flex-1">
                  <Text className="font-bold">{`Cart ${item.cart_id}`}</Text>
                  <View className="flex-row items-center gap-2">
                    <Calendar size={15} color="gray" />
                    <Text className="text-gray-500">
                      {new Date(item.datetime!).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                      })}
                    </Text>
                  </View>
                </View>
                <Text className="text-right font-bold">{`₱${item.total_price!.toFixed(2)}`}</Text>
              </View>
            </Pressable>
          </Link>
        </View>
      )}
    />
  );
}
