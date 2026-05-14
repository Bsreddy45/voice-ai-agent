import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { Platform } from "react-native";

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  speaker: string;
  duration: number;
}

/**
 * Initialize audio mode for recording
 */
export async function initializeAudioMode() {
  try {
    // Request microphone permission
    const status = await requestRecordingPermissionsAsync();
    if (!status.granted) {
      throw new Error("Microphone permission denied");
    }

    // Set audio mode
    await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: true,
      interruptionMode: 1, // INTERRUPT_MODE_DO_NOT_MIX
    });

    console.log("[VoiceService] Audio mode initialized");
  } catch (error) {
    console.error("[VoiceService] Failed to initialize audio mode:", error);
    throw error;
  }
}

/**
 * Record audio for a specified duration (simplified for now)
 * In production, this would be called from within a React component using the hook
 */
export async function recordAudio(durationMs: number = 5000): Promise<string> {
  // This is a placeholder - actual recording happens in the useVoiceListener hook
  // which has access to React hooks
  console.log("[VoiceService] recordAudio called (placeholder)");
  return "";
}

/**
 * Transcribe audio using the backend API
 */
export async function transcribeAudio(audioUri: string): Promise<VoiceRecognitionResult> {
  try {
    // Convert audio file to base64 for sending to API
    const response = await fetch("/api/trpc/voice.transcribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioUri }),
    });

    if (!response.ok) {
      throw new Error("Transcription failed");
    }

    const data = await response.json();
    const result = data.result?.data;

    return {
      transcript: result?.transcript || "",
      confidence: result?.confidence || 0.5,
      speaker: result?.speaker || "Unknown",
      duration: result?.duration || 0,
    };
  } catch (error) {
    console.error("[VoiceService] Failed to transcribe audio:", error);
    throw error;
  }
}

/**
 * Detect wake word in transcribed text
 */
export function detectWakeWord(transcript: string, agentName: string): boolean {
  const lowerTranscript = transcript.toLowerCase();
  const lowerAgentName = agentName.toLowerCase();

  // Check if the agent name appears at the beginning or with "hey" prefix
  return (
    lowerTranscript.startsWith(lowerAgentName) ||
    lowerTranscript.startsWith(`hey ${lowerAgentName}`) ||
    lowerTranscript.includes(`hey ${lowerAgentName}`)
  );
}

/**
 * Extract speaker fingerprint from audio
 * This is a simplified implementation - in production, you'd use ML models
 */
export function generateSpeakerFingerprint(audioUri: string): string {
  // For now, return a hash-like identifier based on the URI
  // In production, this would analyze audio characteristics
  return `speaker_${audioUri.split("/").pop()?.substring(0, 8) || "unknown"}`;
}

/**
 * Recognize speaker from audio characteristics
 * This is a simplified implementation
 */
export async function recognizeSpeaker(audioUri: string): Promise<string> {
  try {
    // Call backend to analyze speaker
    const response = await fetch("/api/trpc/voice.recognizeSpeaker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioUri }),
    });

    if (!response.ok) {
      throw new Error("Speaker recognition failed");
    }

    const data = await response.json();
    return data.result?.data?.speaker || "Unknown Speaker";
  } catch (error) {
    console.error("[VoiceService] Failed to recognize speaker:", error);
    return "Unknown Speaker";
  }
}
