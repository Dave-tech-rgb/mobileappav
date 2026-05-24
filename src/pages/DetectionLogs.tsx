import React, { useState, useMemo } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { Detection } from "../App";

interface DetectionLogsProps {
  recentDetections: Detection[];
  detectionStats: Record<string, number>;
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

export default function DetectionLogs({
  recentDetections = [],
  detectionStats = {},
}: DetectionLogsProps) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const today = new Date().toLocaleDateString();

  // Filter to today's detections only
  const todayLogs = useMemo(() =>
    recentDetections.filter((log) => {
      const logDate = new Date(log.timestamp || Date.now()).toLocaleDateString();
      return logDate === today;
    }),
    [recentDetections, today]
  );

  const totalToday = todayLogs.length || 0;

  // Count per type for today
  const todayStats = useMemo(() => {
    const counts: Record<string, number> = {};
    VEHICLE_TYPES.forEach((t) => (counts[t] = 0));
    todayLogs.forEach((log) => {
      const label = log.type?.toLowerCase();
      if (label in counts) counts[label]++;
    });
    return counts;
  }, [todayLogs]);

  // Filtered table rows
  const filtered = useMemo(() => {
    return recentDetections.filter((log) => {
      const matchType = filter === "all" || log.type?.toLowerCase() === filter;
      const matchSearch = log.type?.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [recentDetections, filter, search]);

  return (
    <ScrollView className="flex-1 bg-gray-50 px-4 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
      <Text className="text-2xl font-bold text-slate-900 mb-2">Detection Logs</Text>
      
      {/* Date & Counts Header */}
      <Text className="text-sm text-slate-500 mb-6">
        Today: {today} — {totalToday} detection(s) so far
      </Text>

      {/* Vehicle Type Breakdown — today only */}
      <View className="mb-6">
        <Text className="text-lg font-bold text-slate-900 mb-4">
          Vehicle Type Breakdown <Text className="text-sm text-slate-400 font-medium">(today)</Text>
        </Text>
        <View className="flex-row flex-wrap justify-between">
          {VEHICLE_TYPES.map((type) => {
            const count = todayStats[type] || 0;
            const pct = totalToday === 0 ? "0.0" : ((count / totalToday) * 100).toFixed(1);
            const color = COLORS[type];
            return (
              <View key={type} className="w-[48%] bg-white p-3 rounded-xl border border-gray-200 shadow-sm mb-3">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-sm font-bold capitalize" style={{ color }}>
                    {type}
                  </Text>
                  <Text className="text-xs font-semibold text-slate-800">{pct}%</Text>
                </View>

                {/* Progress Bar */}
                <View className="bg-gray-100 h-1.5 rounded-full overflow-hidden mb-2">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%` as any,
                      backgroundColor: color,
                    }}
                  />
                </View>

                <Text className="text-[10px] text-slate-400">{count} detected today</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Search and Filters */}
      <View className="mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <Text className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Search & Filter</Text>
        <TextInput
          className="h-12 border border-gray-200 rounded-lg px-4 bg-gray-50 mb-3 text-slate-900"
          placeholder="Search vehicle type..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row py-1">
          <TouchableOpacity
            onPress={() => setFilter("all")}
            className={`px-4 py-1.5 rounded-full mr-2 border ${
              filter === "all" ? "bg-slate-900 border-slate-900" : "bg-white border-gray-200"
            }`}
          >
            <Text className={`text-xs font-semibold ${filter === "all" ? "text-white" : "text-slate-600"}`}>
              All Types
            </Text>
          </TouchableOpacity>
          {VEHICLE_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setFilter(type)}
              className={`px-4 py-1.5 rounded-full mr-2 border capitalize ${
                filter === type ? "bg-slate-900 border-slate-900" : "bg-white border-gray-200"
              }`}
            >
              <Text className={`text-xs font-semibold ${filter === type ? "text-white" : "text-slate-600"}`}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Detections List */}
      <View>
        <Text className="text-lg font-bold text-slate-900 mb-4">All Detections ({filtered.length})</Text>
        {filtered.length === 0 ? (
          <View className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm items-center justify-center">
            <Text className="text-slate-400 font-medium">No detections found matching filters</Text>
          </View>
        ) : (
          filtered.map((log, i) => {
            const color = COLORS[log.type?.toLowerCase()] || "#888";
            const pct = parseFloat(log.confidence);
            return (
              <View
                key={i}
                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-3 flex-row justify-between items-center"
              >
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center mb-1">
                    <View
                      className="px-2.5 py-0.5 rounded-md mr-2"
                      style={{ backgroundColor: color }}
                    >
                      <Text className="text-[11px] font-bold uppercase text-black">
                        {log.type}
                      </Text>
                    </View>
                    <Text className="text-sm font-semibold text-slate-800">
                      {log.confidence}
                    </Text>
                  </View>

                  {/* Progress Bar */}
                  <View className="bg-gray-100 h-1 rounded-full overflow-hidden w-24">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: color,
                      }}
                    />
                  </View>
                </View>

                <View className="items-end">
                  <Text className="text-xs font-semibold text-slate-700">{log.time}</Text>
                  <Text className="text-[9px] text-slate-400 mt-0.5">#{i + 1}</Text>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

