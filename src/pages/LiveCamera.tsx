import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';

interface LiveCameraProps {
  deviceId?: string | null;
  label?: string; // For MultiCamera labeling
}

export default function LiveCamera({ deviceId, label }: LiveCameraProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"front" | "back">(
    deviceId === "front" ? "front" : "back"
  );

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-900 rounded-lg">
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-900 rounded-lg p-4">
        <Text className="text-white text-center">We need your permission to show the camera</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 w-full bg-black relative">
      <CameraView
        className="flex-1"
        facing={facing}
      />

      {/* Target Reticle Overlay - Placeholder for TFJS Bounding Boxes */}
      <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
        <View className="border-2 border-red-500/50 w-3/4 h-1/2 rounded-md" />
        <View className="absolute top-4 left-4 bg-red-500/80 px-2 py-1 rounded">
          <Text className="text-white text-xs font-bold w-12 text-center flex-row">
            <View className="w-2 h-2 bg-white rounded-full mr-1" />
            LIVE REC
          </Text>
        </View>
        <Text className="absolute bottom-4 left-4 text-white font-bold opacity-80 text-xs">
          Scanning Viewport...
        </Text>
      </View>

      {label && (
        <View className="absolute bottom-0 w-full bg-black/60 p-2">
          <Text className="text-white font-bold text-center text-sm">{label}</Text>
        </View>
      )}
    </View>
  );
}
