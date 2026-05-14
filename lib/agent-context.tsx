import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface Activity {
  id: string;
  timestamp: number;
  speaker: string;
  description: string;
}

export interface AgentState {
  agentName: string | null;
  activities: Activity[];
  isListening: boolean;
}

interface AgentContextType {
  agentName: string | null;
  activities: Activity[];
  isListening: boolean;
  setAgentName: (name: string) => Promise<void>;
  addActivity: (speaker: string, description: string) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  clearActivities: () => Promise<void>;
  setIsListening: (listening: boolean) => void;
  getDailySummary: () => string;
  getTodayActivities: () => Activity[];
  loadState: () => Promise<void>;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

const AGENT_NAME_KEY = "voice_agent_name";
const ACTIVITIES_KEY = "voice_agent_activities";

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [agentName, setAgentNameState] = useState<string | null>(null);
  const [activities, setActivitiesState] = useState<Activity[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from AsyncStorage on mount
  const loadState = useCallback(async () => {
    try {
      const [storedName, storedActivities] = await Promise.all([
        AsyncStorage.getItem(AGENT_NAME_KEY),
        AsyncStorage.getItem(ACTIVITIES_KEY),
      ]);

      if (storedName) {
        setAgentNameState(storedName);
      }

      if (storedActivities) {
        try {
          const parsed = JSON.parse(storedActivities);
          setActivitiesState(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          console.error("[AgentContext] Failed to parse activities:", e);
          setActivitiesState([]);
        }
      }
    } catch (error) {
      console.error("[AgentContext] Failed to load state:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadState();
  }, [loadState]);

  const setAgentName = useCallback(
    async (name: string) => {
      try {
        await AsyncStorage.setItem(AGENT_NAME_KEY, name);
        setAgentNameState(name);
      } catch (error) {
        console.error("[AgentContext] Failed to set agent name:", error);
        throw error;
      }
    },
    [],
  );

  const addActivity = useCallback(
    async (speaker: string, description: string) => {
      try {
        const newActivity: Activity = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          speaker,
          description,
        };

        const updated = [newActivity, ...activities];
        await AsyncStorage.setItem(ACTIVITIES_KEY, JSON.stringify(updated));
        setActivitiesState(updated);
      } catch (error) {
        console.error("[AgentContext] Failed to add activity:", error);
        throw error;
      }
    },
    [activities],
  );

  const deleteActivity = useCallback(
    async (id: string) => {
      try {
        const updated = activities.filter((a) => a.id !== id);
        await AsyncStorage.setItem(ACTIVITIES_KEY, JSON.stringify(updated));
        setActivitiesState(updated);
      } catch (error) {
        console.error("[AgentContext] Failed to delete activity:", error);
        throw error;
      }
    },
    [activities],
  );

  const clearActivities = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(ACTIVITIES_KEY);
      setActivitiesState([]);
    } catch (error) {
      console.error("[AgentContext] Failed to clear activities:", error);
      throw error;
    }
  }, []);

  const getTodayActivities = useCallback(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return activities.filter((a) => a.timestamp >= startOfDay.getTime());
  }, [activities]);

  const getDailySummary = useCallback(() => {
    const todayActivities = getTodayActivities();

    if (todayActivities.length === 0) {
      return "No activities logged today. Start listening to log your first activity!";
    }

    // Group by speaker
    const bySpeaker: Record<string, number> = {};
    todayActivities.forEach((a) => {
      bySpeaker[a.speaker] = (bySpeaker[a.speaker] || 0) + 1;
    });

    const speakers = Object.entries(bySpeaker)
      .map(([speaker, count]) => `${speaker} (${count})`)
      .join(", ");

    // Get time range
    const firstActivity = todayActivities[todayActivities.length - 1];
    const lastActivity = todayActivities[0];

    const firstTime = new Date(firstActivity.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const lastTime = new Date(lastActivity.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${todayActivities.length} activities logged today (${firstTime} - ${lastTime}) from: ${speakers}`;
  }, [getTodayActivities]);

  const value: AgentContextType = useMemo(
    () => ({
      agentName,
      activities,
      isListening,
      setAgentName,
      addActivity,
      deleteActivity,
      clearActivities,
      setIsListening,
      getDailySummary,
      getTodayActivities,
      loadState,
    }),
    [
      agentName,
      activities,
      isListening,
      setAgentName,
      addActivity,
      deleteActivity,
      clearActivities,
      getDailySummary,
      getTodayActivities,
      loadState,
    ],
  );

  if (!isLoaded) {
    return null; // Wait for state to load
  }

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>;
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error("useAgent must be used within AgentProvider");
  }
  return context;
}
