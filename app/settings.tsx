import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useAgent } from "@/lib/agent-context";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function SettingsScreen() {
  const router = useRouter();
  const { agentName, setAgentName, clearActivities } = useAgent();
  const { logout } = useAuth();
  const colors = useColors();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(agentName || "");
  const [loading, setLoading] = useState(false);

  const handleSaveAgentName = async () => {
    if (!newName.trim()) {
      return;
    }

    try {
      setLoading(true);
      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      await setAgentName(newName.trim());
      setEditingName(false);

      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("[SettingsScreen] Failed to save agent name:", error);
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearActivities = () => {
    Alert.alert(
      "Clear All Activities",
      "Are you sure you want to delete all logged activities? This cannot be undone.",
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              setLoading(true);
              await clearActivities();
              if (Platform.OS !== "web") {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            } catch (error) {
              console.error("[SettingsScreen] Failed to clear activities:", error);
            } finally {
              setLoading(false);
            }
          },
          style: "destructive",
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", onPress: () => {}, style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          try {
            setLoading(true);
            await logout();
            router.replace("/login");
          } catch (error) {
            console.error("[SettingsScreen] Logout failed:", error);
          } finally {
            setLoading(false);
          }
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold text-foreground">Settings</Text>
          <TouchableOpacity onPress={() => router.back()} className="p-2 active:opacity-70">
            <Text className="text-xl">✕</Text>
          </TouchableOpacity>
        </View>

        {/* Agent Settings Section */}
        <View className="gap-4 mb-6">
          <Text className="text-base font-semibold text-foreground">Agent Settings</Text>

          {/* Agent Name */}
          <View
            className="bg-surface border border-border rounded-lg p-4"
            style={{ borderColor: colors.border, backgroundColor: colors.surface }}
          >
            <Text className="text-sm text-muted mb-2">Agent Name</Text>
            {editingName ? (
              <View className="gap-3">
                <TextInput
                  placeholder="Enter agent name"
                  placeholderTextColor={colors.muted}
                  value={newName}
                  onChangeText={setNewName}
                  editable={!loading}
                  className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                  style={{
                    color: colors.foreground,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  }}
                />
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={handleSaveAgentName}
                    disabled={loading || !newName.trim()}
                    className="flex-1 bg-primary py-2 rounded-lg active:opacity-80"
                    style={{
                      backgroundColor: colors.primary,
                      opacity: loading || !newName.trim() ? 0.5 : 1,
                    }}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color={colors.background} />
                    ) : (
                      <Text className="text-background font-semibold text-center">Save</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingName(false);
                      setNewName(agentName || "");
                    }}
                    disabled={loading}
                    className="flex-1 bg-surface border border-border py-2 rounded-lg active:opacity-80"
                    style={{ borderColor: colors.border, backgroundColor: colors.surface }}
                  >
                    <Text className="text-foreground font-semibold text-center">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-semibold text-foreground">{agentName || "Not set"}</Text>
                <TouchableOpacity
                  onPress={() => setEditingName(true)}
                  className="p-2 active:opacity-70"
                >
                  <Text className="text-primary">Edit</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Data Management Section */}
        <View className="gap-4 mb-6">
          <Text className="text-base font-semibold text-foreground">Data Management</Text>

          <TouchableOpacity
            onPress={handleClearActivities}
            disabled={loading}
            className="bg-error/10 border border-error rounded-lg p-4 active:opacity-70"
            style={{
              borderColor: colors.error,
              backgroundColor: `${colors.error}20`,
              opacity: loading ? 0.5 : 1,
            }}
          >
            <Text className="text-error font-semibold">Clear All Activities</Text>
            <Text className="text-error text-sm mt-1">Delete all logged activities permanently</Text>
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View className="gap-4">
          <Text className="text-base font-semibold text-foreground">Account</Text>

          <TouchableOpacity
            onPress={handleLogout}
            disabled={loading}
            className="bg-error/10 border border-error rounded-lg p-4 active:opacity-70"
            style={{
              borderColor: colors.error,
              backgroundColor: `${colors.error}20`,
              opacity: loading ? 0.5 : 1,
            }}
          >
            <Text className="text-error font-semibold">Logout</Text>
            <Text className="text-error text-sm mt-1">Sign out from your account</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View className="gap-2 mt-8 pt-6 border-t border-border">
          <Text className="text-xs text-muted text-center">Voice AI Agent v1.0.0</Text>
          <Text className="text-xs text-muted text-center">
            Built with React Native and Expo
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
