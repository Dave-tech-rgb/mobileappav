import React from "react";
import { View, Text } from "react-native";
import LiveCamera from "./LiveCamera";

export default function CameraFeed() {
  return (
    <View className="flex-1 bg-black w-full h-full justify-center">
      <View className="absolute top-10 left-0 w-full z-10 px-4">
        <Text className="text-white font-extrabold text-xl shadow-lg">Live Camera Feed</Text>
      </View>
      
      {/* 
        This is a full screen view wrapper. 
        In React Native, LiveCamera occupies the flex space.
      */}
      <LiveCamera />
    </View>
  );
}
