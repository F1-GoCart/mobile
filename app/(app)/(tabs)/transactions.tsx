import { FlatList, RefreshControl, View } from "react-native";
import { Text } from "~/components/ui/text";
import useAuthStore from "~/stores/AuthStore";
import { Calendar } from "~/lib/icons/Calendar";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { supabase } from "~/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { CreditCard } from "~/lib/icons/CreditCard";

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
        .eq("user_id", session.user.id);

      if (error) {
        throw error;
      }

      return data;
    },
  });
  return (
    <FlatList
      data={transactions}
      className="w-full flex-1 bg-secondary/20 p-5"
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
      ItemSeparatorComponent={() => (
        <View className="my-5 h-[0.5] w-full bg-[#d6dfd7]" />
      )}
      renderItem={({ item }) => (
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
      )}
    />
  );
}
