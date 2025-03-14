import { Tabs } from "expo-router";
import { ScanLine } from "lucide-react-native";
import { View } from "react-native";
import { User } from "~/lib/icons/User";
import { ReceiptText } from "~/lib/icons/ReceiptText";
import { supabase } from "~/lib/supabase";
import useAuthStore from "~/stores/AuthStore";
import { toast } from "sonner-native";
import { useQueryClient } from "@tanstack/react-query";

export default function TabsLayout() {
  const { session } = useAuthStore();
  const queryClient = useQueryClient();

  if (!session) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 70,
        },
        tabBarItemStyle: {
          margin: 5,
        },
        tabBarLabelStyle: {
          // Do not cut off text wtih ellipsis
          fontSize: 7,
        },
      }}
    >
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          headerShown: true,
          tabBarIcon({ color, size }) {
            return <ReceiptText color={color} size={size} />;
          },
        }}
      />
      <Tabs.Screen
        name="scan-redirect"
        options={{
          title: "Scan",
          tabBarIcon({ size }) {
            return (
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  height: 68,
                  width: 68,
                  borderRadius: 68,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 65,
                    height: 65,
                    borderRadius: 35,
                    backgroundColor: "#0fa958",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 2,
                    borderColor: "#fff",
                  }}
                >
                  <ScanLine color={"#fff"} size={size * 1.6} />
                </View>
              </View>
            );
          },
        }}
        listeners={({ navigation }) => ({
          tabPress: async (e) => {
            e.preventDefault();
            const { data, error } = await supabase
              .from("shopping_carts")
              .select()
              .eq("status", "in_use")
              .eq("user_id", session.user.id)
              .maybeSingle();

            if (error) {
              console.error("Error fetching cart: ", error.message);
              return;
            }

            if (data) {
              toast.error("You already have an active cart.");
              return;
            }

            navigation.navigate("scan");
          },
          tabLongPress: () => {
            navigation.navigate("scan");
          },
        })}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "User Profile",
          tabBarIcon({ color, size }) {
            return <User color={color} size={size} />;
          },
        }}
        listeners={() => ({
          tabPress: () => {
            queryClient.invalidateQueries({
              queryKey: ["cart", session.user.id],
              refetchType: "all",
            });
          },
        })}
      />
    </Tabs>
  );
}
