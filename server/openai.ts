import OpenAI from "openai";
import { type ParsedTaskResult, parsedTaskResultSchema } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function parseNaturalLanguageTask(input: string): Promise<ParsedTaskResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a task parsing assistant. Parse natural language task descriptions into structured data.

Extract the following information:
- taskName: The main task description (what needs to be done)
- assignee: The person assigned to the task (if mentioned, otherwise use "Unassigned")
- dueDate: The due date and time in a human-readable format (if mentioned, otherwise use "No due date")
- priority: P1 (Critical), P2 (High), P3 (Normal), or P4 (Low) - default to P3 unless explicitly mentioned

Examples:
- "Finish landing page Aman by 11pm 20th June" → taskName: "Finish landing page", assignee: "Aman", dueDate: "11:00 PM, 20 June", priority: "P3"
- "Call client Rajeev tomorrow 5pm" → taskName: "Call client", assignee: "Rajeev", dueDate: "5:00 PM, Tomorrow", priority: "P3"
- "Review P1 documents Sarah by Friday" → taskName: "Review documents", assignee: "Sarah", dueDate: "Friday", priority: "P1"

Respond with JSON in this exact format: { "taskName": string, "assignee": string, "dueDate": string, "priority": "P1"|"P2"|"P3"|"P4" }`
        },
        {
          role: "user",
          content: input,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate the result using Zod schema
    return parsedTaskResultSchema.parse(result);
  } catch (error) {
    console.error("Failed to parse natural language task:", error);
    throw new Error("Failed to parse task description. Please try rephrasing your input.");
  }
}
