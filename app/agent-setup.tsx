import { ScreenContainer } from "@/components/screen-container";
import { useAgent } from "@/lib/agent-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function AgentSetupScreen() {
  const router = useRouter();
  const { setAgentName } = useAgent();
  const colors = useColors();
  const [agentName, setAgentNameInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateAgent = async () => {
    if (!agentName.trim()) {
      setError("Please enter an agent name");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Trigger haptic feedback
      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      await setAgentName(agentName.trim());

      // Redirect to home dashboard
      router.replace("/(tabs)");
    } catch (err) {
      console.error("[AgentSetup] Failed to create agent:", err);
      setError("Failed to create agent. Please try again.");
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-8 justify-center">
          {/* Header */}
          <View className="items-center gap-3">
            <Text className="text-4xl font-bold text-foreground">Name Your Agent</Text>
            <Text className="text-base text-muted text-center leading-relaxed">
              Choose a name for your AI assistant. You'll use this name to activate the listening mode.
            </Text>
          </View>

          {/* Input Section */}
          <View className="gap-4">
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Agent Name</Text>
              <TextInput
                placeholder="e.g., Alex, Sam, Jordan"
                placeholderTextColor={colors.muted}
                value={agentName}
                onChangeText={(text) => {
                  setAgentNameInput(text);
                  setError(null);
                }}
                editable={!loading}
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                style={{
                  color: colors.foreground,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                }}
              />
            </View>

            {error && (
              <View className="bg-error/10 border border-error rounded-lg p-3">
                <Text className="text-error text-sm">{error}</Text>
              </View>
            )}

            {/* Preview */}
            {agentName.trim() && (
              <View className="bg-primary/10 border border-primary rounded-lg p-4">
                <Text className="text-sm text-muted mb-2">Your agent will be called:</Text>
                <Text className="text-2xl font-bold text-primary">{agentName.trim()}</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={handleCreateAgent}
              disabled={loading || !agentName.trim()}
              className="bg-primary px-6 py-4 rounded-full active:opacity-80"
              style={{
                backgroundColor: colors.primary,
                opacity: loading || !agentName.trim() ? 0.5 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <Text className="text-background font-semibold text-center text-base">
                  Create Agent
                </Text>
              )}
            </TouchableOpacity>

            <Text className="text-xs text-muted text-center">
              You can change your agent's name later in settings
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
