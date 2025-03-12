import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Image, ImageBackground } from "react-native";
import { TextClassContext, Text } from "~/components/ui/text";
import SwipeButton from "rn-swipe-button";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import CartIcon from "~/assets/images/cart_icon.svg";
import { FontAwesome6 } from "@expo/vector-icons";
import { supabase } from "~/lib/supabase";
import { toast } from "sonner-native";
import useAuthStore from "~/stores/AuthStore";

export default function DetailsScreen() {
  const { session } = useAuthStore();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [swiped, setSwiped] = useState(false);

  const cartNumber = parseInt(id.replace("go-cart-", ""));

  const startSession = async () => {
    if (!session) {
      return;
    }
    const { error } = await supabase
      .from("shopping_carts")
      .update({ status: "in_use", user_id: session.user.id })
      .eq("cart_id", id);
    if (error) {
      console.error("Error updating status: ", error.message);
      return;
    }
    toast.success("Cart activated!");
    router.replace("/");
  };

  return (
    <View className="flex-1 bg-[#0fa958] px-5">
      <Image
        source={require("~/assets/images/banner_long.png")}
        className="mx-auto mt-16 w-9/12"
        resizeMode="contain"
      />
      <TextClassContext.Provider value="text-white text-center">
        <View className="items-center justify-center gap-10">
          <Text className="text-lg font-semibold uppercase">
            Are you connecting to cart no.
          </Text>
          <ImageBackground
            source={require("~/assets/images/cart.png")}
            className="h-64 w-64"
            resizeMode="contain"
          >
            <Text
              className="absolute text-6xl font-semibold text-[#0fa958]"
              style={{
                top: "33%",
                left: "35%",
              }}
            >
              {cartNumber}
            </Text>
          </ImageBackground>
          <Text className="text-lg font-bold uppercase">
            Please check the number of the cart
          </Text>
          <View className="w-full">
            <SwipeButton
              railBackgroundColor="#227e4e"
              railBorderColor="rgba(255, 255, 255, 0)"
              railFillBackgroundColor="#3d8e64"
              railFillBorderColor="rgba(255, 255, 255, 0)"
              thumbIconBackgroundColor="white"
              thumbIconBorderColor="rgba(252, 255, 87, 0)"
              thumbIconComponent={() => <CartIcon width={30} height={30} />}
              titleComponent={() => (
                <TripleArrowAnimated
                  icon="chevron-right"
                  size={18}
                  color="#FFFFFF"
                  delay={100}
                  waitDuration={2000}
                  swiped={swiped}
                />
              )}
              height={55}
              onSwipeSuccess={() => {
                setSwiped(true);
                startSession();
              }}
              onSwipeFail={() => setSwiped(false)}
              onSwipeStart={() => setSwiped(true)}
            />
          </View>
        </View>
      </TextClassContext.Provider>
    </View>
  );
}

const AnimatedComponent = ({
  delay,
  icon,
  color,
  size,
  waitDuration,
  swiped,
}: {
  delay: number;
  icon: string;
  color: string;
  size: number;
  waitDuration: number;
  swiped: boolean;
}) => {
  const opacity = useSharedValue(0.1);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.1, { duration: 300 }),
          withTiming(0.1, { duration: waitDuration }),
        ),
        -1,
        false,
      ),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: swiped ? 0.02 : opacity.value,
  }));

  return (
    <Animated.View style={[animatedStyle]}>
      <FontAwesome6 name={icon} iconStyle="solid" size={size} color={color} />
    </Animated.View>
  );
};
const TripleArrowAnimated = (props: {
  delay: number;
  icon: string;
  color: string;
  size: number;
  waitDuration: number;
  swiped: boolean;
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
      }}
    >
      <AnimatedComponent
        delay={props.delay * 0}
        icon={props.icon}
        color={props.color}
        size={props.size}
        waitDuration={props.waitDuration}
        swiped={props.swiped}
      />
      <AnimatedComponent
        delay={props.delay * 1}
        icon={props.icon}
        color={props.color}
        size={props.size}
        waitDuration={props.waitDuration}
        swiped={props.swiped}
      />
      <AnimatedComponent
        delay={props.delay * 2}
        icon={props.icon}
        color={props.color}
        size={props.size}
        waitDuration={props.waitDuration}
        swiped={props.swiped}
      />
    </View>
  );
};
