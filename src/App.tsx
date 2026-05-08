import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import LiveCamera from "./pages/LiveCamera";
import DetectionLogs from "./pages/DetectionLogs";
import Dashboard from "./pages/Dashboard";
import DeviceManagement from "./pages/DeviceManagement";
import UserManagement from "./pages/UserManagement";

export default function App() {
  const [user, setUser] = useState<{name: string} | null>(null);
  const [authView, setAuthView] = useState<"login" | "signup">("login");
  const [view, setView] = useState<"dashboard" | "camera" | "logs" | "devices" | "users">("dashboard");

  const handleLogout = () => {
    setUser(null);
    setView("dashboard");
    setAuthView("login");
  };

  if (!user) {
    return authView === "login" 
      ? <Login setUser={setUser} switchToSignup={() => setAuthView("signup")} />
      : <Signup setUser={setUser} switchToLogin={() => setAuthView("login")} />;
  }

  const renderView = () => {
    switch (view) {
      case "dashboard": return <Dashboard user={user} setUser={setUser} />;
      case "camera": return <LiveCamera deviceId={null} />;
      case "logs": return <DetectionLogs />;
      case "devices": return <DeviceManagement />;
      case "users": return <UserManagement />;
      default: return <Dashboard user={user} setUser={setUser} />;
    }
  };

  const navItems: Array<{id: typeof view, label: string}> = [
    { id: "dashboard", label: "Home" },
    { id: "camera", label: "Live" },
    { id: "logs", label: "Logs" },
    { id: "devices", label: "Devices" },
    { id: "users", label: "Users" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <Text className="text-xl font-bold text-slate-900">AutoVision</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text className="text-red-500 font-medium">Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View className="flex-1 bg-gray-100">
        {renderView()}
      </View>

      {/* Bottom Navigation */}
      <View className="flex-row bg-white border-t border-gray-200 px-2 py-3 justify-around items-center pb-2">
        {navItems.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            onPress={() => setView(item.id)}
            className={`px-3 py-2 rounded-full ${view === item.id ? 'bg-slate-900' : 'bg-transparent'}`}
          >
            <Text className={`text-sm font-medium ${view === item.id ? 'text-white' : 'text-slate-500'}`}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}
