import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { ToastAndroid, View } from "react-native";
import { Text } from "~/components/ui/text";
import { supabase } from "~/lib/supabase";
import { Button } from "~/components/ui/button";
import Google from "~/assets/images/logos/google.svg";
import Banner from "~/assets/images/banner.svg";
import { toast } from "sonner-native";

export default function LoginScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-5 bg-[#0FA958] px-3">
      <View className="w-[80%] items-center">
        <Banner width="100%" height="100%" />
      </View>
      <View className="absolute bottom-0 left-0 right-0 h-32 flex-1 items-center justify-center gap-5 rounded-t-3xl bg-white p-3">
        <Button
          variant="outline"
          className="h-28 w-[90%] flex-row items-center justify-center gap-3 rounded-3xl"
          onPress={async () => {
            try {
              await GoogleSignin.hasPlayServices();
              const userInfo = await GoogleSignin.signIn();
              if (userInfo.data?.idToken) {
                const { data, error } = await supabase.auth.signInWithIdToken({
                  provider: "google",
                  token: userInfo.data.idToken,
                });
                console.log(error, data);
              } else {
                throw new Error("no ID token present!");
              }
            } catch (error: any) {
              if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                toast.error("Login cancelled", {
                  duration: 2500,
                });
              } else if (error.code === statusCodes.IN_PROGRESS) {
                toast.error("Operation is already in progress", {
                  duration: 2500,
                });
              } else if (
                error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE
              ) {
                toast.error("Play services not available", {
                  duration: 2500,
                });
              } else {
                toast.error("Something went wrong", {
                  duration: 2500,
                });
              }
            }
          }}
        >
          <View className="flex h-6 w-6 items-center justify-center rounded-full">
            <Google />
          </View>
          <Text>Continue with Google</Text>
        </Button>
      </View>
    </View>
  );
}
