import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

interface QAPair {
  id: string;
  question: string;
  answer: string;
  timestamp: number;
}

const QA_HISTORY_KEY = "voice_agent_qa_history";

export default function QAScreen() {
  const router = useRouter();
  const colors = useColors();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [qaHistory, setQAHistory] = useState<QAPair[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load QA history from AsyncStorage
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const stored = await AsyncStorage.getItem(QA_HISTORY_KEY);
        if (stored) {
          setQAHistory(JSON.parse(stored));
        }
      } catch (err) {
        console.error("[QAScreen] Failed to load QA history:", err);
      }
    };
    loadHistory();
  }, []);

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      setError("Please enter a question");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Call the backend API to get AI response
      const response = await fetch("/api/trpc/ai.askQuestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ question: question.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to get answer");
      }

      const data = await response.json();
      const answer = data.result?.answer || "Sorry, I couldn't generate an answer.";

      // Add to history
      const newQAPair: QAPair = {
        id: Date.now().toString(),
        question: question.trim(),
        answer,
        timestamp: Date.now(),
      };

      const updated = [newQAPair, ...qaHistory];
      await AsyncStorage.setItem(QA_HISTORY_KEY, JSON.stringify(updated));
      setQAHistory(updated);
      setQuestion("");

      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      console.error("[QAScreen] Failed to ask question:", err);
      setError("Failed to get answer. Please try again.");
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderQAPair = ({ item }: { item: QAPair }) => (
    <View className="gap-3 mb-4">
      {/* Question */}
      <View
        className="bg-primary/10 rounded-lg p-3 ml-8"
        style={{ backgroundColor: `${colors.primary}20` }}
      >
        <Text className="text-sm text-foreground">{item.question}</Text>
      </View>

      {/* Answer */}
      <View
        className="bg-surface border border-border rounded-lg p-3 mr-8"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <Text className="text-sm text-foreground leading-relaxed">{item.answer}</Text>
        <Text className="text-xs text-muted mt-2">
          {new Date(item.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
      <ScreenContainer className="p-6">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold text-foreground">Ask a Question</Text>
          <TouchableOpacity onPress={() => router.back()} className="p-2 active:opacity-70">
            <Text className="text-xl">✕</Text>
          </TouchableOpacity>
        </View>

        {/* QA History */}
        <View className="flex-1 mb-4">
          {qaHistory.length === 0 ? (
            <View className="items-center justify-center gap-3 py-8">
              <Text className="text-4xl">💭</Text>
              <Text className="text-base font-semibold text-foreground">No questions yet</Text>
              <Text className="text-sm text-muted text-center">
                Ask your first question below to get started
              </Text>
            </View>
          ) : (
            <FlatList
              data={qaHistory}
              renderItem={renderQAPair}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              inverted
            />
          )}
        </View>

        {/* Error Message */}
        {error && (
          <View className="bg-error/10 border border-error rounded-lg p-3 mb-4">
            <Text className="text-error text-sm">{error}</Text>
          </View>
        )}

        {/* Input Section */}
        <View className="gap-3">
          <View className="flex-row gap-2">
            <TextInput
              placeholder="Ask me anything..."
              placeholderTextColor={colors.muted}
              value={question}
              onChangeText={(text) => {
                setQuestion(text);
                setError(null);
              }}
              editable={!loading}
              multiline
              className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              style={{
                color: colors.foreground,
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }}
            />
            <TouchableOpacity
              onPress={handleAskQuestion}
              disabled={loading || !question.trim()}
              className="bg-primary px-4 py-3 rounded-lg items-center justify-center active:opacity-80"
              style={{
                backgroundColor: colors.primary,
                opacity: loading || !question.trim() ? 0.5 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <Text className="text-xl">→</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}
