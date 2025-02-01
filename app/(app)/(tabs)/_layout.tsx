import { Tabs } from "expo-router";
import { ScanLine } from "lucide-react-native";
import { View } from "react-native";
import { Home } from "~/lib/icons/Home";
import { User } from "~/lib/icons/User";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          paddingHorizontal: 15,
          height: 60,
        },
        tabBarItemStyle: {
          margin: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon({ color, size }) {
            return <Home color={color} size={size} />;
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
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate("scan");
          },
        })}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "User Profile",
          tabBarIcon({ color, size }) {
            return <User color={color} size={size} />;
          },
        }}
      />
    </Tabs>
  );
}
