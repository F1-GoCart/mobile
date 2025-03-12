import { FlatList, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import useAuthStore from "~/stores/AuthStore";
import { supabase } from "~/lib/supabase";

export default function Screen() {
  const { session } = useAuthStore();
  const [list, setList] = useState<
    { id: number; name: string; checked: boolean }[]
  >([]);
  const [input, setInput] = useState<string>("");

  const addItem = async () => {
    if (input.trim().length === 0) return;

    const { data, error } = await supabase
      .from("shopping_list")
      .insert([
        { user_id: session?.user?.id, item_name: input, checked: false },
      ])
      .select("id, item_name, checked");

    if (error) {
      console.error("Error adding item:", error.message);
    } else if (data && data.length > 0) {
      setList((prev) => [
        ...prev,
        {
          id: data[0].id,
          name: data[0].item_name ?? "",
          checked: data[0].checked ?? false,
        },
      ]);
      setInput("");
    }
  };

  const deleteItem = async (id: number) => {
    const { error } = await supabase
      .from("shopping_list")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting item:", error.message);
    } else {
      setList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  useEffect(() => {
    const fetchUserList = async () => {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from("shopping_list")
        .select("id, item_name, checked")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching list:", error.message);
      } else {
        setList(
          (data || []).map((item) => ({
            id: item.id,
            name: item.item_name ?? "",
            checked: item.checked ?? false,
          })),
        );
      }
    };

    fetchUserList();
  }, [session?.user?.id]);
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
            <TouchableOpacity onPress={() => deleteItem(item.id)}>
              <MaterialIcons name="delete" size={24} color="#DC2626" />
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </SafeAreaView>
  );
}
