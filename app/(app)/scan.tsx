import { useEffect, useRef, useState } from "react";
import {
  View,
  Dimensions,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { supabase } from "~/lib/supabase";
import { useRouter } from "expo-router";
import { toast } from "sonner-native";
import useAuthStore from "~/stores/AuthStore";

interface QrBounds {
  width: number;
  height: number;
  originX: number;
  originY: number;
}

export default function BarcodeScanner() {
  const [scanned, setScanned] = useState<boolean>(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [barcodeBounds, setBarcodeBounds] = useState<QrBounds | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const permissionDenied = useRef(false);
  const router = useRouter();
  const { session } = useAuthStore();

  useEffect(() => {
    if (permissionDenied.current) return;
    if (permission && !permission.granted) {
      requestPermission().then((result) => {
        if (!result.granted) {
          permissionDenied.current = true;
          toast.error("Camera permission is required to scan QR codes.");
          router.back();
        }
      });
    }
  }, [permission]);

  const onBarcodeScanned = (result: BarcodeScanningResult) => {
    const { origin, size } = result.bounds;

    setScanned(true);
    if (result.data.startsWith("payment:")) {
      if (!scanned) {
        const paymentChannel = supabase.channel(result.data, {
          config: {
            broadcast: { ack: true },
          },
        });

        paymentChannel.subscribe(async (status) => {
          if (status !== "SUBSCRIBED") {
            return null;
          }

          const serverResponse = await paymentChannel.send({
            type: "broadcast",
            event: "payment",
            payload: { success: true, code: "SUCCESSFUL_PAYMENT" },
          });
        });

        const transactionId = result.data.split(":")[1];
        setTimeout(() => {
          router.replace(`/transaction/${transactionId}`);
        }, 1500);
        router.replace(`/transaction/${transactionId}`);
        return;
      }
      return;
    }

    setBarcodeBounds({
      width: size.width,
      height: size.height,
      originX: origin.x,
      originY: origin.y,
    });
    setScannedData(result.data);
  };

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  if (!permission) {
    return <ActivityIndicator />;
  }

  if (!session) {
    return null;
  }

  const startSession = async () => {
    const { error } = await supabase
      .from("shopping_carts")
      .update({ status: "in_use", user_id: session.user.id })
      .eq("cart_id", scannedData!);
    if (error) {
      console.error("Error updating status: ", error.message);
      return;
    }
    setScannedData(null);
    setScanned(false);
    toast.success("Cart activated!");
    router.back();
  };

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={onBarcodeScanned}
      />
      {!scanned ? (
        <View>
          <View
            className="absolute z-10"
            style={{
              width: screenWidth * 0.5,
              height: screenWidth * 0.5,
              top: screenHeight * 0.25,
              left: screenWidth * 0.25,
            }}
          >
            {/* Top-Left Corner */}
            <View className="absolute h-8 w-8 rounded-tl-lg border-l-[3px] border-t-[3px] border-white" />
            {/* Top-Right Corner */}
            <View className="absolute right-0 h-8 w-8 rounded-tr-lg border-r-[3px] border-t-[3px] border-white" />
            {/* Bottom-Left Corner */}
            <View className="absolute bottom-0 h-8 w-8 rounded-bl-lg border-b-[3px] border-l-[3px] border-white" />
            {/* Bottom-Right Corner */}
            <View className="absolute bottom-0 right-0 h-8 w-8 rounded-br-lg border-b-[3px] border-r-[3px] border-white" />
          </View>
        </View>
      ) : (
        barcodeBounds && (
          <View
            className="absolute z-10"
            style={{
              width: barcodeBounds.width,
              height: barcodeBounds.height,
              left: barcodeBounds.originX,
              top: barcodeBounds.originY,
            }}
          >
            {/* Top-Left Corner */}
            <View className="absolute h-8 w-8 rounded-tl-lg border-l-[3px] border-t-[3px] border-white" />
            {/* Top-Right Corner */}
            <View className="absolute right-0 h-8 w-8 rounded-tr-lg border-r-[3px] border-t-[3px] border-white" />
            {/* Bottom-Left Corner */}
            <View className="absolute bottom-0 h-8 w-8 rounded-bl-lg border-b-[3px] border-l-[3px] border-white" />
            {/* Bottom-Right Corner */}
            <View className="absolute bottom-0 right-0 h-8 w-8 rounded-br-lg border-b-[3px] border-r-[3px] border-white" />
          </View>
        )
      )}
      {scannedData && (
        <View
          style={{
            position: "absolute",
            bottom: 20,
            alignSelf: "center",
            backgroundColor: "white",
            padding: 10,
            borderRadius: 5,
          }}
        >
          <Text>Scanned Data: {scannedData}</Text>
          <TouchableOpacity
            className="rounded bg-blue-500 px-4 py-2"
            onPress={startSession}
          >
            <Text className="font-bold text-white">Activate Cart!</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
