import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import LiveCamera from "./LiveCamera";
import { deviceAPI } from "../service/api";
import { useAutoVision } from "../hooks/useAutoVision";

interface Device {
  id: string | number;
  name: string;
  location: string;
  status: string;
  deviceId: string;
}

export default function DeviceManagement() {
  const [devices, setDevices] = useState<Device[]>([]);
  const { formData, handleInputChange, resetForm } = useAutoVision();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await deviceAPI.getAll();
      setDevices(res.data);
    } catch (error) {
      console.error("Failed to fetch devices:", error);
    } finally {
      setLoading(false);
    }
  };

  const addDevice = async () => {
    const name = formData.name || "";
    const location = formData.location || "";
    // In React Native, Expo Camera handles selection differently, so we assign a generic device ID
    // or let the backend assign one if it's external. Here we simulate default "front" / "back".
    const deviceId = formData.deviceId || "back";

    if (!name.trim() || !location.trim()) {
      return; // Could show an alert here
    }

    try {
      const res = await deviceAPI.add(name, location, deviceId);
      setDevices([...devices, res.data]);
      resetForm();
    } catch (error) {
      console.error("Failed to add device:", error);
    }
  };

  const deleteDevice = async (id: string | number) => {
    try {
      await deviceAPI.remove(id);
      setDevices(devices.filter((d) => d.id !== id));
    } catch (error) {
      console.error("Failed to delete device:", error);
    }
  };

  const toggleStatus = async (id: string | number) => {
    const device = devices.find((d) => d.id === id);
    if (!device) return;
    const newStatus = device.status === "Online" ? "Offline" : "Online";

    try {
      await deviceAPI.updateStatus(id, newStatus);
      setDevices(
        devices.map((d) =>
          d.id === id ? { ...d, status: newStatus } : d
        )
      );
    } catch (error) {
      console.error("Failed to toggle status:", error);
    }
  };

  const filteredDevices = devices.filter(
    (d) =>
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView className="flex-1 bg-gray-50 px-4 pt-4" contentContainerStyle={{ paddingBottom: 40}}>
      <Text className="text-2xl font-bold text-slate-900 mb-6">Device Management</Text>

      {/* Search */}
      <View className="mb-6">
        <TextInput
          className="h-12 bg-white border border-gray-200 rounded-xl px-4 text-slate-900 shadow-sm"
          placeholder="Search devices..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Add Device Form */}
      <View className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
        <Text className="text-lg font-bold text-slate-800 mb-4">Add Camera</Text>
        
        <TextInput
          className="h-12 border border-gray-200 rounded-lg px-4 mb-3 text-slate-900 bg-gray-50"
          placeholder="Camera Name"
          placeholderTextColor="#9ca3af"
          value={formData.name || ""}
          onChangeText={(text: string) => handleInputChange(text, "name")}
        />
        <TextInput
          className="h-12 border border-gray-200 rounded-lg px-4 mb-3 text-slate-900 bg-gray-50"
          placeholder="Location"
          placeholderTextColor="#9ca3af"
          value={formData.location || ""}
          onChangeText={(text: string) => handleInputChange(text, "location")}
        />
        
        <View className="flex-row gap-2 mb-4">
          <TouchableOpacity 
            className={`flex-1 h-12 rounded-lg items-center justify-center border ${formData.deviceId === 'back' || !formData.deviceId ? 'bg-slate-900 border-slate-900' : 'bg-gray-50 border-gray-300'}`}
            onPress={() => handleInputChange('back', 'deviceId')}
          >
            <Text className={`font-medium ${formData.deviceId === 'back' || !formData.deviceId ? 'text-white' : 'text-slate-600'}`}>Back Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 h-12 rounded-lg items-center justify-center border ${formData.deviceId === 'front' ? 'bg-slate-900 border-slate-900' : 'bg-gray-50 border-gray-300'}`}
            onPress={() => handleInputChange('front', 'deviceId')}
          >
            <Text className={`font-medium ${formData.deviceId === 'front' ? 'text-white' : 'text-slate-600'}`}>Front Camera</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          className="h-12 bg-blue-600 rounded-lg items-center justify-center"
          onPress={addDevice}
        >
          <Text className="text-white font-bold text-base">Add Camera</Text>
        </TouchableOpacity>
      </View>

      {/* Camera Grid */}
      <View>
        <Text className="text-lg font-bold text-slate-800 mb-4">Cameras ({filteredDevices.length})</Text>
        
        {loading ? (
           <ActivityIndicator size="large" color="#0f172a" />
        ) : filteredDevices.map((device) => (
          <View key={device.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4">
            <View className="flex-row justify-between items-start mb-2">
              <View>
                <Text className="text-lg font-bold text-slate-900">{device.name}</Text>
                <Text className="text-sm text-slate-500 mt-1">Location: {device.location}</Text>
              </View>
              <View className="flex-row items-center border border-gray-200 rounded-full px-3 py-1">
                <View className={`w-2.5 h-2.5 rounded-full mr-2 ${device.status === 'Online' ? 'bg-green-500' : 'bg-red-500'}`} />
                <Text className="text-sm font-medium text-slate-700">{device.status}</Text>
              </View>
            </View>

            {device.status === "Online" && (
              <View className="h-48 rounded-lg overflow-hidden my-3 border border-gray-200 bg-gray-100 items-center justify-center relative">
                {/* Expo Camera Feed implementation */}
                <LiveCamera deviceId={device.deviceId} />
              </View>
            )}

            <View className="flex-row gap-2 mt-3 pt-3 border-t border-gray-100">
              <TouchableOpacity 
                className="flex-1 bg-gray-100 h-10 rounded-lg items-center justify-center"
                onPress={() => toggleStatus(device.id)}
              >
                <Text className="text-slate-700 font-medium">Toggle Status</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 bg-red-50 h-10 rounded-lg items-center justify-center"
                onPress={() => deleteDevice(device.id)}
              >
                <Text className="text-red-600 font-medium">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}
