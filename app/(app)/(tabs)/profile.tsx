import { ActivityIndicator, View } from "react-native";
import { Info } from "~/lib/icons/Info";
import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { supabase } from "~/lib/supabase";
import useAuthStore from "~/stores/AuthStore";
import { useQuery } from "@tanstack/react-query";

export default function Screen() {
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
    <View className="flex-1 items-center justify-center gap-5 bg-secondary/30 p-6">
      <Card className="w-full max-w-sm rounded-2xl p-6">
        <CardHeader className="items-center">
          <Avatar alt="Your Avatar" className="h-24 w-24">
            <AvatarImage source={{ uri: user.avatar_url! }} />
          </Avatar>
          <View className="p-3" />
          <CardTitle className="pb-2 text-center">{user.name}</CardTitle>
          <View className="flex-row">
            <CardDescription className="text-base font-semibold">
              {user.email}
            </CardDescription>
            <Tooltip delayDuration={150}>
              <TooltipTrigger className="px-2 pb-0.5 active:opacity-50">
                <Info
                  size={14}
                  strokeWidth={2.5}
                  className="h-4 w-4 text-foreground/70"
                />
              </TooltipTrigger>
              <TooltipContent className="px-4 py-2 shadow">
                <Text className="native:text-lg">
                  Member since {user.created_at}
                </Text>
              </TooltipContent>
            </Tooltip>
          </View>
        </CardHeader>
        <CardFooter className="flex-col gap-3 pb-0">
          <Button
            variant="outline"
            className="shadow shadow-foreground/5"
            onPress={async () => {
              await supabase.auth.signOut();
            }}
          >
            <Text>Sign out</Text>
          </Button>
        </CardFooter>
      </Card>
    </View>
  );
}
