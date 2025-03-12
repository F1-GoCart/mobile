import { FlatList, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function Screen() {
  const [list, setList] = useState<{ name: string; checked: boolean }[]>([]);
  const [input, setInput] = useState<string>("");

  const addItem = () => {
    if (input.trim().length === 0) return;
    setList((prev) => [...prev, { name: input, checked: false }]);
    setInput("");
  };

  const deleteItem = (index: number) => {
    setList((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <SafeAreaView className="flex-1 items-start justify-normal gap-2 bg-secondary/30 px-4">
      <View className="w-full flex-row items-center gap-2 p-2">
        <TextInput
          className="flex-1 rounded-md border border-gray-300 p-3 text-base"
          onChangeText={setInput}
          value={input}
          placeholder="Enter Item"
          keyboardType="default"
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity onPress={addItem}>
          <AntDesign name="check" size={24} color="#0FA958" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={list}
        className="w-full"
        renderItem={({ item, index }) => (
          <View className="my-1 h-14 w-full flex-row items-center overflow-hidden rounded-lg bg-white px-3 shadow-2xl shadow-black/10">
            <Text className="text-md flex-1 font-semibold">{item.name}</Text>
            <TouchableOpacity onPress={() => deleteItem(index)}>
              <MaterialIcons name="delete" size={24} color="#DC2626" />
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </SafeAreaView>
  );
}
