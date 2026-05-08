import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from "react-native";
import { userAPI, auditAPI } from "../service/api";
import { useAutoVision } from "../hooks/useAutoVision";

interface User {
  id: string | number;
  name: string;
  role: string;
}

interface AuditLogEntry {
  time: string;
  action: string;
  user: string;
  role: string;
}

const ROLES = ["Admin", "Operator", "Viewer"];

export default function UserManagement() {
  // Use the custom hook for the "Add User" form inputs
  const { formData, handleInputChange, resetForm } = useAutoVision();

  const [users, setUsers] = useState<User[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  
  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [editingRoleId, setEditingRoleId] = useState<string | number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([fetchUsers(), fetchAuditLogs()]);
    setIsLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const res = await userAPI.getAll();
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await auditAPI.getAll();
      setAuditLog(res.data);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    }
  };

  // Helper to add entry to Audit Trail
  const addLogEntry = async (action: string, userName: string, role: string) => {
    try {
      await auditAPI.add(action, userName, role);
      fetchAuditLogs(); // Refresh logs list to get newest from the backend
    } catch (error) {
      console.error("Failed to post audit log:", error);
    }
  };

  const simulatedChange = (name: string, value: string) => {
    // Bridge React Native inputs to the existing web hook
    if (handleInputChange) {
      handleInputChange({ target: { name, value } } as any);
    }
  };

  const addUser = async () => {
    if (!formData.newName?.trim()) return;

    try {
      const res = await userAPI.add(formData.newName, formData.newRole || "Viewer");
      const newUser = res.data;
      setUsers([...users, newUser]);
      addLogEntry("Add User", newUser.name, newUser.role);
      resetForm(); // Clears the input fields using the hook
    } catch (error) {
      console.error("Failed to add user:", error);
    }
  };

  const removeUser = async (id: string | number) => {
    const target = users.find((u: User) => u.id === id);
    if (!target) return;

    try {
      await userAPI.remove(id);
      setUsers(users.filter((u: User) => u.id !== id));
      addLogEntry("Remove User", target.name, target.role);
    } catch (error) {
      console.error("Failed to remove user:", error);
    }
  };

  const changeRole = async (id: string | number, updatedRole: string) => {
    const target = users.find((u: User) => u.id === id);
    if (!target) return;

    try {
      await userAPI.updateRole(id, updatedRole);
      setUsers(
        users.map((u: User) => (u.id === id ? { ...u, role: updatedRole } : u))
      );
      addLogEntry("Change Role", target.name, updatedRole);
      setEditingRoleId(null);
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const getRoleBgColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin": return "bg-sky-100";
      case "operator": return "bg-yellow-100";
      case "viewer": return "bg-gray-100";
      default: return "bg-gray-100";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ paddingBottom: 40 }}>
          <Text className="text-2xl font-bold text-slate-900 mb-6">User Management</Text>

          {/* --- Add User Section --- */}
          <View className="bg-white p-4 rounded-xl border border-gray-200 mb-6 shadow-sm">
            <Text className="text-lg font-semibold text-slate-800 mb-3">Add New User</Text>
            
            <TextInput
              className="h-12 border border-gray-300 rounded-lg px-4 bg-white mb-3 text-slate-900"
              placeholder="Enter user name"
              placeholderTextColor="#9ca3af"
              value={formData.newName || ""}
              onChangeText={(text: string) => simulatedChange("newName", text)}
            />
            
            <Text className="text-sm font-medium text-slate-600 mb-2">Role:</Text>
            <View className="flex-row gap-2 mb-4">
              {ROLES.map((role) => {
                const isActive = (formData.newRole || "Viewer") === role;
                return (
                  <TouchableOpacity
                    key={role}
                    onPress={() => simulatedChange("newRole", role)}
                    className={`flex-1 py-2 rounded-lg border items-center justify-center ${
                      isActive ? 'bg-slate-900 border-slate-900' : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <Text className={`font-medium ${isActive ? 'text-white' : 'text-slate-600'}`}>
                      {role}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity 
              onPress={addUser}
              disabled={!formData.newName?.trim()}
              className={`h-12 rounded-lg items-center justify-center ${
                formData.newName?.trim() ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <Text className="text-white font-semibold text-base">Add User</Text>
            </TouchableOpacity>
          </View>

          {/* --- User List Section --- */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-slate-800 mb-3">Current Users</Text>
            
            {isLoading ? (
              <ActivityIndicator size="large" color="#0f172a" className="my-4" />
            ) : users.length === 0 ? (
              <Text className="text-gray-500 italic">No users found.</Text>
            ) : (
              users.map((user: User) => (
                <View 
                  key={user.id} 
                  className={`p-4 mb-3 border border-gray-200 rounded-xl flex-col ${getRoleBgColor(user.role)}`}
                >
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-base font-bold text-slate-900">{user.name}</Text>
                      <Text className="text-sm text-slate-600">{user.role}</Text>
                    </View>
                    
                    <View className="flex-row items-center gap-2">
                      <TouchableOpacity 
                        onPress={() => setEditingRoleId(editingRoleId === user.id ? null : user.id)}
                        className="bg-white px-3 py-1.5 rounded-md border border-gray-300"
                      >
                        <Text className="text-slate-700 text-sm font-medium">Edit Role</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => removeUser(user.id)}
                        className="bg-red-500 px-3 py-1.5 rounded-md"
                      >
                        <Text className="text-white text-sm font-medium">Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Inline Role Editor */}
                  {editingRoleId === user.id && (
                    <View className="mt-4 pt-3 border-t border-gray-200/50">
                      <Text className="text-xs font-medium text-slate-500 mb-2 uppercase">Select New Role</Text>
                      <View className="flex-row gap-2">
                        {ROLES.map((role) => {
                          const isActive = user.role === role;
                          return (
                            <TouchableOpacity
                              key={role}
                              onPress={() => changeRole(user.id, role)}
                              className={`flex-1 py-1.5 rounded-md border items-center justify-center ${
                                isActive ? 'bg-slate-900 border-slate-900' : 'bg-white border-gray-300'
                              }`}
                            >
                              <Text className={`text-xs font-medium ${isActive ? 'text-white' : 'text-slate-600'}`}>
                                {role}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>

          {/* --- Audit Trail Section --- */}
          <View className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <Text className="text-lg font-semibold text-slate-800 mb-3">System Audit Trail</Text>
            
            <View className="h-48">
              {isLoading ? (
                <ActivityIndicator size="small" color="#0f172a" className="my-4" />
              ) : auditLog.length === 0 ? (
                <Text className="text-gray-500 italic mt-2">No recent activity.</Text>
              ) : (
                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                  {auditLog.map((log: AuditLogEntry, idx: number) => (
                    <View key={idx} className="mb-3 flex-row">
                      <Text className="text-xs text-slate-500 mr-2 w-20">[{log.time}]</Text>
                      <View className="flex-1">
                        <Text className="text-sm text-slate-800">
                          <Text className="font-bold">{log.action}: </Text>
                          {log.user} assigned as {log.role}
                        </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
