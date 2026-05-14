import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import * as VoiceTranscription from "../_core/voiceTranscription";

export const voiceRouter = router({
  /**
   * Transcribe audio file to text
   */
  transcribe: publicProcedure
    .input(
      z.object({
        audioUri: z.string().describe("URI or base64 encoded audio data"),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        console.log("[VoiceRouter] Transcribing audio...");

        // Use the backend's voice transcription service
        const result = await VoiceTranscription.transcribeAudio(input.audioUri);

        return {
          transcript: result.transcript || "",
          confidence: result.confidence || 0.5,
          speaker: result.speaker || "Unknown",
          duration: result.duration || 0,
        };
      } catch (error) {
        console.error("[VoiceRouter] Transcription failed:", error);
        throw new Error("Failed to transcribe audio");
      }
    }),

  /**
   * Recognize speaker from audio
   */
  recognizeSpeaker: publicProcedure
    .input(
      z.object({
        audioUri: z.string().describe("URI or base64 encoded audio data"),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        console.log("[VoiceRouter] Recognizing speaker...");

        // For now, return a simple speaker identifier
        // In production, integrate with speaker recognition ML models
        const speaker = `Speaker_${Date.now().toString().slice(-6)}`;

        return {
          speaker,
          confidence: 0.7,
        };
      } catch (error) {
        console.error("[VoiceRouter] Speaker recognition failed:", error);
        throw new Error("Failed to recognize speaker");
      }
    }),

  /**
   * Detect wake word in transcribed text
   */
  detectWakeWord: publicProcedure
    .input(
      z.object({
        transcript: z.string().describe("Transcribed text"),
        agentName: z.string().describe("Agent name to detect"),
      }),
    )
    .query(({ input }) => {
      try {
        const lowerTranscript = input.transcript.toLowerCase();
        const lowerAgentName = input.agentName.toLowerCase();

        const detected =
          lowerTranscript.startsWith(lowerAgentName) ||
          lowerTranscript.startsWith(`hey ${lowerAgentName}`) ||
          lowerTranscript.includes(`hey ${lowerAgentName}`);

        return {
          detected,
          transcript: input.transcript,
        };
      } catch (error) {
        console.error("[VoiceRouter] Wake word detection failed:", error);
        throw new Error("Failed to detect wake word");
      }
    }),
});
