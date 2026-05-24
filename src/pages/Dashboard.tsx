import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import MultiCamera from "./MultiCamera";
import { Detection } from "../App";

interface DashboardProps {
  user: { name: string };
  setUser: (user: any) => void;
  detectionStats: Record<string, number>;
  recentDetections: Detection[];
  updateDetections: (detections: any[]) => void;
}

const VEHICLE_TYPES = ["bicycle", "bus", "car", "jeepney", "motorcycle", "tricycle", "truck", "van"];

const COLORS: Record<string, string> = {
  bicycle:    "#00FFFF",
  bus:        "#0066FF",
  car:        "#00FF00",
  jeepney:    "#FF00FF",
  motorcycle: "#FFFF00",
  tricycle:   "#FF6600",
  truck:      "#FF0000",
  van:        "#FF69B4",
};

export default function Dashboard({
  user,
  detectionStats,
  recentDetections,
  updateDetections,
}: DashboardProps) {
  const [filter, setFilter] = useState("All");

  const filteredDetections =
    filter === "All"
      ? recentDetections
      : recentDetections.filter((v) => v.type?.toLowerCase() === filter.toLowerCase());

  return (
    <ScrollView className="flex-1 bg-gray-50 px-4 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-slate-900">Vehicle Detection Dashboard</Text>
        <Text className="text-slate-500 mt-1">Welcome, {user.name}</Text>
      </View>

      {/* Stats Grid */}
      <View className="mb-6">
        {/* Total Card */}
        <View className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm mb-4">
          <Text className="text-4xl font-bold text-white">{detectionStats.total || 0}</Text>
          <Text className="text-sm text-slate-400 font-semibold mt-1">Total Vehicles</Text>
        </View>

        {/* 8 Types in 3-column layout */}
        <View className="flex-row flex-wrap justify-between">
          {VEHICLE_TYPES.map((type) => {
            const count = detectionStats[type] || 0;
            const color = COLORS[type];
            return (
              <View
                key={type}
                className="w-[31%] bg-white p-3 rounded-xl border border-gray-200 shadow-sm mb-3"
                style={{ borderTopWidth: 4, borderTopColor: color }}
              >
                <Text className="text-xl font-bold text-slate-800">{count}</Text>
                <Text className="text-xs text-slate-500 font-medium mt-1 capitalize">{type}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Filter by Type */}
      <View className="mb-6">
        <Text className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Filter by Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row py-1">
          <TouchableOpacity
            onPress={() => setFilter("All")}
            className={`px-4 py-2 rounded-full mr-2 border ${
              filter === "All" ? "bg-slate-900 border-slate-900" : "bg-white border-gray-200"
            }`}
          >
            <Text className={`text-sm font-semibold ${filter === "All" ? "text-white" : "text-slate-600"}`}>
              All
            </Text>
          </TouchableOpacity>
          {VEHICLE_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setFilter(type)}
              className={`px-4 py-2 rounded-full mr-2 border capitalize ${
                filter === type ? "bg-slate-900 border-slate-900" : "bg-white border-gray-200"
              }`}
            >
              <Text className={`text-sm font-semibold ${filter === type ? "text-white" : "text-slate-600"}`}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* MultiCamera */}
      <View className="mb-6">
        <MultiCamera updateDetections={updateDetections} />
      </View>

      {/* Recent Detections */}
      <View className="mb-6">
        <Text className="text-lg font-bold text-slate-900 mb-4">Recent Detections</Text>
        {recentDetections.length === 0 ? (
          <View className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm items-center justify-center">
            <Text className="text-slate-400 font-medium">No detections yet — active feeds will stream data</Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {filteredDetections.slice(0, 8).map((det, i) => {
              const color = COLORS[det.type?.toLowerCase()] || "#888";
              const pct = parseFloat(det.confidence);
              return (
                <View
                  key={i}
                  className="w-[48%] bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4"
                  style={{ borderTopWidth: 4, borderTopColor: color }}
                >
                  <Text className="text-lg font-bold capitalize mb-1" style={{ color }}>
                    {det.type}
                  </Text>
                  <Text className="text-xs text-slate-500 font-medium mb-2">
                    Confidence: {det.confidence}
                  </Text>

                  {/* Progress Bar */}
                  <View className="bg-gray-150 h-1.5 rounded-full overflow-hidden mb-2" style={{ backgroundColor: "#f3f4f6" }}>
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: color,
                      }}
                    />
                  </View>

                  <Text className="text-[10px] text-slate-400 text-right">{det.time}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

