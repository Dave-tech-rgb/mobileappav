import React from "react";
import { View } from "react-native";
import LiveCamera from "./LiveCamera";

interface MultiCameraProps {
  updateDetections?: (detections: any[]) => void;
}

export default function MultiCamera({ updateDetections }: MultiCameraProps) {
  const locations = [
    "Puerto",
    "Cugman",
    "Bukidnon",
    "Lapasan"
  ];

  return (
    <View className="flex-row flex-wrap justify-between">
      {locations.map((loc, index) => (
        <View key={index} className="w-[48%] aspect-square mb-4 rounded-xl overflow-hidden bg-black border border-gray-200">
          <LiveCamera label={loc} updateDetections={updateDetections} />
        </View>
      ))}
    </View>
  );
}

