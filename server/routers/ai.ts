import { z } from "zod";
import { publicProcedure, router } from "../\_core/trpc";
import * as LLMHelper from "../\_core/llm-helper";

export const aiRouter = router({
  /**
   * Ask a question and get AI-powered answer
   */
  askQuestion: publicProcedure
    .input(
      z.object({
        question: z.string().describe("User question"),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        console.log("[AIRouter] Processing question:", input.question);

        // Use the backend's LLM service to generate answer
        const answer = await LLMHelper.generateAnswer(input.question);

        return {
          question: input.question,
          answer: answer || "I couldn't generate an answer to that question.",
        };
      } catch (error) {
        console.error("[AIRouter] Failed to answer question:", error);
        throw new Error("Failed to generate answer");
      }
    }),

  /**
   * Generate activity summary from text
   */
  generateSummary: publicProcedure
    .input(
      z.object({
        activities: z
          .array(
            z.object({
              description: z.string(),
              speaker: z.string(),
              timestamp: z.number(),
            }),
          )
          .describe("List of activities to summarize"),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        console.log("[AIRouter] Generating summary for", input.activities.length, "activities");

        // Format activities for summarization
        const activitiesText = input.activities
          .map((a) => `${new Date(a.timestamp).toLocaleTimeString()}: ${a.speaker} - ${a.description}`)
          .join("\n");

        const prompt = `Summarize the following daily activities in 2-3 sentences:\n\n${activitiesText}`;

        const summary = await LLMHelper.generateAnswer(prompt);

        return {
          summary: summary || "No summary available.",
        };
      } catch (error) {
        console.error("[AIRouter] Failed to generate summary:", error);
        throw new Error("Failed to generate summary");
      }
    }),
});
