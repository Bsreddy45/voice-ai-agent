import { useCallback, useEffect, useRef, useState } from "react";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { useAgent } from "@/lib/agent-context";
import { detectWakeWord, transcribeAudio } from "@/lib/voice-service";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export interface UseVoiceListenerOptions {
  onActivityDetected?: (speaker: string, description: string) => void;
  onError?: (error: Error) => void;
}

export function useVoiceListener(options?: UseVoiceListenerOptions) {
  const { agentName, addActivity } = useAgent();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio mode on mount
  useEffect(() => {
    const initAudio = async () => {
      try {
        const status = await requestRecordingPermissionsAsync();
        if (!status.granted) {
          throw new Error("Microphone permission denied");
        }

        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
          interruptionMode: 1,
        });

        setIsInitialized(true);
        console.log("[useVoiceListener] Audio initialized");
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to initialize audio");
        setError(error);
        options?.onError?.(error);
        console.error("[useVoiceListener] Initialization failed:", error);
      }
    };

    initAudio();
  }, [options]);

  const startListening = useCallback(async () => {
    if (!isInitialized || !agentName) {
      console.warn("[useVoiceListener] Not initialized or agent name missing");
      return;
    }

    try {
      setError(null);
      setIsRecording(true);

      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Simulate continuous listening by recording in chunks
      // In production, you'd use a more sophisticated wake-word detection service
      await listenForWakeWord();
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to start listening");
      setError(error);
      options?.onError?.(error);
      console.error("[useVoiceListener] Listening failed:", error);
    } finally {
      setIsRecording(false);
    }
  }, [isInitialized, agentName, options]);

  const listenForWakeWord = useCallback(async () => {
    // This is a simplified implementation
    // In production, you'd integrate with a proper wake-word detection service
    // like Google Cloud Speech-to-Text with custom wake-word models

    const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

    try {
      // Prepare recorder
      await recorder.prepareToRecordAsync();

      // Record for 10 seconds
      recorder.record();

      // Wait for recording
      await new Promise((resolve) => {
        recordingTimeoutRef.current = setTimeout(resolve, 10000);
      });

      // Stop recording
      await recorder.stop();

      if (!recorder.uri) {
        throw new Error("No audio recorded");
      }

      // Transcribe audio
      const result = await transcribeAudio(recorder.uri);

      // Check for wake word
      if (detectWakeWord(result.transcript, agentName)) {
        console.log("[useVoiceListener] Wake word detected:", result.transcript);

        if (Platform.OS !== "web") {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        // Add activity
        await addActivity(result.speaker, result.transcript);
        options?.onActivityDetected?.(result.speaker, result.transcript);
      } else {
        console.log("[useVoiceListener] No wake word detected:", result.transcript);
      }
    } catch (err) {
      console.error("[useVoiceListener] Wake word detection failed:", err);
      throw err;
    }
  }, [agentName, addActivity, options]);

  const stopListening = useCallback(() => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
    setIsRecording(false);
  }, []);

  return {
    isInitialized,
    isRecording,
    error,
    startListening,
    stopListening,
  };
}
