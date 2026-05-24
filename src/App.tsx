import React, { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import LiveCamera from "./pages/LiveCamera";
import DetectionLogs from "./pages/DetectionLogs";
import Dashboard from "./pages/Dashboard";
import DeviceManagement from "./pages/DeviceManagement";
import UserManagement from "./pages/UserManagement";

const VEHICLE_TYPES = ["bicycle", "bus", "car", "jeepney", "motorcycle", "tricycle", "truck", "van"];

const defaultStats = {
  total: 0,
  bicycle: 0,
  bus: 0,
  car: 0,
  jeepney: 0,
  motorcycle: 0,
  tricycle: 0,
  truck: 0,
  van: 0,
};

export interface Detection {
  type: string;
  confidence: string;
  confidenceRaw: number;
  time: string;
  timestamp: string;
}

export default function App() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [authView, setAuthView] = useState<"login" | "signup">("login");
  const [view, setView] = useState<"dashboard" | "camera" | "logs" | "devices" | "users">("dashboard");

  const [detectionStats, setDetectionStats] = useState(defaultStats);
  const [recentDetections, setRecentDetections] = useState<Detection[]>([]);

  const updateDetections = (detections: any[]) => {
    if (!detections || detections.length === 0) return;

    setDetectionStats((prev) => {
      const updated = { ...prev };
      detections.forEach((det) => {
        const label = det.class?.toLowerCase();
        if (VEHICLE_TYPES.includes(label)) {
          updated[label as keyof typeof defaultStats] = (updated[label as keyof typeof defaultStats] || 0) + 1;
          updated.total += 1;
        }
      });
      return updated;
    });

    setRecentDetections((prev) => {
      const newEntries = detections.map((det) => ({
        type: det.class,
        confidence: (det.confidence * 100).toFixed(0) + "%",
        confidenceRaw: det.confidence,
        time: new Date().toLocaleTimeString(),
        timestamp: new Date().toISOString(),
      }));
      return [...newEntries, ...prev].slice(0, 50);
    });
  };

  const handleLogout = () => {
    setUser(null);
    setView("dashboard");
    setAuthView("login");
    setDetectionStats(defaultStats);
    setRecentDetections([]);
  };

  if (!user) {
    return authView === "login"
      ? <Login setUser={setUser} switchToSignup={() => setAuthView("signup")} />
      : <Signup setUser={setUser} switchToLogin={() => setAuthView("login")} />;
  }

  const renderView = () => {
    switch (view) {
      case "dashboard":
        return (
          <Dashboard
            user={user}
            setUser={setUser}
            detectionStats={detectionStats}
            recentDetections={recentDetections}
            updateDetections={updateDetections}
          />
        );
      case "camera":
        return <LiveCamera deviceId={null} updateDetections={updateDetections} />;
      case "logs":
        return <DetectionLogs recentDetections={recentDetections} detectionStats={detectionStats} />;
      case "devices":
        return <DeviceManagement />;
      case "users":
        return <UserManagement />;
      default:
        return (
          <Dashboard
            user={user}
            setUser={setUser}
            detectionStats={detectionStats}
            recentDetections={recentDetections}
            updateDetections={updateDetections}
          />
        );
    }
  };

  const navItems: Array<{ id: typeof view; label: string }> = [
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
            className={`px-3 py-2 rounded-full ${view === item.id ? "bg-slate-900" : "bg-transparent"}`}
          >
            <Text className={`text-sm font-medium ${view === item.id ? "text-white" : "text-slate-500"}`}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

