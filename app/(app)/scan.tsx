import { useCallback, useEffect, useRef, useState } from "react";
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
import { useFocusEffect, useRouter } from "expo-router";
import { toast } from "sonner-native";
interface QrBounds {
  width: number;
  height: number;
  originX: number;
  originY: number;
}
export default function BarcodeScanner() {
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const [scanned, setScanned] = useState<boolean>(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [barcodeBounds, setBarcodeBounds] = useState<QrBounds | null>(null);
  const router = useRouter();
  const onBarcodeScanned = (result: BarcodeScanningResult) => {
    const { origin, size } = result.bounds;
    setScanned(true);
    setBarcodeBounds({
      width: size.width,
      height: size.height,
      originX: origin.x,
      originY: origin.y,
    });
    setScannedData(result.data);
    console.log("Scanned Data:", scannedData);
  };
  const startSession = async () => {
    const { error } = await supabase
      .from("shopping_carts")
      .update({ status: "in_use" })
      .eq("cart_id", scannedData!);
    if (error) {
      console.error("Error updating status: ", error.message);
    }
  };
  const [permission, requestPermission] = useCameraPermissions();
  const permissionDenied = useRef(false);

  useEffect(() => {
    console.log(permissionDenied.current);
    if (permissionDenied.current) return;

    console.log(permission);
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

  if (!permission) {
    return <ActivityIndicator />;
  }

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
