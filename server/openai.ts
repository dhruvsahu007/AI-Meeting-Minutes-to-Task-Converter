import OpenAI from "openai";
import { type ParsedTaskResult, parsedTaskResultSchema, type ParsedTranscriptResult, parsedTranscriptResultSchema } from "@shared/schema";

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

export async function parseMeetingTranscript(transcript: string): Promise<ParsedTranscriptResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a meeting transcript parser that extracts tasks and assignments from meeting notes.

Analyze the transcript and extract ALL tasks that are assigned to people. Each task should include:
- taskName: The main task description (what needs to be done)
- assignee: The person assigned to the task
- dueDate: The due date and time in a human-readable format (if mentioned, otherwise use "No due date")
- priority: P1 (Critical), P2 (High), P3 (Normal), or P4 (Low) - default to P3 unless explicitly mentioned

Examples of what to extract:
- "Aman you take the landing page by 10pm tomorrow" → taskName: "Take the landing page", assignee: "Aman", dueDate: "10:00 PM, Tomorrow", priority: "P3"
- "Rajeev you take care of client follow-up by Wednesday" → taskName: "Client follow-up", assignee: "Rajeev", dueDate: "Wednesday", priority: "P3"
- "Shreya please review the marketing deck tonight" → taskName: "Review the marketing deck", assignee: "Shreya", dueDate: "Tonight", priority: "P3"

Look for action words like: take, do, complete, finish, review, call, contact, prepare, send, update, create, etc.
Look for assignment patterns like: "X you", "X please", "X needs to", "X should", "X will", etc.

Respond with JSON in this exact format: { "tasks": [{ "taskName": string, "assignee": string, "dueDate": string, "priority": "P1"|"P2"|"P3"|"P4" }] }`
        },
        {
          role: "user",
          content: transcript,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate the result using Zod schema
    return parsedTranscriptResultSchema.parse(result);
  } catch (error) {
    console.error("Failed to parse meeting transcript:", error);
    throw new Error("Failed to parse meeting transcript. Please try with a different transcript.");
  }
}
