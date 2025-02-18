import { View } from "react-native";
import { Text } from "~/components/ui/text";
import useAuthStore from "~/stores/AuthStore";
import { Calendar } from "~/lib/icons/Calendar";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";

export default function Screen() {
  const { session } = useAuthStore();

  if (!session) {
    return null;
  }

  return (
    <View className="flex-1 items-center gap-9 bg-secondary/30 px-12 py-5">
      <View className="flex-row items-center gap-3">
        <Avatar alt="Zach Nugent's Avatar" className="flex-">
          <AvatarFallback>
            <Text>C1</Text>
          </AvatarFallback>
        </Avatar>
        <View className="w-full flex-row items-center justify-between">
          <View>
            <Text className="font-bold">Cart 1</Text>
            <View className="flex-row items-center gap-2">
              <Calendar size={15} color="black" />
              <Text>2024-09-23</Text>
            </View>
          </View>
          <Text className="font-bold">₱448.30</Text>
        </View>
      </View>
      <View className="flex-row items-center gap-3">
        <Avatar alt="Zach Nugent's Avatar" className="flex-">
          <AvatarFallback>
            <Text>C1</Text>
          </AvatarFallback>
        </Avatar>
        <View className="w-full flex-row items-center justify-between">
          <View>
            <Text className="font-bold">Cart 2</Text>
            <View className="flex-row items-center gap-2">
              <Calendar size={15} color="black" />
              <Text>2021-10-18</Text>
            </View>
          </View>
          <Text className="font-bold">₱563.19</Text>
        </View>
      </View>
    </View>
  );
}
