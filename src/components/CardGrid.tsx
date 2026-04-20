import React from "react";
import { View, Text } from "react-native";

interface CardGridProps {
  title: string;
  data: any[];
  renderItem: (item: any) => React.ReactNode;
}

export default function CardGrid({ title, data, renderItem }: CardGridProps) {
  return (
    <View className="mb-6">
      <Text className="text-xl font-bold text-slate-800 mb-4">{title}</Text>
      
      <View className="flex-row flex-wrap justify-between">
        {data.length === 0 ? (
          <Text className="text-slate-500 italic px-2">No data available.</Text>
        ) : (
          data.map((item) => (
            <View 
              key={item.id} 
              className="w-[48%] bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4"
            >
              {renderItem(item)}
            </View>
          ))
        )}
      </View>
    </View>
  );
}
