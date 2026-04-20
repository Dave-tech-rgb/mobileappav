import React from "react";
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";
import MultiCamera from "./MultiCamera";
import CardGrid from "../components/CardGrid";

interface DashboardProps {
  user: { name: string };
  setUser: (user: any) => void;
}

export default function Dashboard({ user, setUser }: DashboardProps) {
  const stats = [
    { id: 1, label: "Total Vehicles", value: 12 },
    { id: 2, label: "Cars", value: 6 },
    { id: 3, label: "Motorcycles", value: 4 },
    { id: 4, label: "Trucks", value: 2 },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50 px-4 pt-4" contentContainerStyle={{ paddingBottom: 40}}>
      {/* Header handled by App.tsx, but we can put dashboard title here */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-slate-900">Dashboard</Text>
        <Text className="text-slate-500 mt-1">Welcome back, {user.name}</Text>
      </View>

      {/* Stats Grid */}
      <View className="flex-row flex-wrap justify-between mb-8">
        {stats.map((stat) => (
          <View 
            key={stat.id} 
            className="w-[48%] bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4"
          >
            <Text className="text-3xl font-bold text-slate-800">{stat.value}</Text>
            <Text className="text-sm text-slate-500 font-medium mt-1">{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Camera Access */}
      <View className="mb-8">
        <Text className="text-lg font-bold text-slate-900 mb-4">Active Feeds</Text>
        <View className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm p-4">
           {/* Assuming MultiCamera fits in a block */}
           <MultiCamera />
        </View>
      </View>
    </ScrollView>
  );
}
