import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { authAPI } from "../service/api";
import { useAutoVision } from "../hooks/useAutoVision";

interface SignupProps {
  setUser: (user: any) => void;
  switchToLogin: () => void;
}

export default function Signup({ setUser, switchToLogin }: SignupProps) {
  const { formData, handleInputChange } = useAutoVision();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (formData.email && formData.password) {
      setLoading(true);
      try {
        await authAPI.register(formData.email, formData.password);
        setUser({ name: formData.email });
      } catch (err: any) {
        if (err.response) {
          setError(err.response.data.error || "Signup failed");
        } else if (err.code === "ECONNABORTED") {
          setError("Server is starting up. Please wait 30 seconds and try again.");
        } else {
          setError("Cannot reach server. Check your connection or try again shortly.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900 justify-center">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 justify-center px-6">
        
        <View className="mb-10 mt-10">
          <Text className="text-4xl font-extrabold text-white text-center tracking-wide">AutoVision</Text>
          <Text className="text-slate-400 text-center mt-3 text-base">
            Create an account to access the system
          </Text>
        </View>

        <View className="bg-white p-6 rounded-2xl shadow-lg">
          <Text className="text-2xl font-bold text-slate-800 mb-6 text-center">Sign Up</Text>
          
          {error ? <Text className="text-red-500 text-center mb-4 font-medium">{error}</Text> : null}

          <View className="space-y-4 mb-4" style={{ gap: 16 }}>
            <TextInput
              className="h-14 bg-gray-50 border border-gray-200 rounded-xl px-4 text-slate-900 text-base"
              placeholder="Email Address"
              placeholderTextColor="#9ca3af"
              value={formData.email || ""}
              onChangeText={(text: string) => handleInputChange(text, "email")}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              className="h-14 bg-gray-50 border border-gray-200 rounded-xl px-4 text-slate-900 text-base"
              placeholder="Choose Password"
              placeholderTextColor="#9ca3af"
              value={formData.password || ""}
              onChangeText={(text: string) => handleInputChange(text, "password")}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            className="h-14 bg-blue-600 rounded-xl items-center justify-center mt-2 flex-row"
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Create Account</Text>}
          </TouchableOpacity>
        </View>

        <View className="mt-8 flex-row justify-center">
          <Text className="text-slate-400">Already have an account? </Text>
          <TouchableOpacity onPress={switchToLogin}>
            <Text className="text-blue-400 font-bold">Log In</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
