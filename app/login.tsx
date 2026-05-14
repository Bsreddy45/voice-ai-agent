import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { startOAuthLogin } from "@/constants/oauth";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useColors } from "@/hooks/use-colors";

export default function LoginScreen() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth({ autoFetch: true });
  const colors = useColors();

  // If already authenticated, redirect to agent setup or home
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/agent-setup");
    }
  }, [isAuthenticated, loading, router]);

  const handleGoogleLogin = async () => {
    try {
      await startOAuthLogin();
    } catch (error) {
      console.error("[LoginScreen] OAuth login failed:", error);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-8 justify-center">
          {/* Hero Section */}
          <View className="items-center gap-4">
            <View className="w-24 h-24 bg-primary rounded-full items-center justify-center mb-4">
              <Text className="text-5xl">🤖</Text>
            </View>
            <Text className="text-4xl font-bold text-foreground text-center">Voice AI Agent</Text>
            <Text className="text-base text-muted text-center leading-relaxed">
              Create your personal AI assistant that listens, learns, and summarizes your daily activities.
            </Text>
          </View>

          {/* Features Section */}
          <View className="gap-4">
            <View className="flex-row gap-3 items-start">
              <Text className="text-2xl">🎤</Text>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">Voice Recognition</Text>
                <Text className="text-sm text-muted">Listen for wake-word and recognize different voices</Text>
              </View>
            </View>

            <View className="flex-row gap-3 items-start">
              <Text className="text-2xl">📝</Text>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">Activity Logging</Text>
                <Text className="text-sm text-muted">Automatically log and summarize your daily activities</Text>
              </View>
            </View>

            <View className="flex-row gap-3 items-start">
              <Text className="text-2xl">💡</Text>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">AI-Powered Q&A</Text>
                <Text className="text-sm text-muted">Ask questions and get intelligent answers instantly</Text>
              </View>
            </View>
          </View>

          {/* Login Button */}
          <View className="gap-4">
            <TouchableOpacity
              onPress={handleGoogleLogin}
              className="bg-primary px-6 py-4 rounded-full active:opacity-80"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-background font-semibold text-center text-base">
                Sign in with Google
              </Text>
            </TouchableOpacity>

            <Text className="text-xs text-muted text-center">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
