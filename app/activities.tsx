import { ScrollView, Text, View, TouchableOpacity, FlatList, RefreshControl } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useAgent, Activity } from "@/lib/agent-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function ActivitiesScreen() {
  const router = useRouter();
  const { activities, deleteActivity } = useAgent();
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  };

  const handleDeleteActivity = async (id: string) => {
    try {
      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await deleteActivity(id);
    } catch (error) {
      console.error("[ActivitiesScreen] Failed to delete activity:", error);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const renderActivityItem = ({ item }: { item: Activity }) => (
    <View
      className="bg-surface border border-border rounded-lg p-4 mb-3 flex-row items-start justify-between"
      style={{ borderColor: colors.border, backgroundColor: colors.surface }}
    >
      <View className="flex-1 mr-3">
        <View className="flex-row items-center gap-2 mb-1">
          <Text className="text-sm font-semibold text-foreground">{item.speaker}</Text>
          <Text className="text-xs text-muted">{formatTime(item.timestamp)}</Text>
        </View>
        <Text className="text-sm text-foreground leading-relaxed">{item.description}</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleDeleteActivity(item.id)}
        className="p-2 active:opacity-70"
      >
        <Text className="text-lg">✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenContainer className="p-6">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-2xl font-bold text-foreground">Activities</Text>
          <Text className="text-sm text-muted">{activities.length} logged</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} className="p-2 active:opacity-70">
          <Text className="text-xl">✕</Text>
        </TouchableOpacity>
      </View>

      {/* Activities List */}
      {activities.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3">
          <Text className="text-4xl">📭</Text>
          <Text className="text-base font-semibold text-foreground">No activities yet</Text>
          <Text className="text-sm text-muted text-center">
            Start listening to log your first activity
          </Text>
        </View>
      ) : (
        <FlatList
          data={activities}
          renderItem={renderActivityItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        />
      )}
    </ScreenContainer>
  );
}
