import React from "react";
import { View, Text, ScrollView } from "react-native";

export default function DetectionLogs() {
  const logs = [
    {
      id: 1,
      type: "Car",
      confidence: "92%",
      date: "Feb 20, 2026",
      time: "6:15 PM",
    },
    {
      id: 2,
      type: "Motorcycle",
      confidence: "88%",
      date: "Feb 20, 2026",
      time: "6:17 PM",
    },
    {
      id: 3,
      type: "Truck",
      confidence: "95%",
      date: "Feb 20, 2026",
      time: "6:19 PM",
    },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50 px-4 pt-4" contentContainerStyle={{ paddingBottom: 40}}>
      <Text className="text-2xl font-bold text-slate-900 mb-6">Detection Logs</Text>

      <View className="flex-col">
        {logs.map((log) => (
          <View 
            key={log.id} 
            className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4 flex-row justify-between items-center"
          >
            <View>
              <Text className="text-lg font-bold text-slate-800">{log.type}</Text>
              <Text className="text-sm text-slate-500 mt-1">Confidence: {log.confidence}</Text>
            </View>
            <View className="items-end">
              <Text className="text-slate-700 font-medium">{log.date}</Text>
              <Text className="text-slate-400 text-sm mt-1">{log.time}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
