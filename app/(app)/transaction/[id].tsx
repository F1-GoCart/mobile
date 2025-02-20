import { ActivityIndicator, View } from "react-native";
import { Avatar } from "~/components/ui/avatar";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { supabase } from "~/lib/supabase";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { Image } from "react-native";

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: transaction,
    status: transactionStatus,
    error: transactionError,
  } = useQuery({
    queryKey: ["transaction", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_history")
        .select()
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
  });

  const {
    data: purchased_items,
    status,
    error,
  } = useQuery({
    queryKey: ["purchased_items", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchased_items")
        .select()
        .eq("id", id);

      if (error) {
        throw error;
      }

      return data;
    },
  });

  const productDetails = useQueries({
    queries: purchased_items
      ? purchased_items.map((item) => {
          return {
            queryKey: ["product", item.item_id],
            queryFn: async () => {
              const { data, error } = await supabase
                .from("product_details")
                .select()
                .eq("id", item.item_id)
                .single();

              if (error) {
                throw error;
              }

              return data;
            },
          };
        })
      : [],
  });

  if (
    status === "pending" ||
    transactionStatus === "pending" ||
    productDetails.some((detail) => detail.status === "pending")
  ) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (
    status === "error" ||
    transactionStatus === "error" ||
    productDetails.some((detail) => detail.status === "error")
  ) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>
          Error:{" "}
          {error?.message ||
            transactionError?.message ||
            productDetails.find((detail) => detail.status === "error")?.error
              ?.message}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center gap-5 bg-secondary/30 p-6">
      <Stack.Screen
        options={{
          title: "Transaction Details",
        }}
      />
      <View className="items-center gap-2">
        <Text className="text-xl text-gray-500">Transaction successful!</Text>
        <Text className="text-3xl font-bold">₱{transaction.total_price}</Text>
      </View>
      <Card className="w-full max-w-sm items-center rounded-2xl p-6">
        {/* Items list*/}
        <View className="w-full gap-5">
          {productDetails.map(({ data: detail }, index) => (
            <View key={detail!.id} className="flex-row items-center gap-2">
              <Image
                source={{ uri: detail!.image }}
                className="h-16 w-16 rounded-lg"
              />
              <View className="flex-1">
                <Text className="font-bold">{detail!.name}</Text>
                <Text>Quantity: {purchased_items[index].quantity}</Text>
              </View>
              <Text>₱{detail!.price * purchased_items[index].quantity}</Text>
            </View>
          ))}
        </View>
        <View className="my-4 h-[1px] w-full bg-gray-200" />
        <View className="w-full gap-3">
          {/* Cart ID */}
          <View className="w-full flex-row items-center justify-between gap-2">
            <Text className="text-sm text-gray-500">Cart ID</Text>
            <Text className="text-sm">{transaction.cart_id}</Text>
          </View>
          {/* Date and time */}
          <View className="w-full flex-row items-center justify-between gap-2">
            <Text className="text-sm text-gray-500">Date and Time</Text>
            <Text className="text-sm">
              {new Date(transaction.datetime).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}
            </Text>
          </View>
          {/* Mode of payment */}
          <View className="w-full flex-row items-center justify-between gap-2">
            <Text className="text-sm text-gray-500">Mode of Payment</Text>
            <Text className="text-sm">{transaction.mode_of_payment}</Text>
          </View>
          {/* Transaction ID */}
          <View className="w-full flex-row items-center justify-between gap-2">
            <Text className="text-sm text-gray-500">Transaction ID</Text>
            <Text className="text-sm">{transaction.id.slice(0, 18)}...</Text>
          </View>
        </View>
      </Card>
    </View>
  );
}
