import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useAgent } from "@/lib/agent-context";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { useVoiceListener } from "@/hooks/use-voice-listener";

export default function HomeScreen() {
  const router = useRouter();
  const { agentName, isListening, setIsListening, getDailySummary } = useAgent();
  const { isAuthenticated, loading: authLoading } = useAuth({ autoFetch: false });
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [listeningError, setListeningError] = useState<string | null>(null);

  const { startListening, stopListening } = useVoiceListener({
    onActivityDetected: () => {
      setListeningError(null);
    },
    onError: (error) => {
      console.error("[HomeScreen] Voice error:", error);
      setListeningError(error.message);
      setIsListening(false);
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleToggleListening = async () => {
    try {
      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      if (isListening) {
        stopListening();
        setIsListening(false);
      } else {
        setIsListening(true);
        await startListening();
      }
    } catch (error) {
      console.error("[HomeScreen] Failed to toggle listening:", error);
      setListeningError("Failed to toggle listening");
      setIsListening(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  };

  if (authLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  const dailySummary = getDailySummary();

  return (
    <ScreenContainer className="p-6">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View className="flex-1 gap-6">
          {/* Agent Status Card */}
          <View
            className="bg-surface border border-border rounded-2xl p-6"
            style={{ borderColor: colors.border, backgroundColor: colors.surface }}
          >
            <Text className="text-sm text-muted font-medium mb-2">Your AI Agent</Text>
            <Text className="text-3xl font-bold text-primary mb-3">{agentName || "Agent"}</Text>
            <View className="flex-row items-center gap-2">
              <View
                className={`w-3 h-3 rounded-full ${isListening ? "bg-success" : "bg-muted"}`}
                style={{ backgroundColor: isListening ? colors.success : colors.muted }}
              />
              <Text className="text-sm text-foreground">
                {isListening ? "Listening..." : "Standby"}
              </Text>
            </View>
          </View>

          {/* Listening Control */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={handleToggleListening}
              className={`py-6 rounded-full items-center justify-center border-2 ${
                isListening ? "bg-primary/10 border-primary" : "bg-surface border-border"
              }`}
              style={{
                backgroundColor: isListening ? `${colors.primary}20` : colors.surface,
                borderColor: isListening ? colors.primary : colors.border,
              }}
            >
              <Text className="text-5xl mb-2">{isListening ? "🎤" : "🔇"}</Text>
              <Text className="text-base font-semibold text-foreground">
                {isListening ? "Stop Listening" : "Start Listening"}
              </Text>
              <Text className="text-xs text-muted mt-1">
                Say "{agentName || "Agent"}" to activate
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {listeningError && (
            <View className="bg-error/10 border border-error rounded-lg p-3">
              <Text className="text-error text-sm">{listeningError}</Text>
            </View>
          )}

          {/* Daily Activity Summary */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Today's Summary</Text>
            <View
              className="bg-surface border border-border rounded-lg p-4"
              style={{ borderColor: colors.border, backgroundColor: colors.surface }}
            >
              <Text className="text-sm text-foreground leading-relaxed">{dailySummary}</Text>
            </View>
          </View>

          {/* Quick Action Buttons */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={() => router.push("/activities")}
              className="bg-surface border border-border rounded-lg p-4 active:opacity-70 flex-row items-center justify-between"
              style={{ borderColor: colors.border, backgroundColor: colors.surface }}
            >
              <View>
                <Text className="text-base font-semibold text-foreground">View Activities</Text>
                <Text className="text-xs text-muted">See all logged activities</Text>
              </View>
              <Text className="text-xl">→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/qa")}
              className="bg-surface border border-border rounded-lg p-4 active:opacity-70 flex-row items-center justify-between"
              style={{ borderColor: colors.border, backgroundColor: colors.surface }}
            >
              <View>
                <Text className="text-base font-semibold text-foreground">Ask a Question</Text>
                <Text className="text-xs text-muted">Get AI-powered answers</Text>
              </View>
              <Text className="text-xl">→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/settings")}
              className="bg-surface border border-border rounded-lg p-4 active:opacity-70 flex-row items-center justify-between"
              style={{ borderColor: colors.border, backgroundColor: colors.surface }}
            >
              <View>
                <Text className="text-base font-semibold text-foreground">Settings</Text>
                <Text className="text-xs text-muted">Manage your agent and preferences</Text>
              </View>
              <Text className="text-xl">→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
