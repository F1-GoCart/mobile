import * as React from "react";
import { View } from "react-native";
import Animated, {
  FadeInUp,
  FadeOutDown,
  LayoutAnimationConfig,
} from "react-native-reanimated";
import { Info } from "~/lib/icons/Info";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Text } from "~/components/ui/text";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "~/lib/supabase";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";

const GITHUB_AVATAR_URI =
  "https://avatars.githubusercontent.com/u/56180050?v=4";

export default function Screen() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <View className="flex-1 justify-center items-center gap-5 p-6 bg-secondary/30">
      <GoogleSigninButton
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={async () => {
          try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            if (userInfo.data?.idToken) {
              console.log(userInfo.data.idToken);
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
              // user cancelled the login flow
            } else if (error.code === statusCodes.IN_PROGRESS) {
              // operation (e.g. sign in) is in progress already
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
              // play services not available or outdated
            } else {
              // some other error happened
            }
          }
        }}
      />
      {session && session.user && (
        <>
          <Text>Welcome, {session.user.email}</Text>
          <PageCard />
        </>
      )}
    </View>
  );
}

function PageCard() {
  const [progress, setProgress] = React.useState(78);

  function updateProgressValue() {
    setProgress(Math.floor(Math.random() * 100));
  }
  return (
    <Card className="w-full max-w-sm p-6 rounded-2xl">
      <CardHeader className="items-center">
        <Avatar alt="sitiom's Avatar" className="w-24 h-24">
          <AvatarImage source={{ uri: GITHUB_AVATAR_URI }} />
          <AvatarFallback>
            <Text>RS</Text>
          </AvatarFallback>
        </Avatar>
        <View className="p-3" />
        <CardTitle className="pb-2 text-center">sitiom</CardTitle>
        <View className="flex-row">
          <CardDescription className="text-base font-semibold">
            Intern
          </CardDescription>
          <Tooltip delayDuration={150}>
            <TooltipTrigger className="px-2 pb-0.5 active:opacity-50">
              <Info
                size={14}
                strokeWidth={2.5}
                className="w-4 h-4 text-foreground/70"
              />
            </TooltipTrigger>
            <TooltipContent className="py-2 px-4 shadow">
              <Text className="native:text-lg">Freelance</Text>
            </TooltipContent>
          </Tooltip>
        </View>
      </CardHeader>
      <CardContent>
        <View className="flex-row justify-around gap-3">
          <View className="items-center">
            <Text className="text-sm text-muted-foreground">Dimension</Text>
            <Text className="text-xl font-semibold">Earth-1</Text>
          </View>
          <View className="items-center">
            <Text className="text-sm text-muted-foreground">Age</Text>
            <Text className="text-xl font-semibold">21</Text>
          </View>
          <View className="items-center">
            <Text className="text-sm text-muted-foreground">Species</Text>
            <Text className="text-xl font-semibold">Human</Text>
          </View>
        </View>
      </CardContent>
      <CardFooter className="flex-col gap-3 pb-0">
        <View className="flex-row items-center overflow-hidden">
          <Text className="text-sm text-muted-foreground">Productivity:</Text>
          <LayoutAnimationConfig skipEntering>
            <Animated.View
              key={progress}
              entering={FadeInUp}
              exiting={FadeOutDown}
              className="w-11 items-center"
            >
              <Text className="text-sm font-bold text-sky-600">
                {progress}%
              </Text>
            </Animated.View>
          </LayoutAnimationConfig>
        </View>
        <Progress
          value={progress}
          className="h-2"
          indicatorClassName="bg-sky-600"
        />
        <View />
        <Button
          variant="outline"
          className="shadow shadow-foreground/5"
          onPress={updateProgressValue}
        >
          <Text>Update</Text>
        </Button>
      </CardFooter>
    </Card>
  );
}
