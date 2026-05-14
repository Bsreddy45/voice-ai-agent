import { describe, it, expect } from "vitest";
import { invokeLLM } from "../server/_core/llm";

describe("OpenAI API Integration", () => {
  it("should successfully call the LLM with a simple question", async () => {
    const result = await invokeLLM({
      messages: [
        {
          role: "user",
          content: "What is 2+2?",
        },
      ],
      maxTokens: 100,
    });

    expect(result).toBeDefined();
    expect(result.choices).toBeDefined();
    expect(result.choices.length).toBeGreaterThan(0);
    expect(result.choices[0].message).toBeDefined();
    expect(result.choices[0].message.content).toBeDefined();

    // The response should contain something about 4
    const content = result.choices[0].message.content;
    expect(typeof content === "string" ? content : "").toBeTruthy();
  });

  it("should handle a conversational question", async () => {
    const result = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant.",
        },
        {
          role: "user",
          content: "Tell me a short fact about the moon.",
        },
      ],
      maxTokens: 200,
    });

    expect(result).toBeDefined();
    expect(result.choices).toBeDefined();
    expect(result.choices.length).toBeGreaterThan(0);
    expect(result.choices[0].message.content).toBeTruthy();
  });
});
