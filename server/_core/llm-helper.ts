import { invokeLLM, type Message } from "./llm";

/**
 * Generate an answer to a question using the LLM
 */
export async function generateAnswer(question: string): Promise<string> {
  try {
    const messages: Message[] = [
      {
        role: "system",
        content:
          "You are a helpful AI assistant. Provide clear, concise, and accurate answers to user questions.",
      },
      {
        role: "user",
        content: question,
      },
    ];

    const result = await invokeLLM({
      messages,
      maxTokens: 1024,
    });

    // Extract the text response
    if (result.choices && result.choices.length > 0) {
      const message = result.choices[0].message;
      if (typeof message.content === "string") {
        return message.content;
      }
    }

    return "Unable to generate a response.";
  } catch (error) {
    console.error("[LLMHelper] Failed to generate answer:", error);
    throw error;
  }
}

/**
 * Generate a summary from a list of activities
 */
export async function generateActivitySummary(activities: string[]): Promise<string> {
  try {
    const activitiesText = activities.join("\n");

    const messages: Message[] = [
      {
        role: "system",
        content:
          "You are a helpful assistant that summarizes daily activities. Provide a concise 2-3 sentence summary of the activities provided.",
      },
      {
        role: "user",
        content: `Summarize these daily activities:\n\n${activitiesText}`,
      },
    ];

    const result = await invokeLLM({
      messages,
      maxTokens: 512,
    });

    // Extract the text response
    if (result.choices && result.choices.length > 0) {
      const message = result.choices[0].message;
      if (typeof message.content === "string") {
        return message.content;
      }
    }

    return "Unable to generate a summary.";
  } catch (error) {
    console.error("[LLMHelper] Failed to generate summary:", error);
    throw error;
  }
}
